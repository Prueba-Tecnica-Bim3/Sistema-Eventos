using System.Security.Cryptography;
using AuthService.Application.Common;
using AuthService.Application.DTOs.Auth;
using AuthService.Application.Interfaces;
using AuthService.Application.Options;
using AuthService.Domain.Constants;
using AuthService.Domain.Entities;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace AuthService.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _users;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly IEmailService _emailService;
    private readonly AppOptions _appOptions;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        IUserRepository users,
        IUnitOfWork unitOfWork,
        IPasswordHasher passwordHasher,
        IJwtTokenService jwtTokenService,
        IEmailService emailService,
        IOptions<AppOptions> appOptions,
        ILogger<AuthService> logger)
    {
        _users = users;
        _unitOfWork = unitOfWork;
        _passwordHasher = passwordHasher;
        _jwtTokenService = jwtTokenService;
        _emailService = emailService;
        _appOptions = appOptions.Value;
        _logger = logger;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default)
    {
        var email = NormalizeEmail(request.Email);

        if (await _users.EmailExistsAsync(email, cancellationToken))
            throw new AppException("Correo ya registrado", ErrorCodes.EmailAlreadyExists, 409);

        var role = await _users.GetRoleByNameAsync(Roles.Default, cancellationToken)
            ?? throw new AppException("Rol por defecto no configurado", ErrorCodes.InternalError, 500);

        var user = new User
        {
            Name = request.Name.Trim(),
            Email = email,
            PasswordHash = _passwordHasher.Hash(request.Password),
            EmailVerified = false,
            IsActive = true
        };

        user.UserRoles.Add(new UserRole
        {
            UserId = user.Id,
            RoleId = role.Id
        });

        await _users.AddAsync(user, cancellationToken);

        var verificationToken = CreateSecureToken();
        await _users.AddEmailVerificationTokenAsync(new EmailVerificationToken
        {
            UserId = user.Id,
            Token = verificationToken,
            ExpiresAt = DateTime.UtcNow.AddHours(_appOptions.EmailVerificationTokenHours)
        }, cancellationToken);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        try
        {
            await SendVerificationEmailAsync(user.Email, user.Name, verificationToken, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "No se pudo enviar el correo de verificación a {Email}", user.Email);
        }

        var roles = new[] { role.Name };
        var (token, expiresAt) = _jwtTokenService.GenerateToken(user, roles);

        _logger.LogInformation("Usuario registrado: {UserId} {Email}", user.Id, user.Email);

        return new AuthResponse
        {
            AccessToken = token,
            ExpiresAt = expiresAt,
            User = MapProfile(user, roles)
        };
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
    {
        var email = NormalizeEmail(request.Email);
        var user = await _users.GetByEmailAsync(email, cancellationToken);

        if (user is null || !_passwordHasher.Verify(request.Password, user.PasswordHash))
            throw new AppException("Credenciales inválidas", ErrorCodes.InvalidCredentials, 401);

        if (!user.IsActive)
            throw new AppException("Usuario inactivo", ErrorCodes.UserInactive, 403);

        user.LastLoginAt = DateTime.UtcNow;
        _users.Update(user);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var roles = user.UserRoles.Select(ur => ur.Role.Name).ToList();
        var (token, expiresAt) = _jwtTokenService.GenerateToken(user, roles);

        _logger.LogInformation("Login exitoso: {UserId}", user.Id);

        return new AuthResponse
        {
            AccessToken = token,
            ExpiresAt = expiresAt,
            User = MapProfile(user, roles)
        };
    }

    public async Task<UserProfileDto> GetProfileAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await _users.GetByIdWithRolesAsync(userId, cancellationToken)
            ?? throw new AppException("Usuario no encontrado", ErrorCodes.UserNotFound, 404);

        var roles = user.UserRoles.Select(ur => ur.Role.Name).ToList();
        return MapProfile(user, roles);
    }

    public async Task<UserProfileDto> UpdateProfileAsync(Guid userId, UpdateProfileRequest request, CancellationToken cancellationToken = default)
    {
        var user = await _users.GetByIdWithRolesAsync(userId, cancellationToken)
            ?? throw new AppException("Usuario no encontrado", ErrorCodes.UserNotFound, 404);

        user.Name = request.Name.Trim();
        if (!string.IsNullOrWhiteSpace(request.ProfileImageUrl))
            user.ProfileImageUrl = request.ProfileImageUrl.Trim();

        user.UpdatedAt = DateTime.UtcNow;
        _users.Update(user);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var roles = user.UserRoles.Select(ur => ur.Role.Name).ToList();
        return MapProfile(user, roles);
    }

    public async Task ChangePasswordAsync(Guid userId, ChangePasswordRequest request, CancellationToken cancellationToken = default)
    {
        var user = await _users.GetByIdAsync(userId, cancellationToken)
            ?? throw new AppException("Usuario no encontrado", ErrorCodes.UserNotFound, 404);

        if (!_passwordHasher.Verify(request.CurrentPassword, user.PasswordHash))
            throw new AppException("Contraseña actual incorrecta", ErrorCodes.InvalidCredentials, 400);

        if (_passwordHasher.Verify(request.NewPassword, user.PasswordHash))
            throw new AppException("La nueva contraseña debe ser diferente a la actual", ErrorCodes.SamePassword, 400);

        user.PasswordHash = _passwordHasher.Hash(request.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;
        _users.Update(user);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Contraseña actualizada para usuario {UserId}", userId);
    }

    public async Task ForgotPasswordAsync(ForgotPasswordRequest request, CancellationToken cancellationToken = default)
    {
        var email = NormalizeEmail(request.Email);
        var user = await _users.GetByEmailAsync(email, cancellationToken);

        // Always succeed to avoid email enumeration
        if (user is null || !user.IsActive)
        {
            _logger.LogInformation("Forgot password solicitado para correo no existente o inactivo");
            return;
        }

        await _users.InvalidatePasswordResetTokensAsync(user.Id, cancellationToken);

        var resetToken = CreateSecureToken();
        await _users.AddPasswordResetTokenAsync(new PasswordResetToken
        {
            UserId = user.Id,
            Token = resetToken,
            ExpiresAt = DateTime.UtcNow.AddHours(_appOptions.PasswordResetTokenHours)
        }, cancellationToken);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        try
        {
            var resetUrl = $"{_appOptions.FrontendUrl.TrimEnd('/')}/reset-password?token={resetToken}";
            var body = $"""
                <p>Hola {user.Name},</p>
                <p>Recibimos una solicitud para restablecer tu contraseña.</p>
                <p><a href="{resetUrl}">Restablecer contraseña</a></p>
                <p>Si no solicitaste este cambio, ignora este mensaje.</p>
                <p>Token: {resetToken}</p>
                """;

            await _emailService.SendEmailAsync(user.Email, "Restablecer contraseña", body, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "No se pudo enviar correo de reset a {Email}", user.Email);
        }
    }

    public async Task ResetPasswordAsync(ResetPasswordRequest request, CancellationToken cancellationToken = default)
    {
        var tokenEntity = await _users.GetPasswordResetTokenAsync(request.Token, cancellationToken)
            ?? throw new AppException("Token inválido", ErrorCodes.InvalidToken, 400);

        if (tokenEntity.IsUsed)
            throw new AppException("Token ya utilizado", ErrorCodes.InvalidToken, 400);

        if (tokenEntity.ExpiresAt < DateTime.UtcNow)
            throw new AppException("Token expirado", ErrorCodes.TokenExpired, 400);

        var user = tokenEntity.User;
        if (!user.IsActive)
            throw new AppException("Usuario inactivo", ErrorCodes.UserInactive, 403);

        user.PasswordHash = _passwordHasher.Hash(request.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;
        tokenEntity.IsUsed = true;
        tokenEntity.UsedAt = DateTime.UtcNow;

        _users.Update(user);
        await _users.InvalidatePasswordResetTokensAsync(user.Id, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Password reset completado para {UserId}", user.Id);
    }

    public async Task VerifyEmailAsync(VerifyEmailRequest request, CancellationToken cancellationToken = default)
    {
        var tokenEntity = await _users.GetEmailVerificationTokenAsync(request.Token, cancellationToken)
            ?? throw new AppException("Token inválido", ErrorCodes.InvalidToken, 400);

        if (tokenEntity.IsUsed)
            throw new AppException("Token ya utilizado", ErrorCodes.InvalidToken, 400);

        if (tokenEntity.ExpiresAt < DateTime.UtcNow)
            throw new AppException("Token expirado", ErrorCodes.TokenExpired, 400);

        var user = tokenEntity.User;
        user.EmailVerified = true;
        user.UpdatedAt = DateTime.UtcNow;
        tokenEntity.IsUsed = true;
        tokenEntity.UsedAt = DateTime.UtcNow;

        _users.Update(user);
        await _users.InvalidateEmailVerificationTokensAsync(user.Id, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Email verificado para {UserId}", user.Id);
    }

    public async Task ResendVerificationAsync(ResendVerificationRequest request, CancellationToken cancellationToken = default)
    {
        var email = NormalizeEmail(request.Email);
        var user = await _users.GetByEmailAsync(email, cancellationToken);

        if (user is null || user.EmailVerified)
        {
            // Avoid enumeration
            return;
        }

        await _users.InvalidateEmailVerificationTokensAsync(user.Id, cancellationToken);

        var verificationToken = CreateSecureToken();
        await _users.AddEmailVerificationTokenAsync(new EmailVerificationToken
        {
            UserId = user.Id,
            Token = verificationToken,
            ExpiresAt = DateTime.UtcNow.AddHours(_appOptions.EmailVerificationTokenHours)
        }, cancellationToken);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        try
        {
            await SendVerificationEmailAsync(user.Email, user.Name, verificationToken, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "No se pudo reenviar verificación a {Email}", user.Email);
        }
    }

    private async Task SendVerificationEmailAsync(string email, string name, string token, CancellationToken cancellationToken)
    {
        var verifyUrl = $"{_appOptions.FrontendUrl.TrimEnd('/')}/verify-email?token={token}";
        var body = $"""
            <p>Hola {name},</p>
            <p>Gracias por registrarte. Verifica tu correo:</p>
            <p><a href="{verifyUrl}">Verificar email</a></p>
            <p>Token: {token}</p>
            """;

        await _emailService.SendEmailAsync(email, "Verifica tu correo", body, cancellationToken);
    }

    private static UserProfileDto MapProfile(User user, IEnumerable<string> roles) => new()
    {
        Id = user.Id,
        Name = user.Name,
        Email = user.Email,
        EmailVerified = user.EmailVerified,
        ProfileImageUrl = user.ProfileImageUrl,
        Roles = roles.ToList(),
        CreatedAt = user.CreatedAt,
        LastLoginAt = user.LastLoginAt
    };

    private static string NormalizeEmail(string email) => email.Trim().ToLowerInvariant();

    private static string CreateSecureToken()
    {
        var bytes = RandomNumberGenerator.GetBytes(32);
        return Convert.ToBase64String(bytes).Replace("+", "-").Replace("/", "_").TrimEnd('=');
    }
}

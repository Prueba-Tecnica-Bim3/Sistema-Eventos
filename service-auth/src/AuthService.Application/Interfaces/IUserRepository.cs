using AuthService.Domain.Entities;

namespace AuthService.Application.Interfaces;

public interface IUserRepository
{
    Task<User?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
    Task<User?> GetByIdWithRolesAsync(Guid id, CancellationToken cancellationToken = default);
    Task<bool> EmailExistsAsync(string email, CancellationToken cancellationToken = default);
    Task AddAsync(User user, CancellationToken cancellationToken = default);
    void Update(User user);
    Task<Role?> GetRoleByNameAsync(string roleName, CancellationToken cancellationToken = default);
    Task AddEmailVerificationTokenAsync(EmailVerificationToken token, CancellationToken cancellationToken = default);
    Task AddPasswordResetTokenAsync(PasswordResetToken token, CancellationToken cancellationToken = default);
    Task<EmailVerificationToken?> GetEmailVerificationTokenAsync(string token, CancellationToken cancellationToken = default);
    Task<PasswordResetToken?> GetPasswordResetTokenAsync(string token, CancellationToken cancellationToken = default);
    Task InvalidateEmailVerificationTokensAsync(Guid userId, CancellationToken cancellationToken = default);
    Task InvalidatePasswordResetTokensAsync(Guid userId, CancellationToken cancellationToken = default);
}

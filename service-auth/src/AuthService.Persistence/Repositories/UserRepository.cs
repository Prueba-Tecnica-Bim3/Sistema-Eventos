using AuthService.Application.Interfaces;
using AuthService.Domain.Entities;
using AuthService.Persistence.Data;
using Microsoft.EntityFrameworkCore;

namespace AuthService.Persistence.Repositories;

public class UserRepository : IUserRepository
{
    private readonly AuthDbContext _db;

    public UserRepository(AuthDbContext db)
    {
        _db = db;
    }

    public Task<User?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        => _db.Users.FirstOrDefaultAsync(u => u.Id == id, cancellationToken);

    public Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
        => _db.Users
            .Include(u => u.UserRoles)
            .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Email == email, cancellationToken);

    public Task<User?> GetByIdWithRolesAsync(Guid id, CancellationToken cancellationToken = default)
        => _db.Users
            .Include(u => u.UserRoles)
            .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Id == id, cancellationToken);

    public Task<bool> EmailExistsAsync(string email, CancellationToken cancellationToken = default)
        => _db.Users.AnyAsync(u => u.Email == email, cancellationToken);

    public async Task AddAsync(User user, CancellationToken cancellationToken = default)
        => await _db.Users.AddAsync(user, cancellationToken);

    public void Update(User user) => _db.Users.Update(user);

    public Task<Role?> GetRoleByNameAsync(string roleName, CancellationToken cancellationToken = default)
        => _db.Roles.FirstOrDefaultAsync(r => r.Name == roleName, cancellationToken);

    public async Task AddEmailVerificationTokenAsync(EmailVerificationToken token, CancellationToken cancellationToken = default)
        => await _db.EmailVerificationTokens.AddAsync(token, cancellationToken);

    public async Task AddPasswordResetTokenAsync(PasswordResetToken token, CancellationToken cancellationToken = default)
        => await _db.PasswordResetTokens.AddAsync(token, cancellationToken);

    public Task<EmailVerificationToken?> GetEmailVerificationTokenAsync(string token, CancellationToken cancellationToken = default)
        => _db.EmailVerificationTokens
            .Include(t => t.User)
            .FirstOrDefaultAsync(t => t.Token == token, cancellationToken);

    public Task<PasswordResetToken?> GetPasswordResetTokenAsync(string token, CancellationToken cancellationToken = default)
        => _db.PasswordResetTokens
            .Include(t => t.User)
            .FirstOrDefaultAsync(t => t.Token == token, cancellationToken);

    public async Task InvalidateEmailVerificationTokensAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var tokens = await _db.EmailVerificationTokens
            .Where(t => t.UserId == userId && !t.IsUsed)
            .ToListAsync(cancellationToken);

        foreach (var token in tokens)
        {
            token.IsUsed = true;
            token.UsedAt = DateTime.UtcNow;
        }
    }

    public async Task InvalidatePasswordResetTokensAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var tokens = await _db.PasswordResetTokens
            .Where(t => t.UserId == userId && !t.IsUsed)
            .ToListAsync(cancellationToken);

        foreach (var token in tokens)
        {
            token.IsUsed = true;
            token.UsedAt = DateTime.UtcNow;
        }
    }
}

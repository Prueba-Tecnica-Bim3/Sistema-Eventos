using AuthService.Domain.Entities;

namespace AuthService.Application.Interfaces;

public interface IJwtTokenService
{
    (string Token, DateTime ExpiresAt) GenerateToken(User user, IEnumerable<string> roles);
}

using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using AuthService.Application.Options;
using AuthService.Application.Services;
using AuthService.Domain.Entities;
using FluentAssertions;
using Microsoft.Extensions.Options;

namespace AuthService.Tests;

public class JwtTokenServiceTests
{
    [Fact]
    public void GenerateToken_Contains_Required_Claims()
    {
        var options = Options.Create(new JwtOptions
        {
            SecretKey = "TEST_SECRET_KEY_AT_LEAST_32_CHARS_LONG!!",
            Issuer = "test-issuer",
            Audience = "test-audience",
            ExpiryInMinutes = 30
        });

        var service = new JwtTokenService(options);
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "user@test.com",
            Name = "Test User"
        };

        var (token, expiresAt) = service.GenerateToken(user, ["User", "Admin"]);

        token.Should().NotBeNullOrWhiteSpace();
        expiresAt.Should().BeAfter(DateTime.UtcNow);

        var handler = new JwtSecurityTokenHandler();
        var jwt = handler.ReadJwtToken(token);

        jwt.Issuer.Should().Be("test-issuer");
        jwt.Audiences.Should().Contain("test-audience");
        jwt.Claims.First(c => c.Type == "userId").Value.Should().Be(user.Id.ToString());
        jwt.Claims.First(c => c.Type == JwtRegisteredClaimNames.Email || c.Type == "email").Value
            .Should().Be(user.Email);
        jwt.Claims.Where(c => c.Type == ClaimTypes.Role || c.Type == "roles")
            .Select(c => c.Value)
            .Should().Contain(["User", "Admin"]);
        jwt.ValidTo.Should().BeCloseTo(expiresAt, TimeSpan.FromSeconds(5));
    }
}

using AuthService.Persistence.Data;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace AuthService.Tests;

public class CustomWebApplicationFactory : WebApplicationFactory<Program>
{
    private readonly string _dbName = $"AuthTests_{Guid.NewGuid()}";

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");

        // Ensure settings are present even if appsettings.Testing.json load order differs
        builder.UseSetting("ConnectionStrings:DefaultConnection",
            "Host=localhost;Port=5432;Database=auth_test;Username=test;Password=test");
        builder.UseSetting("JwtSettings:SecretKey", "TEST_SECRET_KEY_AT_LEAST_32_CHARS_LONG!!");
        builder.UseSetting("JwtSettings:Issuer", "sistema-eventos-auth");
        builder.UseSetting("JwtSettings:Audience", "sistema-eventos-services");
        builder.UseSetting("JwtSettings:ExpiryInMinutes", "30");
        builder.UseSetting("Swagger:Enabled", "true");

        builder.ConfigureServices(services =>
        {
            services.RemoveAll<DbContextOptions<AuthDbContext>>();
            services.RemoveAll<AuthDbContext>();

            var toRemove = services
                .Where(d => d.ServiceType == typeof(AuthDbContext)
                            || (d.ServiceType.IsGenericType
                                && d.ServiceType.GetGenericTypeDefinition() == typeof(DbContextOptions<>)))
                .ToList();

            foreach (var d in toRemove)
                services.Remove(d);

            services.AddDbContext<AuthDbContext>(options =>
                options.UseInMemoryDatabase(_dbName));
        });
    }
}

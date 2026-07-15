using AuthService.Application.Interfaces;
using AuthService.Domain.Constants;
using AuthService.Domain.Entities;
using AuthService.Persistence.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace AuthService.Persistence.Seeds;

public static class DatabaseSeeder
{
    private static readonly Dictionary<string, string> DefaultRoles = new()
    {
        [Roles.User] = "Usuario / asistente a eventos",
        [Roles.Admin] = "Administrador de la plataforma",
        [Roles.Organizer] = "Organizador de eventos"
    };

    private const string AdminEmail = "admin@eventos.local";
    private const string AdminPassword = "Admin1234!";

    public static async Task SeedAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AuthDbContext>();
        var passwordHasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher>();
        var logger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>().CreateLogger("DatabaseSeeder");

        if (db.Database.IsRelational())
            await db.Database.MigrateAsync();
        else
            await db.Database.EnsureCreatedAsync();

        await SeedRolesAsync(db, logger);
        await SeedAdminAsync(db, passwordHasher, logger);
    }

    private static async Task SeedRolesAsync(AuthDbContext db, ILogger logger)
    {
        foreach (var (name, description) in DefaultRoles)
        {
            if (await db.Roles.AnyAsync(r => r.Name == name))
                continue;

            db.Roles.Add(new Role
            {
                Name = name,
                Description = description
            });
            logger.LogInformation("Rol seed: {Role}", name);
        }

        await db.SaveChangesAsync();
    }

    private static async Task SeedAdminAsync(
        AuthDbContext db,
        IPasswordHasher passwordHasher,
        ILogger logger)
    {
        if (await db.Users.AnyAsync(u => u.Email == AdminEmail.ToLowerInvariant()))
            return;

        var adminRole = await db.Roles.FirstOrDefaultAsync(r => r.Name == Roles.Admin);
        if (adminRole is null)
        {
            logger.LogWarning("No se pudo seedear admin: rol {Role} no existe", Roles.Admin);
            return;
        }

        var adminUser = new User
        {
            Name = "Admin Eventos",
            Email = AdminEmail.ToLowerInvariant(),
            PasswordHash = passwordHasher.Hash(AdminPassword),
            EmailVerified = true,
            ProfileImageUrl = string.Empty,
            IsActive = true
        };

        adminUser.UserRoles.Add(new UserRole
        {
            UserId = adminUser.Id,
            RoleId = adminRole.Id
        });

        await db.Users.AddAsync(adminUser);
        await db.SaveChangesAsync();

        logger.LogInformation(
            "Usuario admin seed: {Email} / rol {Role}",
            AdminEmail,
            Roles.Admin);
    }
}

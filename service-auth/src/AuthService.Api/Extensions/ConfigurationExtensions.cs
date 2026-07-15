using AuthService.Application.Options;

namespace AuthService.Api.Extensions;

/// <summary>
/// Configuration binding — sections match appsettings:
/// JwtSettings, CloudinarySettings, SmtpSettings, AppSettings, Security, Resend, ConnectionStrings.
///
/// Env hierarchy (.NET): JwtSettings__SecretKey, CloudinarySettings__CloudName, etc.
/// Flat aliases also supported: JWT_SECRET_KEY, CLOUDINARY_CLOUD_NAME, SMTP_USERNAME, ...
/// </summary>
public static class ConfigurationExtensions
{
    public static void BindAndValidateRequiredSettings(this WebApplicationBuilder builder)
    {
        // Flat aliases → hierarchical keys used by IOptions&lt;T&gt;
        OverrideFromEnv(builder.Configuration, "JwtSettings:SecretKey", "JWT_SECRET_KEY");
        OverrideFromEnv(builder.Configuration, "JwtSettings:Issuer", "JWT_ISSUER");
        OverrideFromEnv(builder.Configuration, "JwtSettings:Audience", "JWT_AUDIENCE");
        OverrideFromEnv(builder.Configuration, "JwtSettings:ExpiryInMinutes", "JWT_EXPIRATION_MINUTES");
        OverrideFromEnv(builder.Configuration, "JwtSettings:ExpiryInMinutes", "JWT_EXPIRY_IN_MINUTES");

        OverrideFromEnv(builder.Configuration, "CloudinarySettings:CloudName", "CLOUDINARY_CLOUD_NAME");
        OverrideFromEnv(builder.Configuration, "CloudinarySettings:ApiKey", "CLOUDINARY_API_KEY");
        OverrideFromEnv(builder.Configuration, "CloudinarySettings:ApiSecret", "CLOUDINARY_API_SECRET");
        OverrideFromEnv(builder.Configuration, "CloudinarySettings:BaseUrl", "CLOUDINARY_BASE_URL");
        OverrideFromEnv(builder.Configuration, "CloudinarySettings:DefaultAvatarPath", "CLOUDINARY_DEFAULT_AVATAR_PATH");
        OverrideFromEnv(builder.Configuration, "CloudinarySettings:Folder", "CLOUDINARY_FOLDER");

        OverrideFromEnv(builder.Configuration, "SmtpSettings:Host", "SMTP_HOST");
        OverrideFromEnv(builder.Configuration, "SmtpSettings:Port", "SMTP_PORT");
        OverrideFromEnv(builder.Configuration, "SmtpSettings:Username", "SMTP_USERNAME");
        OverrideFromEnv(builder.Configuration, "SmtpSettings:Password", "SMTP_PASSWORD");
        OverrideFromEnv(builder.Configuration, "SmtpSettings:FromEmail", "SMTP_FROM_EMAIL");
        OverrideFromEnv(builder.Configuration, "SmtpSettings:FromName", "SMTP_FROM_NAME");

        OverrideFromEnv(builder.Configuration, "Resend:ApiKey", "RESEND_API_KEY");
        OverrideFromEnv(builder.Configuration, "Resend:FromEmail", "RESEND_FROM_EMAIL");
        OverrideFromEnv(builder.Configuration, "Resend:FromName", "RESEND_FROM_NAME");

        OverrideFromEnv(builder.Configuration, "AppSettings:FrontendUrl", "FRONTEND_URL");

        var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
            ?? Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection");

        if (string.IsNullOrWhiteSpace(connectionString))
        {
            connectionString = BuildPostgresConnectionString();
            if (!string.IsNullOrWhiteSpace(connectionString))
                builder.Configuration["ConnectionStrings:DefaultConnection"] = connectionString;
        }

        if (builder.Environment.IsEnvironment("Testing"))
        {
            if (string.IsNullOrWhiteSpace(builder.Configuration["JwtSettings:SecretKey"]))
                builder.Configuration["JwtSettings:SecretKey"] = "TEST_SECRET_KEY_AT_LEAST_32_CHARS_LONG!!";
            if (string.IsNullOrWhiteSpace(builder.Configuration["JwtSettings:Issuer"]))
                builder.Configuration["JwtSettings:Issuer"] = "sistema-eventos-auth";
            if (string.IsNullOrWhiteSpace(builder.Configuration["JwtSettings:Audience"]))
                builder.Configuration["JwtSettings:Audience"] = "sistema-eventos-services";
            if (string.IsNullOrWhiteSpace(builder.Configuration.GetConnectionString("DefaultConnection")))
                builder.Configuration["ConnectionStrings:DefaultConnection"] =
                    "Host=localhost;Port=5432;Database=auth_test;Username=test;Password=test";
        }

        var missing = new List<string>();

        if (string.IsNullOrWhiteSpace(builder.Configuration["JwtSettings:SecretKey"]))
            missing.Add("JwtSettings:SecretKey (User Secrets / JwtSettings__SecretKey / JWT_SECRET_KEY)");
        if (string.IsNullOrWhiteSpace(builder.Configuration["JwtSettings:Issuer"]))
            missing.Add("JwtSettings:Issuer");
        if (string.IsNullOrWhiteSpace(builder.Configuration["JwtSettings:Audience"]))
            missing.Add("JwtSettings:Audience");
        if (string.IsNullOrWhiteSpace(builder.Configuration.GetConnectionString("DefaultConnection")))
            missing.Add("ConnectionStrings:DefaultConnection");

        var secret = builder.Configuration["JwtSettings:SecretKey"] ?? string.Empty;
        if (!string.IsNullOrEmpty(secret) && secret.Length < 32)
            missing.Add("JwtSettings:SecretKey (mínimo 32 caracteres)");

        if (missing.Count > 0)
        {
            throw new InvalidOperationException(
                "Faltan variables de configuración requerida:\n- " +
                string.Join("\n- ", missing) +
                "\n\nRevise appsettings / User Secrets / variables de entorno (JwtSettings__*).");
        }

        builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection(JwtOptions.SectionName));
        builder.Services.Configure<SmtpOptions>(builder.Configuration.GetSection(SmtpOptions.SectionName));
        builder.Services.Configure<ResendOptions>(builder.Configuration.GetSection(ResendOptions.SectionName));
        builder.Services.Configure<CloudinaryOptions>(builder.Configuration.GetSection(CloudinaryOptions.SectionName));
        builder.Services.Configure<AppOptions>(builder.Configuration.GetSection(AppOptions.SectionName));
        builder.Services.Configure<SecurityOptions>(builder.Configuration.GetSection(SecurityOptions.SectionName));
    }

    public static string GetRequiredConnectionString(this IConfiguration configuration)
    {
        return configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string DefaultConnection no configurada.");
    }

    private static void OverrideFromEnv(IConfiguration configuration, string configKey, string envKey)
    {
        var value = Environment.GetEnvironmentVariable(envKey);
        if (!string.IsNullOrWhiteSpace(value))
            configuration[configKey] = value;
    }

    private static string? BuildPostgresConnectionString()
    {
        var host = Environment.GetEnvironmentVariable("POSTGRES_HOST");
        var port = Environment.GetEnvironmentVariable("POSTGRES_PORT") ?? "5432";
        var db = Environment.GetEnvironmentVariable("POSTGRES_DB");
        var user = Environment.GetEnvironmentVariable("POSTGRES_USER");
        var password = Environment.GetEnvironmentVariable("POSTGRES_PASSWORD");

        if (string.IsNullOrWhiteSpace(host)
            || string.IsNullOrWhiteSpace(db)
            || string.IsNullOrWhiteSpace(user)
            || string.IsNullOrWhiteSpace(password))
        {
            return null;
        }

        return $"Host={host};Port={port};Database={db};Username={user};Password={password};";
    }
}

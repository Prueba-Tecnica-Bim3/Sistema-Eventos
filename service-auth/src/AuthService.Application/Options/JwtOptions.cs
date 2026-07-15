namespace AuthService.Application.Options;

/// <summary>Binds section <c>JwtSettings</c> from appsettings / User Secrets / env.</summary>
public class JwtOptions
{
    public const string SectionName = "JwtSettings";

    public string SecretKey { get; set; } = string.Empty;
    public string Issuer { get; set; } = string.Empty;
    public string Audience { get; set; } = string.Empty;

    /// <summary>Minutes until JWT expires (config key: ExpiryInMinutes).</summary>
    public int ExpiryInMinutes { get; set; } = 30;
}

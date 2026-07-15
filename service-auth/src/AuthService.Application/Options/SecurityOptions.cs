namespace AuthService.Application.Options;

/// <summary>Binds section <c>Security</c> (CORS origins, etc.).</summary>
public class SecurityOptions
{
    public const string SectionName = "Security";

    public string[] AllowedOrigins { get; set; } =
    [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:5173",
        "http://localhost:5174"
    ];

    public string[] AdminAllowedOrigins { get; set; } = [];
    public string[] BlacklistedIPs { get; set; } = [];
    public string[] WhitelistedIPs { get; set; } = [];
    public string[] RestrictedPaths { get; set; } = [];
}

namespace AuthService.Application.Options;

/// <summary>Binds section <c>AppSettings</c>.</summary>
public class AppOptions
{
    public const string SectionName = "AppSettings";

    public string FrontendUrl { get; set; } = "http://localhost:5173";
    public int EmailVerificationTokenHours { get; set; } = 24;
    public int PasswordResetTokenHours { get; set; } = 1;
}

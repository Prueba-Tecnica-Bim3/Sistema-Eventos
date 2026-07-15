namespace AuthService.Application.Options;

/// <summary>Binds section <c>SmtpSettings</c>.</summary>
public class SmtpOptions
{
    public const string SectionName = "SmtpSettings";

    public string Host { get; set; } = string.Empty;
    public int Port { get; set; } = 587;
    public bool EnableSsl { get; set; } = true;
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string FromEmail { get; set; } = string.Empty;
    public string FromName { get; set; } = "Sistema Eventos";
    public bool Enabled { get; set; } = true;
    public int Timeout { get; set; } = 30000;
    public bool UseFallback { get; set; }
    public bool UseImplicitSsl { get; set; }
}

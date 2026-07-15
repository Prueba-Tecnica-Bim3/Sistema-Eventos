namespace AuthService.Application.DTOs.Auth;

public class VerifyEmailRequest
{
    public string Token { get; set; } = string.Empty;
}

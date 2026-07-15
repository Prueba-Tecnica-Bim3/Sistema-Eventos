namespace AuthService.Application.DTOs.Auth;

public class UpdateProfileRequest
{
    public string Name { get; set; } = string.Empty;
    public string? ProfileImageUrl { get; set; }
}

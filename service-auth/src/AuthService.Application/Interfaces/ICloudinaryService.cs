namespace AuthService.Application.Interfaces;

public interface ICloudinaryService
{
    bool IsConfigured { get; }
    Task<string?> UploadImageAsync(Stream fileStream, string fileName, CancellationToken cancellationToken = default);
}

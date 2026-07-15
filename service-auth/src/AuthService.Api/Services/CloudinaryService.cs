using AuthService.Application.Interfaces;
using AuthService.Application.Options;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.Extensions.Options;

namespace AuthService.Api.Services;

public class CloudinaryService : ICloudinaryService
{
    private readonly Cloudinary? _cloudinary;
    private readonly CloudinaryOptions _options;
    private readonly ILogger<CloudinaryService> _logger;

    public CloudinaryService(IOptions<CloudinaryOptions> options, ILogger<CloudinaryService> logger)
    {
        _logger = logger;
        _options = options.Value;

        if (!string.IsNullOrWhiteSpace(_options.CloudName)
            && !string.IsNullOrWhiteSpace(_options.ApiKey)
            && !string.IsNullOrWhiteSpace(_options.ApiSecret))
        {
            var account = new Account(_options.CloudName, _options.ApiKey, _options.ApiSecret);
            _cloudinary = new Cloudinary(account);
            IsConfigured = true;
        }
        else
        {
            IsConfigured = false;
            _logger.LogWarning("Cloudinary no configurado. Upload de imágenes deshabilitado.");
        }
    }

    public bool IsConfigured { get; }

    public string? DefaultAvatarUrl
    {
        get
        {
            if (string.IsNullOrWhiteSpace(_options.DefaultAvatarPath))
                return null;

            if (!string.IsNullOrWhiteSpace(_options.BaseUrl))
                return $"{_options.BaseUrl.TrimEnd('/')}/{_options.DefaultAvatarPath.TrimStart('/')}";

            return _options.DefaultAvatarPath;
        }
    }

    public async Task<string?> UploadImageAsync(Stream fileStream, string fileName, CancellationToken cancellationToken = default)
    {
        if (_cloudinary is null)
            return null;

        var folder = string.IsNullOrWhiteSpace(_options.Folder)
            ? "auth_service/profiles"
            : _options.Folder;

        var uploadParams = new ImageUploadParams
        {
            File = new FileDescription(fileName, fileStream),
            Folder = folder,
            Transformation = new Transformation().Width(400).Height(400).Crop("fill").Gravity("face")
        };

        var result = await _cloudinary.UploadAsync(uploadParams, cancellationToken);

        if (result.Error is not null)
        {
            _logger.LogError("Cloudinary error: {Message}", result.Error.Message);
            throw new InvalidOperationException("Error al subir imagen a Cloudinary");
        }

        return result.SecureUrl?.ToString();
    }
}

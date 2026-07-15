using System.Security.Cryptography;
using System.Text;
using AuthService.Application.Interfaces;
using Konscious.Security.Cryptography;

namespace AuthService.Application.Services;

/// <summary>
/// Argon2id password hasher. Stored format: argon2id$v=19$m=65536,t=3,p=1$salt$hash (base64).
/// </summary>
public class PasswordHasher : IPasswordHasher
{
    private const int SaltSize = 16;
    private const int HashSize = 32;
    private const int DegreeOfParallelism = 1;
    private const int MemorySizeKb = 65536;
    private const int Iterations = 3;

    public string Hash(string password)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(password);

        var salt = RandomNumberGenerator.GetBytes(SaltSize);
        var hash = HashPassword(password, salt);

        return $"argon2id$v=19$m={MemorySizeKb},t={Iterations},p={DegreeOfParallelism}${Convert.ToBase64String(salt)}${Convert.ToBase64String(hash)}";
    }

    public bool Verify(string password, string passwordHash)
    {
        if (string.IsNullOrWhiteSpace(password) || string.IsNullOrWhiteSpace(passwordHash))
            return false;

        try
        {
            var parts = passwordHash.Split('$', StringSplitOptions.RemoveEmptyEntries);
            if (parts.Length != 5 || !parts[0].Equals("argon2id", StringComparison.OrdinalIgnoreCase))
                return false;

            var salt = Convert.FromBase64String(parts[3]);
            var expectedHash = Convert.FromBase64String(parts[4]);
            var actualHash = HashPassword(password, salt);

            return CryptographicOperations.FixedTimeEquals(actualHash, expectedHash);
        }
        catch
        {
            return false;
        }
    }

    private static byte[] HashPassword(string password, byte[] salt)
    {
        using var argon2 = new Argon2id(Encoding.UTF8.GetBytes(password))
        {
            Salt = salt,
            DegreeOfParallelism = DegreeOfParallelism,
            MemorySize = MemorySizeKb,
            Iterations = Iterations
        };

        return argon2.GetBytes(HashSize);
    }
}

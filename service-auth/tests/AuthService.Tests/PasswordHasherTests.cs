using AuthService.Application.Services;
using FluentAssertions;

namespace AuthService.Tests;

public class PasswordHasherTests
{
    private readonly PasswordHasher _hasher = new();

    [Fact]
    public void Hash_And_Verify_Succeeds_For_Correct_Password()
    {
        var hash = _hasher.Hash("Str0ng!Pass");

        hash.Should().StartWith("argon2id$");
        _hasher.Verify("Str0ng!Pass", hash).Should().BeTrue();
    }

    [Fact]
    public void Verify_Fails_For_Wrong_Password()
    {
        var hash = _hasher.Hash("Str0ng!Pass");
        _hasher.Verify("WrongPass1!", hash).Should().BeFalse();
    }

    [Fact]
    public void Hash_Produces_Different_Salts()
    {
        var h1 = _hasher.Hash("Str0ng!Pass");
        var h2 = _hasher.Hash("Str0ng!Pass");
        h1.Should().NotBe(h2);
    }
}

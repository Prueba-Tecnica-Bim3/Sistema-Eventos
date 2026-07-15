using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using AuthService.Application.Common;
using AuthService.Application.DTOs.Auth;
using FluentAssertions;

namespace AuthService.Tests;

public class AuthIntegrationTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public AuthIntegrationTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
    }

    private HttpClient CreateClient() => _factory.CreateClient();

    [Fact]
    public async Task Health_Returns_Ok()
    {
        var client = CreateClient();
        var response = await client.GetAsync("/health");
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task Register_Login_Profile_Flow_Works()
    {
        var client = CreateClient();
        var email = $"user_{Guid.NewGuid():N}@test.com";
        var password = "Str0ng!Pass1";

        var registerResponse = await client.PostAsJsonAsync("/api/v1/auth/register", new RegisterRequest
        {
            Name = "Test User",
            Email = email,
            Password = password
        });

        registerResponse.StatusCode.Should().Be(HttpStatusCode.Created);
        var registerBody = await registerResponse.Content.ReadFromJsonAsync<ApiResponse<AuthResponse>>(JsonOptions);
        registerBody!.Success.Should().BeTrue();
        registerBody.Data!.AccessToken.Should().NotBeNullOrWhiteSpace();
        registerBody.Data.User.Email.Should().Be(email);
        registerBody.Data.User.Roles.Should().Contain("User");

        var loginResponse = await client.PostAsJsonAsync("/api/v1/auth/login", new LoginRequest
        {
            Email = email,
            Password = password
        });

        loginResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var loginBody = await loginResponse.Content.ReadFromJsonAsync<ApiResponse<AuthResponse>>(JsonOptions);
        loginBody!.Success.Should().BeTrue();
        loginBody.Data!.AccessToken.Should().NotBeNullOrWhiteSpace();

        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", loginBody.Data.AccessToken);

        var profileResponse = await client.GetAsync("/api/v1/auth/profile");
        profileResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var profileBody = await profileResponse.Content.ReadFromJsonAsync<ApiResponse<UserProfileDto>>(JsonOptions);
        profileBody!.Success.Should().BeTrue();
        profileBody.Data!.Email.Should().Be(email);
        profileBody.Data.Name.Should().Be("Test User");
    }

    [Fact]
    public async Task Register_Duplicate_Email_Returns_Conflict()
    {
        var client = CreateClient();
        var email = $"dup_{Guid.NewGuid():N}@test.com";
        var request = new RegisterRequest
        {
            Name = "Dup User",
            Email = email,
            Password = "Str0ng!Pass1"
        };

        var first = await client.PostAsJsonAsync("/api/v1/auth/register", request);
        first.StatusCode.Should().Be(HttpStatusCode.Created);

        var second = await client.PostAsJsonAsync("/api/v1/auth/register", request);
        second.StatusCode.Should().Be(HttpStatusCode.Conflict);

        var body = await second.Content.ReadFromJsonAsync<ApiResponse>(JsonOptions);
        body!.Success.Should().BeFalse();
        body.Error.Should().Be(ErrorCodes.EmailAlreadyExists);
    }

    [Fact]
    public async Task Login_Invalid_Credentials_Returns_Unauthorized()
    {
        var client = CreateClient();
        var response = await client.PostAsJsonAsync("/api/v1/auth/login", new LoginRequest
        {
            Email = "nobody@test.com",
            Password = "WrongPass1!"
        });

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        var body = await response.Content.ReadFromJsonAsync<ApiResponse>(JsonOptions);
        body!.Success.Should().BeFalse();
        body.Error.Should().Be(ErrorCodes.InvalidCredentials);
    }

    [Fact]
    public async Task Register_Weak_Password_Returns_Validation_Error()
    {
        var client = CreateClient();
        var response = await client.PostAsJsonAsync("/api/v1/auth/register", new RegisterRequest
        {
            Name = "Weak",
            Email = $"weak_{Guid.NewGuid():N}@test.com",
            Password = "123"
        });

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        var body = await response.Content.ReadFromJsonAsync<ApiResponse>(JsonOptions);
        body!.Success.Should().BeFalse();
        body.Error.Should().Be(ErrorCodes.ValidationError);
    }

    [Fact]
    public async Task Profile_Without_Token_Returns_Unauthorized()
    {
        var client = CreateClient();
        var response = await client.GetAsync("/api/v1/auth/profile");
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Update_Profile_And_Change_Password_Work()
    {
        var client = CreateClient();
        var email = $"upd_{Guid.NewGuid():N}@test.com";
        var password = "Str0ng!Pass1";

        var register = await client.PostAsJsonAsync("/api/v1/auth/register", new RegisterRequest
        {
            Name = "Original",
            Email = email,
            Password = password
        });
        var regBody = await register.Content.ReadFromJsonAsync<ApiResponse<AuthResponse>>(JsonOptions);
        var token = regBody!.Data!.AccessToken;

        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var update = await client.PutAsJsonAsync("/api/v1/auth/profile", new UpdateProfileRequest
        {
            Name = "Updated Name"
        });
        update.StatusCode.Should().Be(HttpStatusCode.OK);
        var updateBody = await update.Content.ReadFromJsonAsync<ApiResponse<UserProfileDto>>(JsonOptions);
        updateBody!.Data!.Name.Should().Be("Updated Name");

        var change = await client.PostAsJsonAsync("/api/v1/auth/change-password", new ChangePasswordRequest
        {
            CurrentPassword = password,
            NewPassword = "N3w!Str0ngPass"
        });
        change.StatusCode.Should().Be(HttpStatusCode.OK);

        client.DefaultRequestHeaders.Authorization = null;
        var loginNew = await client.PostAsJsonAsync("/api/v1/auth/login", new LoginRequest
        {
            Email = email,
            Password = "N3w!Str0ngPass"
        });
        loginNew.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task Swagger_Json_Is_Available()
    {
        var client = CreateClient();
        var response = await client.GetAsync("/swagger/v1/swagger.json");
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadAsStringAsync();
        content.Should().Contain("Auth Service API");
    }
}

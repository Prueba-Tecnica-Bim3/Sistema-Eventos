namespace AuthService.Application.Common;

public static class ErrorCodes
{
    public const string ValidationError = "VALIDATION_ERROR";
    public const string EmailAlreadyExists = "EMAIL_ALREADY_EXISTS";
    public const string InvalidCredentials = "INVALID_CREDENTIALS";
    public const string UserNotFound = "USER_NOT_FOUND";
    public const string Unauthorized = "UNAUTHORIZED";
    public const string Forbidden = "FORBIDDEN";
    public const string EmailNotVerified = "EMAIL_NOT_VERIFIED";
    public const string InvalidToken = "INVALID_TOKEN";
    public const string TokenExpired = "TOKEN_EXPIRED";
    public const string WeakPassword = "WEAK_PASSWORD";
    public const string SamePassword = "SAME_PASSWORD";
    public const string UserInactive = "USER_INACTIVE";
    public const string InternalError = "INTERNAL_ERROR";
    public const string MissingConfiguration = "MISSING_CONFIGURATION";
}

using System.Net;
using System.Text.Json;
using AuthService.Application.Common;
using FluentValidation;

namespace AuthService.Api.Middlewares;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;
    private readonly IHostEnvironment _env;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public ExceptionHandlingMiddleware(
        RequestDelegate next,
        ILogger<ExceptionHandlingMiddleware> logger,
        IHostEnvironment env)
    {
        _next = next;
        _logger = logger;
        _env = env;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var (statusCode, message, errorCode) = exception switch
        {
            AppException appEx => (appEx.StatusCode, appEx.Message, appEx.ErrorCode),
            ValidationException validationEx => (
                (int)HttpStatusCode.BadRequest,
                string.Join("; ", validationEx.Errors.Select(e => e.ErrorMessage).Distinct()),
                ErrorCodes.ValidationError),
            UnauthorizedAccessException => (
                (int)HttpStatusCode.Unauthorized,
                "No autorizado",
                ErrorCodes.Unauthorized),
            _ => (
                (int)HttpStatusCode.InternalServerError,
                "Ocurrió un error interno",
                ErrorCodes.InternalError)
        };

        if (statusCode >= 500)
            _logger.LogError(exception, "Error no controlado: {Message}", exception.Message);
        else
            _logger.LogWarning("Error de aplicación ({StatusCode}/{ErrorCode}): {Message}",
                statusCode, errorCode, message);

        // Never expose stack traces or secrets in the response body
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = statusCode;

        var payload = ApiResponse.Fail(message, errorCode);
        await context.Response.WriteAsync(JsonSerializer.Serialize(payload, JsonOptions));
    }
}

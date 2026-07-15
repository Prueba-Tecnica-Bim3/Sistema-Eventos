using System.Net;
using System.Net.Http.Headers;
using System.Net.Mail;
using System.Text;
using System.Text.Json;
using AuthService.Application.Interfaces;
using AuthService.Application.Options;
using Microsoft.Extensions.Options;

namespace AuthService.Api.Services;

/// <summary>
/// Prefers Resend API when configured; otherwise falls back to SMTP (SmtpSettings).
/// </summary>
public class CompositeEmailService : IEmailService
{
    private readonly ResendOptions _resend;
    private readonly SmtpOptions _smtp;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<CompositeEmailService> _logger;

    public CompositeEmailService(
        IOptions<ResendOptions> resend,
        IOptions<SmtpOptions> smtp,
        IHttpClientFactory httpClientFactory,
        ILogger<CompositeEmailService> logger)
    {
        _resend = resend.Value;
        _smtp = smtp.Value;
        _httpClientFactory = httpClientFactory;
        _logger = logger;
    }

    public async Task SendEmailAsync(string toEmail, string subject, string htmlBody, CancellationToken cancellationToken = default)
    {
        if (!string.IsNullOrWhiteSpace(_resend.ApiKey) && !string.IsNullOrWhiteSpace(_resend.FromEmail))
        {
            await SendViaResendAsync(toEmail, subject, htmlBody, cancellationToken);
            return;
        }

        if (_smtp.Enabled
            && !string.IsNullOrWhiteSpace(_smtp.Host)
            && !string.IsNullOrWhiteSpace(_smtp.FromEmail))
        {
            await SendViaSmtpAsync(toEmail, subject, htmlBody, cancellationToken);
            return;
        }

        _logger.LogWarning(
            "Email no enviado (sin configuración SMTP/Resend). To={To} Subject={Subject}",
            toEmail, subject);
    }

    private async Task SendViaResendAsync(string toEmail, string subject, string htmlBody, CancellationToken cancellationToken)
    {
        var client = _httpClientFactory.CreateClient("Resend");
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _resend.ApiKey);

        var payload = new
        {
            from = $"{_resend.FromName} <{_resend.FromEmail}>",
            to = new[] { toEmail },
            subject,
            html = htmlBody
        };

        using var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
        using var response = await client.PostAsync("https://api.resend.com/emails", content, cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            var body = await response.Content.ReadAsStringAsync(cancellationToken);
            _logger.LogError("Resend falló ({Status}): {Body}", response.StatusCode, body);
            throw new InvalidOperationException("No se pudo enviar el correo mediante Resend");
        }

        _logger.LogInformation("Correo enviado via Resend a {Email}", toEmail);
    }

    private async Task SendViaSmtpAsync(string toEmail, string subject, string htmlBody, CancellationToken cancellationToken)
    {
        using var message = new MailMessage
        {
            From = new MailAddress(_smtp.FromEmail, _smtp.FromName),
            Subject = subject,
            Body = htmlBody,
            IsBodyHtml = true
        };
        message.To.Add(toEmail);

        using var client = new SmtpClient(_smtp.Host, _smtp.Port)
        {
            EnableSsl = _smtp.EnableSsl || _smtp.UseImplicitSsl,
            DeliveryMethod = SmtpDeliveryMethod.Network,
            Timeout = _smtp.Timeout > 0 ? _smtp.Timeout : 30000
        };

        if (!string.IsNullOrWhiteSpace(_smtp.Username))
            client.Credentials = new NetworkCredential(_smtp.Username, _smtp.Password);

        await client.SendMailAsync(message, cancellationToken);
        _logger.LogInformation("Correo enviado via SMTP a {Email}", toEmail);
    }
}

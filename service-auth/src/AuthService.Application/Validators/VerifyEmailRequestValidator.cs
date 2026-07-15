using AuthService.Application.DTOs.Auth;
using FluentValidation;

namespace AuthService.Application.Validators;

public class VerifyEmailRequestValidator : AbstractValidator<VerifyEmailRequest>
{
    public VerifyEmailRequestValidator()
    {
        RuleFor(x => x.Token)
            .NotEmpty().WithMessage("El token es requerido");
    }
}

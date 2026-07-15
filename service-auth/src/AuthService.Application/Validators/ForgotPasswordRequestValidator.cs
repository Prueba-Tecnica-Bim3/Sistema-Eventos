using AuthService.Application.DTOs.Auth;
using FluentValidation;

namespace AuthService.Application.Validators;

public class ForgotPasswordRequestValidator : AbstractValidator<ForgotPasswordRequest>
{
    public ForgotPasswordRequestValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("El correo es requerido")
            .EmailAddress().WithMessage("El correo no es válido");
    }
}

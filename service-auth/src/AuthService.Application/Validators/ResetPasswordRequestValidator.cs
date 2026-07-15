using AuthService.Application.DTOs.Auth;
using FluentValidation;

namespace AuthService.Application.Validators;

public class ResetPasswordRequestValidator : AbstractValidator<ResetPasswordRequest>
{
    public ResetPasswordRequestValidator()
    {
        RuleFor(x => x.Token)
            .NotEmpty().WithMessage("El token es requerido");

        RuleFor(x => x.NewPassword)
            .NotEmpty().WithMessage("La nueva contraseña es requerida")
            .MinimumLength(8).WithMessage("La contraseña debe tener al menos 8 caracteres")
            .MaximumLength(128).WithMessage("La contraseña no puede exceder 128 caracteres")
            .Matches("[A-Z]").WithMessage("La contraseña debe contener al menos una mayúscula")
            .Matches("[a-z]").WithMessage("La contraseña debe contener al menos una minúscula")
            .Matches("[0-9]").WithMessage("La contraseña debe contener al menos un número")
            .Matches("[^a-zA-Z0-9]").WithMessage("La contraseña debe contener al menos un carácter especial");
    }
}

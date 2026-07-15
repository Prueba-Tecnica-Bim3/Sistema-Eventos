using AuthService.Application.DTOs.Auth;
using FluentValidation;

namespace AuthService.Application.Validators;

public class UpdateProfileRequestValidator : AbstractValidator<UpdateProfileRequest>
{
    public UpdateProfileRequestValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("El nombre es requerido")
            .MinimumLength(2).WithMessage("El nombre debe tener al menos 2 caracteres")
            .MaximumLength(100).WithMessage("El nombre no puede exceder 100 caracteres");

        RuleFor(x => x.ProfileImageUrl)
            .MaximumLength(500).WithMessage("La URL de imagen no puede exceder 500 caracteres")
            .When(x => !string.IsNullOrWhiteSpace(x.ProfileImageUrl));
    }
}

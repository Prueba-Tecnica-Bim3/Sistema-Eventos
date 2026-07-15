namespace AuthService.Domain.Constants;

/// <summary>Roles del Sistema de Eventos.</summary>
public static class Roles
{
    public const string User = "User";
    public const string Admin = "Admin";
    public const string Organizer = "Organizer";

    /// <summary>Rol por defecto en el registro público.</summary>
    public const string Default = User;

    public static readonly string[] All = [User, Admin, Organizer];
}

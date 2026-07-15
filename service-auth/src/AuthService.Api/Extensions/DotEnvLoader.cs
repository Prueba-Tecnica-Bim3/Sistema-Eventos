namespace AuthService.Api.Extensions;

/// <summary>
/// Loads KEY=VALUE pairs from a .env file into process environment variables.
/// Does not override variables already set in the OS/shell.
/// </summary>
public static class DotEnvLoader
{
    public static void Load(params string[] searchPaths)
    {
        foreach (var path in searchPaths.Where(p => !string.IsNullOrWhiteSpace(p)))
        {
            var full = Path.GetFullPath(path);
            if (!File.Exists(full))
                continue;

            foreach (var raw in File.ReadAllLines(full))
            {
                var line = raw.Trim();
                if (line.Length == 0 || line.StartsWith('#'))
                    continue;

                var separator = line.IndexOf('=');
                if (separator <= 0)
                    continue;

                var key = line[..separator].Trim();
                var value = line[(separator + 1)..].Trim();

                // Strip optional surrounding quotes
                if (value.Length >= 2
                    && ((value.StartsWith('"') && value.EndsWith('"'))
                        || (value.StartsWith('\'') && value.EndsWith('\''))))
                {
                    value = value[1..^1];
                }

                if (string.IsNullOrWhiteSpace(key))
                    continue;

                // Do not override existing environment (Docker/CI wins)
                if (!string.IsNullOrEmpty(Environment.GetEnvironmentVariable(key)))
                    continue;

                Environment.SetEnvironmentVariable(key, value);
            }

            Console.WriteLine($"[config] .env cargado desde: {full}");
            return;
        }
    }

    /// <summary>
    /// Resolves typical locations when running from Api project or service-auth root.
    /// </summary>
    public static void LoadDefault()
    {
        var cwd = Directory.GetCurrentDirectory();
        Load(
            Path.Combine(cwd, ".env"),
            Path.Combine(cwd, "..", "..", "..", "..", ".env"), // from bin/Debug/net8.0 → service-auth
            Path.Combine(cwd, "..", "..", ".env"),
            Path.Combine(cwd, "..", ".env"),
            Path.Combine(AppContext.BaseDirectory, ".env"),
            Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "..", ".env")
        );
    }
}

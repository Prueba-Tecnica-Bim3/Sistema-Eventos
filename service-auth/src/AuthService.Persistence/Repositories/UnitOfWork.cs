using AuthService.Application.Interfaces;
using AuthService.Persistence.Data;

namespace AuthService.Persistence.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly AuthDbContext _db;

    public UnitOfWork(AuthDbContext db)
    {
        _db = db;
    }

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        => _db.SaveChangesAsync(cancellationToken);
}

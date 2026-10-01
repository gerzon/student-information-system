using Microsoft.EntityFrameworkCore;
using StudentInformationSystem.Api.Contracts;
using StudentInformationSystem.Api.Data;
using StudentInformationSystem.Api.Middleware;
using StudentInformationSystem.Api.Models;

namespace StudentInformationSystem.Api.Services;

public sealed class StudentService(ApplicationDbContext dbContext) : IStudentService
{
    public async Task<IReadOnlyList<StudentResponse>> GetAllAsync(CancellationToken cancellationToken)
    {
        var students = await dbContext.Students
            .AsNoTracking()
            .OrderBy(student => student.LastName)
            .ThenBy(student => student.FirstName)
            .ToListAsync(cancellationToken);

        return students.Select(ToResponse).ToArray();
    }

    public async Task<StudentResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        var student = await dbContext.Students
            .AsNoTracking()
            .SingleOrDefaultAsync(student => student.Id == id, cancellationToken);

        return student is null ? null : ToResponse(student);
    }

    public async Task<StudentResponse> CreateAsync(
        CreateStudentRequest request,
        CancellationToken cancellationToken)
    {
        var studentNumber = request.StudentNumber.Trim();
        var email = request.Email.Trim().ToLowerInvariant();
        if (await dbContext.Students.AnyAsync(
                student => student.StudentNumber == studentNumber || student.Email == email,
                cancellationToken))
        {
            throw new ResourceConflictException("A student with that student number or email already exists.");
        }

        var student = new Student
        {
            StudentNumber = studentNumber,
            FirstName = request.FirstName.Trim(),
            LastName = request.LastName.Trim(),
            Email = email,
            EnrollmentDate = request.EnrollmentDate
        };

        dbContext.Students.Add(student);
        await dbContext.SaveChangesAsync(cancellationToken);
        return ToResponse(student);
    }

    public async Task<StudentResponse?> UpdateAsync(
        Guid id,
        UpdateStudentRequest request,
        CancellationToken cancellationToken)
    {
        var student = await dbContext.Students
            .SingleOrDefaultAsync(student => student.Id == id, cancellationToken);
        if (student is null)
        {
            return null;
        }

        var studentNumber = request.StudentNumber.Trim();
        var email = request.Email.Trim().ToLowerInvariant();
        if (await dbContext.Students.AnyAsync(
                other => other.Id != id &&
                         (other.StudentNumber == studentNumber || other.Email == email),
                cancellationToken))
        {
            throw new ResourceConflictException("A student with that student number or email already exists.");
        }

        student.StudentNumber = studentNumber;
        student.FirstName = request.FirstName.Trim();
        student.LastName = request.LastName.Trim();
        student.Email = email;
        student.EnrollmentDate = request.EnrollmentDate;
        await dbContext.SaveChangesAsync(cancellationToken);
        return ToResponse(student);
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        var student = await dbContext.Students
            .SingleOrDefaultAsync(student => student.Id == id, cancellationToken);
        if (student is null)
        {
            return false;
        }

        dbContext.Students.Remove(student);
        await dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }

    private static StudentResponse ToResponse(Student student) =>
        new(student.Id, student.StudentNumber, student.FirstName, student.LastName,
            student.Email, student.EnrollmentDate, student.CreatedAt);
}

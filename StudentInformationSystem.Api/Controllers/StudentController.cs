using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentInformationSystem.Api.Contracts;
using StudentInformationSystem.Api.Services;

namespace StudentInformationSystem.Api.Controllers;

[ApiController]
[Authorize(Roles = "Administrator")]
[Route("api/[controller]")]
public sealed class StudentController(IStudentService studentService) : ControllerBase
{
    /// <summary>Returns all student records.</summary>
    [HttpGet]
    [ProducesResponseType<IReadOnlyList<StudentResponse>>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<IReadOnlyList<StudentResponse>>> GetStudents(
        CancellationToken cancellationToken)
    {
        return Ok(await studentService.GetAllAsync(cancellationToken));
    }

    /// <summary>Returns one student record.</summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType<StudentResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<StudentResponse>> GetStudent(
        Guid id,
        CancellationToken cancellationToken)
    {
        var student = await studentService.GetByIdAsync(id, cancellationToken);
        return student is null ? NotFound() : Ok(student);
    }

    /// <summary>Creates a student record.</summary>
    [HttpPost]
    [ProducesResponseType<StudentResponse>(StatusCodes.Status201Created)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<StudentResponse>> CreateStudent(
        CreateStudentRequest request,
        CancellationToken cancellationToken)
    {
        var student = await studentService.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetStudent), new { id = student.Id }, student);
    }

    /// <summary>Updates a student record.</summary>
    [HttpPut("{id:guid}")]
    [ProducesResponseType<StudentResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<StudentResponse>> UpdateStudent(
        Guid id,
        UpdateStudentRequest request,
        CancellationToken cancellationToken)
    {
        var student = await studentService.UpdateAsync(id, request, cancellationToken);
        return student is null ? NotFound() : Ok(student);
    }

    /// <summary>Deletes a student record.</summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteStudent(Guid id, CancellationToken cancellationToken)
    {
        var deleted = await studentService.DeleteAsync(id, cancellationToken);
        return deleted ? NoContent() : NotFound();
    }
}

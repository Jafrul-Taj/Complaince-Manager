using BankAudit.API.DTOs.Auth;
using BankAudit.API.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace BankAudit.API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService) => _authService = authService;

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var result = await _authService.LoginAsync(request);
        if (result is null) return Unauthorized(new { message = "Invalid username or password." });
        return Ok(result);
    }
}

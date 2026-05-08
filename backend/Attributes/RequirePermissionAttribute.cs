using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace TushGptBackend.Attributes
{
    /// <summary>
    /// Checks if the authenticated user has the required permission via RBAC.
    /// Usage: [RequirePermission("ADD_CREDIT")]
    /// </summary>
    [AttributeUsage(AttributeTargets.Method | AttributeTargets.Class)]
    public class RequirePermissionAttribute : Attribute, IAsyncActionFilter
    {
        private readonly string _permission;

        public RequirePermissionAttribute(string permission)
        {
            _permission = permission;
        }

        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            var httpContext = context.HttpContext;
            var role = httpContext.Items["UserRole"]?.ToString();

            if (string.IsNullOrEmpty(role))
            {
                context.Result = new UnauthorizedObjectResult(new { message = "Authentication required." });
                return;
            }

            // SUPER_ADMIN has full access (system owner)
            if (role == "SUPER_ADMIN")
            {
                await next();
                return;
            }

            // For non-ADMIN roles, check permission via DB
            var db = httpContext.RequestServices.GetRequiredService<Data.AppDbContext>();
            var userId = httpContext.Items["UserId"]?.ToString();

            if (string.IsNullOrEmpty(userId) || !int.TryParse(userId, out var uid))
            {
                context.Result = new UnauthorizedObjectResult(new { message = "Invalid user context." });
                return;
            }

            var hasPermission = await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions
                .AnyAsync(
                    from ur in db.UserRoles
                    join rp in db.RolePermissions on ur.RoleId equals rp.RoleId
                    join p in db.Permissions on rp.PermissionId equals p.Id
                    where ur.UserId == uid && p.PermissionName == _permission
                    select p
                );

            if (!hasPermission)
            {
                context.Result = new ObjectResult(new { message = $"Permission '{_permission}' required." })
                {
                    StatusCode = 403
                };
                return;
            }

            await next();
        }
    }
}

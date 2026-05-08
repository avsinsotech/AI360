namespace TushGptBackend.Middleware
{
    public class TenantMiddleware
    {
        private readonly RequestDelegate _next;

        public TenantMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            // Extract ClientCode and Role from JWT claims (if present)
            if (context.User.Identity?.IsAuthenticated == true)
            {
                // Case-insensitive lookup for ClientCode
                var clientCodeClaim = context.User.Claims.FirstOrDefault(c => 
                    c.Type.Equals("ClientCode", StringComparison.OrdinalIgnoreCase) || 
                    c.Type.Equals("http://schemas.tushgpt.com/claims/clientcode", StringComparison.OrdinalIgnoreCase));
                
                if (clientCodeClaim != null)
                {
                    context.Items["ClientCode"] = clientCodeClaim.Value;
                }

                // Robust Role extraction (handles simple 'Role' and standard ClaimTypes.Role URI)
                var roleClaim = context.User.Claims.FirstOrDefault(c => 
                    c.Type.Equals("Role", StringComparison.OrdinalIgnoreCase) || 
                    c.Type.Equals(System.Security.Claims.ClaimTypes.Role, StringComparison.OrdinalIgnoreCase));
                
                if (roleClaim != null)
                {
                    context.Items["UserRole"] = roleClaim.Value;
                }

                var userIdClaim = context.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
                if (userIdClaim != null)
                {
                    context.Items["UserId"] = userIdClaim.Value;
                }

                var originalRoleClaim = context.User.Claims.FirstOrDefault(c => 
                    c.Type.Equals("OriginalRole", StringComparison.OrdinalIgnoreCase));
                
                if (originalRoleClaim != null)
                {
                    context.Items["OriginalRole"] = originalRoleClaim.Value;
                }
            }

            await _next(context);
        }
    }
}

namespace TushGptBackend.Models
{
    public class LoginRequest
    {
        public required string Username { get; set; }
        public required string Password { get; set; }
    }

    public class OtpRequest
    {
        public required string MobileNumber { get; set; }
    }

    public class OtpVerifyReq
    {
        public required string MobileNumber { get; set; }
        public required string OtpCode { get; set; }
    }

    public class OtpResponse
    {
        public required string Message { get; set; }
        public bool Success { get; set; }
    }
}

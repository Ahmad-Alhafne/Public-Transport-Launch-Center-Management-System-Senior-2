namespace AuditService.Application.DTOs
{
    public class ValidateQrRequest
    {
        public string Token { get; set; } = string.Empty;
        public Guid? SelectedTripId { get; set; }
    }
}

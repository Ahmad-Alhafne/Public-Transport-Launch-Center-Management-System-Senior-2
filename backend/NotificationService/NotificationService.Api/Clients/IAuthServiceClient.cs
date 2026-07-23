namespace NotificationService.Api.Clients;

public interface IAuthServiceClient
{
    Task<string?> GetUserLanguagePreferenceAsync(Guid userId);
}

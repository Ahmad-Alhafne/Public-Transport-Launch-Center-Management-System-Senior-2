namespace NotificationService.Application.Services;

using NotificationService.Application.DTOs;
using NotificationService.Application.Interfaces;
using NotificationService.Domain.Entities;

public class NotificationPreferenceService : INotificationPreferenceService
{
    private const int MinMinutes = 5;
    private const int MaxMinutes = 1440;
    private readonly INotificationRepository _repository;

    public NotificationPreferenceService(INotificationRepository repository)
    {
        _repository = repository;
    }

    public async Task<NotificationPreferenceDto> GetPreferencesAsync(Guid userId, string role)
    {
        var preference = await _repository.GetPreferenceAsync(userId, role);
        return MapToDto(preference ?? GetDefaultPreference(userId, role));
    }

    public async Task<NotificationPreferenceDto> UpdatePreferencesAsync(Guid userId, string role, UpdateNotificationPreferenceDto dto)
    {
        if (dto.ReminderMinutesBeforeDeparture < MinMinutes || dto.ReminderMinutesBeforeDeparture > MaxMinutes)
        {
            throw new ArgumentOutOfRangeException(nameof(dto.ReminderMinutesBeforeDeparture), $"Reminder minutes must be between {MinMinutes} and {MaxMinutes}.");
        }

        var preference = await _repository.GetPreferenceAsync(userId, role) ?? new NotificationPreference
        {
            UserId = userId,
            Role = role,
            CreatedAt = DateTime.UtcNow
        };

        preference.ReminderEnabled = dto.ReminderEnabled;
        preference.ReminderMinutesBeforeDeparture = dto.ReminderMinutesBeforeDeparture;
        preference.UpdatedAt = DateTime.UtcNow;

        await _repository.AddOrUpdatePreferenceAsync(preference);
        await _repository.SaveChangesAsync();

        return MapToDto(preference);
    }

    private static NotificationPreference GetDefaultPreference(Guid userId, string role)
    {
        return new NotificationPreference
        {
            UserId = userId,
            Role = role,
            ReminderEnabled = true,
            ReminderMinutesBeforeDeparture = role.Equals("Driver", StringComparison.OrdinalIgnoreCase) ? 60 : 30,
            UpdatedAt = DateTime.UtcNow
        };
    }

    private static NotificationPreferenceDto MapToDto(NotificationPreference preference)
    {
        return new NotificationPreferenceDto
        {
            UserId = preference.UserId,
            Role = preference.Role,
            ReminderEnabled = preference.ReminderEnabled,
            ReminderMinutesBeforeDeparture = preference.ReminderMinutesBeforeDeparture
        };
    }
}

using System;
using System.Threading;
using System.Threading.Tasks;

namespace NotificationService.Application.Interfaces
{
	public interface INotificationSender
	{
		Task SendAsync(Guid userId, string title, string message, CancellationToken cancellationToken = default);
	}
}

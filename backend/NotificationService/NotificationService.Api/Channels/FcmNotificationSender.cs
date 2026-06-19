using System;
using System.Threading;
using System.Threading.Tasks;
using System.Net.Http;
using NotificationService.Application.Interfaces;

namespace NotificationService.Api.Channels
{
	public class FcmNotificationSender : INotificationSender
	{
		private readonly HttpClient _client;

		public FcmNotificationSender(HttpClient client)
		{
			_client = client;
		}

		public Task SendAsync(Guid userId, string title, string message, CancellationToken cancellationToken = default)
		{
			// Minimal implementation: no-op for container build. Real implementation should call FCM APIs.
			return Task.CompletedTask;
		}
	}
}

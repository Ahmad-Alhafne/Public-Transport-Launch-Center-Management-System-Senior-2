using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Hosting;

namespace NotificationService.Api.BackgroundServices
{
	public class PushReceiptPollingService : BackgroundService
	{
		protected override Task ExecuteAsync(CancellationToken stoppingToken)
		{
			// Minimal implementation: do nothing. Real implementation should poll provider receipts and reconcile.
			return Task.CompletedTask;
		}
	}
}

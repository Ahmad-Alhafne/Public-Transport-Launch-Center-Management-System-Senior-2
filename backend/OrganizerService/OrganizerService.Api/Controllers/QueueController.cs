using Microsoft.AspNetCore.Mvc;
using OrganizerService.Application.Services;
using System;
using System.Threading.Tasks;
using System.Linq;
using Microsoft.AspNetCore.Authorization;

namespace OrganizerService.Api.Controllers
{
    [ApiController]
    [Route("api/queue")]
    [Authorize(Roles = "QueueOrganizer,Admin")]
    public class QueueController : ControllerBase
    {
        private readonly OrganizerQueueService _queueService;

        public QueueController(OrganizerQueueService queueService)
        {
            _queueService = queueService;
        }

        [HttpGet("packages")]
        public async Task<IActionResult> GetPackages()
        {
            var items = await _queueService.GetAllPackagesAsync();
            return Ok(items);
        }

        [HttpGet("packages/{id}")]
        public async Task<IActionResult> GetPackage(Guid id)
        {
            var item = await _queueService.GetPackageAsync(id);
            if (item == null) return NotFound();
            var trips = await _queueService.GetPackageTripsAsync(id);
            return Ok(new { package = item, trips });
        }

        [HttpPost("packages/auto-group")]
        public async Task<IActionResult> AutoGroup([FromQuery] DateTime date)
        {
            await _queueService.AutoGroupByDateAsync(date);
            return Ok();
        }

        [HttpPost("packages/reorder")]
        public async Task<IActionResult> ReorderPackages([FromBody] Guid[] orderedPackageIds)
        {
            await _queueService.ReorderPackagesAsync(orderedPackageIds);
            return Ok();
        }

        [HttpPost("packages/{id}/reorder-trips")]
        public async Task<IActionResult> ReorderTrips(Guid id, [FromBody] Guid[] orderedTripIds)
        {
            await _queueService.ReorderTripsAsync(id, orderedTripIds);
            return Ok();
        }

        [HttpPost("packages/{id}/trips/{tripId}/move-up")]
        public async Task<IActionResult> MoveTripUp(Guid id, Guid tripId)
        {
            var trips = await _queueService.GetPackageTripsAsync(id);
            var list = trips.ToList();
            var idx = list.FindIndex(t => t.TripId == tripId);
            if (idx <= 0) return BadRequest("Cannot move up");
            // new position is idx (1-based)
            await _queueService.MoveTripPositionAsync(id, tripId, idx);
            return Ok();
        }

        [HttpPost("packages/{id}/trips/{tripId}/move-down")]
        public async Task<IActionResult> MoveTripDown(Guid id, Guid tripId)
        {
            var trips = await _queueService.GetPackageTripsAsync(id);
            var list = trips.ToList();
            var idx = list.FindIndex(t => t.TripId == tripId);
            if (idx < 0 || idx >= list.Count - 1) return BadRequest("Cannot move down");
            await _queueService.MoveTripPositionAsync(id, tripId, idx + 2);
            return Ok();
        }

        [HttpPost("packages/{id}/trips")]
        public async Task<IActionResult> AddTrip(Guid id, [FromBody] Guid tripId)
        {
            await _queueService.AddTripToPackageAsync(id, tripId, null);
            return Ok();
        }

        [HttpDelete("packages/{id}/trips/{tripId}")]
        public async Task<IActionResult> RemoveTrip(Guid id, Guid tripId)
        {
            await _queueService.RemoveTripFromPackageAsync(id, tripId);
            return Ok();
        }
    }
}

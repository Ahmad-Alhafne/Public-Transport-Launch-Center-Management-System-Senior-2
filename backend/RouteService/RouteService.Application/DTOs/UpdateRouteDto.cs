namespace RouteService.Application.DTOs;

public class UpdateRouteDto
{
    public string Name { get; set; } = string.Empty;
    public string StartLocation { get; set; } = string.Empty;
    public string EndLocation { get; set; } = string.Empty;
    public double DistanceKm { get; set; }
    public int EstimatedDurationMins { get; set; }
    public bool IsActive { get; set; }
}

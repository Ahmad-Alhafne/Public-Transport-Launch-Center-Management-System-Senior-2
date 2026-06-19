using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace OrganizerService.Application.Interfaces
{
    public interface ITripServiceClient
    {
        Task<IEnumerable<dynamic>> GetTripsByDateAsync(DateTime date);
    }
}

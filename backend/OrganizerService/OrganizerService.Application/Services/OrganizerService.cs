using OrganizerService.Application.DTOs;
using OrganizerService.Application.Interfaces;
using OrganizerService.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace OrganizerService.Application.Services
{
    public class OrganizerService
    {
        private readonly IOrganizerRepository _repo;

        public OrganizerService(IOrganizerRepository repo)
        {
            _repo = repo;
        }

        public async Task<OrganizerDto> CreateAsync(OrganizerDto dto, string hashedPassword)
        {
            var entity = new Organizer
            {
                Id = Guid.NewGuid(),
                FullName = dto.FullName,
                Email = dto.Email,
                Password = hashedPassword,
                PhoneNumber = dto.PhoneNumber,
                Gender = dto.Gender,
                DateOfBirth = dto.DateOfBirth,
                City = dto.City,
                Region = dto.Region,
                NationalIdNumber = dto.NationalIdNumber,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                IsActive = dto.IsActive
            };

            var created = await _repo.CreateAsync(entity);
            await _repo.AddActionLogAsync(new OrganizerActionLog { Id = Guid.NewGuid(), OrganizerId = created.Id, Action = "CreateOrganizer", Timestamp = DateTime.UtcNow, RelatedEntityId = created.Id });
            return MapToDto(created);
        }

        public async Task<OrganizerDto?> GetByIdAsync(Guid id)
        {
            var e = await _repo.GetByIdAsync(id);
            return e == null ? null : MapToDto(e);
        }

        public async Task<IEnumerable<OrganizerDto>> GetAllAsync()
        {
            var items = await _repo.GetAllAsync();
            return items.Select(MapToDto);
        }

        public async Task UpdateAsync(OrganizerDto dto)
        {
            var e = await _repo.GetByIdAsync(dto.Id);
            if (e == null) return;
            e.FullName = dto.FullName;
            e.Email = dto.Email;
            e.PhoneNumber = dto.PhoneNumber;
            e.Gender = dto.Gender;
            e.DateOfBirth = dto.DateOfBirth;
            e.City = dto.City;
            e.Region = dto.Region;
            e.NationalIdNumber = dto.NationalIdNumber;
            e.IsActive = dto.IsActive;
            e.UpdatedAt = DateTime.UtcNow;

            await _repo.UpdateAsync(e);
            await _repo.AddActionLogAsync(new OrganizerActionLog { Id = Guid.NewGuid(), OrganizerId = e.Id, Action = "UpdateOrganizer", Timestamp = DateTime.UtcNow, RelatedEntityId = e.Id });
        }

        public async Task DeleteAsync(Guid id)
        {
            await _repo.DeleteAsync(id);
            await _repo.AddActionLogAsync(new OrganizerActionLog { Id = Guid.NewGuid(), OrganizerId = id, Action = "DeleteOrganizer", Timestamp = DateTime.UtcNow, RelatedEntityId = id });
        }

        private OrganizerDto MapToDto(Organizer e) => new OrganizerDto
        {
            Id = e.Id,
            FullName = e.FullName,
            Email = e.Email,
            PhoneNumber = e.PhoneNumber,
            Gender = e.Gender,
            DateOfBirth = e.DateOfBirth,
            City = e.City,
            Region = e.Region,
            NationalIdNumber = e.NationalIdNumber,
            IsActive = e.IsActive,
            CreatedAt = e.CreatedAt,
            UpdatedAt = e.UpdatedAt
        };
    }
}

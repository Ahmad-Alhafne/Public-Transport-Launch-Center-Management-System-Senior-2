using Microsoft.AspNetCore.Mvc;
using OrganizerService.Application.DTOs;
using OrganizerService.Application.Services;
using System;
using System.Threading.Tasks;

namespace OrganizerService.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrganizerController : ControllerBase
    {
        private readonly OrganizerService.Application.Services.OrganizerService _service;

        public OrganizerController(OrganizerService.Application.Services.OrganizerService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var items = await _service.GetAllAsync();
            return Ok(items);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(Guid id)
        {
            var item = await _service.GetByIdAsync(id);
            if (item == null) return NotFound();
            return Ok(item);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] OrganizerDto dto)
        {
            // In a real app, password handling and validation occur here. For scaffold, use placeholder.
            var hashed = dto.Email + "::hashed";
            var created = await _service.CreateAsync(dto, hashed);
            return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] OrganizerDto dto)
        {
            if (id != dto.Id) return BadRequest();
            await _service.UpdateAsync(dto);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            await _service.DeleteAsync(id);
            return NoContent();
        }
    }
}

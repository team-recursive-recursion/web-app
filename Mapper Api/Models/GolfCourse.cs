using System;
using System.ComponentModel.DataAnnotations;

namespace Mapper_Api.Models
{
    public class GolfCourse
    {
        [Key] public Guid CourseId { get; set; }
        [Required] public Guid OwnerId { get; set; }
        [Required] public string CourseName { get; set; }
        [Required] public DateTime CreatedAt { get; set; }
        [Required] public DateTime UpdatedAt { get; set; }
        
    }
}
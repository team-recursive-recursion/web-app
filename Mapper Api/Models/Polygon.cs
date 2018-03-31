using System;
using System.ComponentModel.DataAnnotations;

namespace Mapper_Api.Models
{
    public class Polygon
    {
        public enum PolygonTypes
        {
            TEEBOX = 0,
            ROUGH = 1,
            OUTOFBOUNDS = 2,
            BUNKER = 3,
            WATERHAZARD = 4,
            FAIRWAY = 5,
            PUTTINGGREEN = 6,
        }

        [Key] public Guid PolygonId { get; set; }
        [Required] public Guid CourseId { get; set; }
        [Required] public Guid CreatorId { get; set; }
        [Required] public PolygonTypes Type { get; set; }
        [Required] public DateTime CreatedAt { get; set; }
        [Required] public DateTime UpdatedAt { get; set; }
    }
}
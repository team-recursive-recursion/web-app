using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using GeoJSON.Net.Contrib.Wkb;
using GeoJSON.Net.Geometry;

namespace Mapper_Api.Models
{
    public class CoursePolygon
    {
        public enum PolygonTypes
        {
            ROUGH = 0,
            GREEN = 1,
            FAIRWAY = 2,
            BUNKER = 3,
            WATERHAZARD = 4,
        }

        [Key] public Guid PolygonId { get; set; }
        [Required] public Guid CourseId { get; set; }
        [Required] public PolygonTypes Type { get; set; }
        [Required] public byte[] PolygonRaw { get; set; }
        [Required] public DateTime CreatedAt { get; set; }
        [Required] public DateTime UpdatedAt { get; set; }

        [NotMapped]
        [Required]
        public Polygon Polygon
        {
            get => PolygonRaw.ToGeoJSONObject<Polygon>();
        }
    }
}
﻿using System;
using System.ComponentModel.DataAnnotations;

namespace Mapper_Api.Models
{
    public class Point
    {
        public enum PointTypes
        {
            PIN = 0,
            HOLE = 1,
        }

        [Key] public Guid PolygonId { get; set; }
        [Required] public Guid CourseId { get; set; }
        [Required] public PointTypes Type { get; set; }
        [Required] public DateTime CreatedAt;
        [Required] public DateTime UpdatedAt;
    }
}
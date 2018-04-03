using System;
using System.ComponentModel.DataAnnotations;

namespace Mapper_Api.Models
{
    public class Owner
    {
        [Key] public Guid OwnerId { get; set; }
        
    }
}
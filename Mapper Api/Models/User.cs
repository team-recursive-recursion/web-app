using System;
using System.ComponentModel.DataAnnotations;

namespace Mapper_Api.Models
{
    public class User
    {
        [Key] public Guid UserID { get; set; }
        [Required] public string Name { get; set; }
        [Required] public string Surname { get; set; }
    }
}
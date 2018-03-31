

using System;
using System.Threading.Tasks;
using Mapper_Api.Models;
using Mapper_Api.Services;
using Xunit;

namespace Tests.API.CousreService
{
    public class GolfCourse : BaseCourseTest
    {
        [Fact]
        public async Task Valid_Success()
        {
            //arrange
            var name = "name";
            User user = new User
            {
                UserID = new Guid(),
                Name = "TEST",
                Surname = "TEST"
            };
            
            //act
            var golfCourse = await golfCourseService.CreateGolfCourse(user.UserID, name);
            
            //assert
            Assert.Equal(name, golfCourse.CourseName);
            Assert.Equal(user.UserID, golfCourse.OwnerId);
        }
    }
}
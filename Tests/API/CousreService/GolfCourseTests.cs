using System;
using System.Threading.Tasks;
using Mapper_Api.Context;
using Mapper_Api.Models;
using Mapper_Api.Services;
using Xunit;

namespace Tests.API.CousreService
{
    public class GolfCourseTest : BaseCourseTest
    {
        [Fact]
        public async Task CreateCourses_Valid_Success()
        {
            //arrange
            var courseName = "My New Golf Course";

            //act
            var golfCourse = await golfCourseService.CreateGolfCourse(courseName);

            //assert
            Assert.Equal(courseName, golfCourse.CourseName);
        }


        [Theory]
        [InlineData(null)]
        [InlineData("")]
        [InlineData(" ")]
        public async Task CreateCourse_Valid_Fail(String courseName)
        {
            //arrange (inline)
            //act
            var exception = await Assert.ThrowsAsync<ArgumentException>(() => golfCourseService.CreateGolfCourse(courseName));
            
            //assert
            Assert.Equal(nameof(GolfCourse.CourseName), exception.ParamName);
        }
    }
}
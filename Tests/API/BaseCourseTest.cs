using System;
using Mapper_Api.Services;
using Xunit;
using Mapper_Api.Services;

namespace Tests.API.CousreService
{
    public class BaseCourseTest
    {
        // Testable
        protected GolfCourseService golfCourseService;

        public BaseCourseTest()
        {
            golfCourseService = new GolfCourseService();
        }
    }
}
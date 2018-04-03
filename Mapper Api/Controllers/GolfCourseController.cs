using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Mapper_Api.Context;
using Mapper_Api.Models;
using Mapper_Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ViewFeatures.Internal;
using Microsoft.EntityFrameworkCore;

namespace Mapper_Api.Controllers
{
//    [Route("api/[controller]")] // specify manually wat dit moet wees
    public class GolfCourseController : Controller
    {
        private readonly GolfCourseService service;

        public GolfCourseController(GolfCourseService service)
        {
            var options = new DbContextOptionsBuilder<CourseDb>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            var context = new CourseDb(options);

            this.service = new GolfCourseService(context);
            //todo dont fake

            //this.service = service;
        }

        [HttpPost]
        public async Task<IActionResult> CreateCourse(String courseName)
        {
            var golfCourse = await service.CreateGolfCourse(courseName);
            return Ok(golfCourse);
        }

        [HttpGet]
        public async Task<IActionResult> GetCourses()
        {
            var golfCourses = service.GetGolfCourses();
            return Ok( await golfCourses.ToListAsync());
        }
        

        [HttpPost]
        public async Task<IActionResult> CreatePolygon(string geoJson, CoursePolygon.PolygonTypes type, Guid courseId)
        {
            var coursePoly = await service.CreatePolygon(courseId, type, geoJson);
            return Ok(coursePoly);
        }
    }
}
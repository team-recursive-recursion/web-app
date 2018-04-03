﻿using System;
using System.Threading.Tasks;
using Mapper_Api.Models;
using Xunit;
using GeoJSON.Net.Geometry;
using GeoJSON.Net.Contrib.Wkb;
using Newtonsoft.Json;

namespace Tests.API.CousreService
{
    public class CoursePolygon : BaseCourseTest
    {
        [Fact]
        public async Task CreatePoly_Valid_Success()
        {
            //arrange
            var courseID = Guid.NewGuid();
            var polygonType = Mapper_Api.Models.CoursePolygon.PolygonTypes.BUNKER;
            string jsonString =
                "{\"type\": \"Polygon\",\"coordinates\": [[[-64.73, 32.31],[-80.19, 25.76],[-66.09, 18.43],[-64.73, 32.31]]]}";

            //act
            var golfCourse = await golfCourseService.CreatePolygon(courseID, polygonType, jsonString);

            //assert
            Assert.Equal(polygonType, golfCourse.Type);
            Assert.Equal(courseID, golfCourse.CourseId);
        }
    }
}
﻿using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
 using GeoJSON.Net.Contrib.Wkb;
 using Mapper_Api.Context;
using Mapper_Api.Models;
using Newtonsoft.Json;
using SQLitePCL;

namespace Mapper_Api.Services
{
    public class GolfCourseService
    {
        private CourseDb db;

        public GolfCourseService(CourseDb courseDb)
        {
            this.db = courseDb;
        }

        public async Task<GolfCourse> CreateGolfCourse(string courseName)
        {
            GolfCourse course = new GolfCourse
            {
                CourseId = Guid.NewGuid(),
                CourseName = courseName,
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now
            };

            ValidationContext validationContext = new ValidationContext(course);
            var results = new List<ValidationResult>();
            if (!Validator.TryValidateObject(course, validationContext, results, true))
            {
                throw new ArgumentException(results.First().ErrorMessage, results.First().MemberNames.FirstOrDefault());
            }

            db.GolfCourses.Add(course);

            await db.SaveChangesAsync();

            return course;
        }

        public async Task<CoursePolygon> CreatePolygon(Guid courseId, CoursePolygon.PolygonTypes polygonType,
            string geoJSONString)
        {
            GeoJSON.Net.Geometry.Polygon polygon =
                JsonConvert.DeserializeObject<GeoJSON.Net.Geometry.Polygon>(geoJSONString);
            var coursePolygon = new CoursePolygon
            {
                PolygonRaw = polygon.ToWkb(),
                CourseId = courseId,
                PolygonId = Guid.NewGuid(),
                Type = polygonType
            };
            ValidationContext validationContext = new ValidationContext(coursePolygon);
            var results = new List<ValidationResult>();
            if (!Validator.TryValidateObject(coursePolygon, validationContext, results, true))
            {
                throw new ArgumentException(results.First().ErrorMessage, results.First().MemberNames.FirstOrDefault());
            }

            db.CoursePolygons.Add(coursePolygon);

            await db.SaveChangesAsync();

            return coursePolygon;
        }

        public async Task<Point> CreatePoint(Guid creatorId, Guid courseId, Point.PointTypes pointType)
        {
            throw new NotImplementedException("Create Point");
        }

        public async Task<GolfCourse> UpdateGolfCourse(Guid ownerId, string courseName)
        {
            throw new NotImplementedException("Update Golf Course");
        }

        public async Task<CoursePolygon> UpdatePolygon(Guid creatorId, Guid courseId,
            CoursePolygon.PolygonTypes polygonType)
        {
            throw new NotImplementedException("Update Polygon");
        }

        public async Task<Point> UpdatePoint(Guid creatorId, Guid courseId, Point.PointTypes pointType)
        {
            throw new NotImplementedException("Update Point");
        }

        public async Task<GolfCourse> RemoveGolfCourse(Guid ownerId, string courseName)
        {
            throw new NotImplementedException("Remove Golf Course");
        }

        public async Task<CoursePolygon> RemovePolygon(Guid creatorId, Guid courseId,
            CoursePolygon.PolygonTypes polygonType)
        {
            throw new NotImplementedException("Remove Polygon");
        }

        public async Task<Point> RemovePoint(Guid creatorId, Guid courseId, Point.PointTypes pointType)
        {
            throw new NotImplementedException("Remove Point");
        }

        public IQueryable<GolfCourse> GetGolfCourses()
        {
            return db.GolfCourses;
        }

        public IQueryable<CoursePolygon> GetGolfPolygons()
        {
            return db.CoursePolygons;
        }
    }
}
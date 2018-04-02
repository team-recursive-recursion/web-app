using System;
using System.Threading.Tasks;
using Mapper_Api.Models;
using SQLitePCL;

namespace Mapper_Api.Services
{
    public class GolfCourseService
    {
        public GolfCourseService()
        {
        }

        public async Task<GolfCourse> CreateGolfCourse(Guid ownerId, string courseName)
        {
            throw new NotImplementedException("Create Golf Course");
        }

        public async Task<Polygon> CreatePolygon(Guid creatorId, Guid courseId, Polygon.PolygonTypes polygonType)
        {
            throw new NotImplementedException("Crate Polygon");
        }

        public async Task<Point> CreatePoint(Guid creatorId, Guid courseId, Point.PointTypes pointType)
        {
            throw new NotImplementedException("Create Point");
        }

        public async Task<GolfCourse> UpdateGolfCourse(Guid ownerId, string courseName)
        {
            throw new NotImplementedException("Update Golf Course");
        }

        public async Task<Polygon> UpdatePolygon(Guid creatorId, Guid courseId, Polygon.PolygonTypes polygonType)
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

        public async Task<Polygon> RemovePolygon(Guid creatorId, Guid courseId, Polygon.PolygonTypes polygonType)
        {
            throw new NotImplementedException("Remove Polygon");
        }

        public async Task<Point> RemovePoint(Guid creatorId, Guid courseId, Point.PointTypes pointType)
        {
            throw new NotImplementedException("Remove Point");
        }
    }
}
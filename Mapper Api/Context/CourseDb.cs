using Mapper_Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Internal;

namespace Mapper_Api.Context
{
    public class CourseDb : DbContext
    {
        public CourseDb(DbContextOptions<CourseDb> options) : base(options)
        {
        }

        public DbSet<GolfCourse> GolfCourses { get; set; }
        public DbSet<CoursePolygon> CoursePolygons { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<GolfCourse>()
                .Property(b => b.CreatedAt)
                .HasDefaultValueSql("getdate()");

            modelBuilder.Entity<GolfCourse>()
                .Property(b => b.UpdatedAt)
                .HasDefaultValueSql("getdate()");
            
            modelBuilder.Entity<CoursePolygon>()
                .Property(b => b.CreatedAt)
                .HasDefaultValueSql("getdate()");

            modelBuilder.Entity<CoursePolygon>()
                .Property(b => b.UpdatedAt)
                .HasDefaultValueSql("getdate()");
            
//            modelBuilder.Entity<CoursePolygon>()
//                .Property(b => b.Polygon).
        }
    }
}
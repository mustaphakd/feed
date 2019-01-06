using Feed.Web.Services.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using System;
using System.Collections.Generic;
using System.Text;

namespace Feed.Web.Services.Repository
{
    public class FeedDbContext : IdentityDbContext<User, IdentityRole, string>, IDesignTimeDbContextFactory<FeedDbContext>
    {
        public FeedDbContext(DbContextOptions<FeedDbContext> options)
            : base(options)
        {
        }

        public FeedDbContext() : base()
        {

        }

        public DbSet<User> FeedUsers { get; set; }
        
        public DbSet<Bookmark> Bookmarks { get; set; }
        public DbSet<Models.Feed> Feeds { get; set; }

        public DbSet<Preference> Preferences { get; set; }

        public DbSet<Rating> Ratings { get; set; }

        public DbSet<Tag> Tags { get; set; }
        public DbSet<UserFeeds> UserFeeds { get; set; }

        public FeedDbContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<FeedDbContext>();
            optionsBuilder.UseSqlServer("Server=(localdb)\\mssqllocaldb;Database=FeedBackend;Trusted_Connection=True;MultipleActiveResultSets=true");

            var context = new FeedDbContext(optionsBuilder.Options);            
            return context;
        }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<User>(userBuilder => {

                userBuilder.HasBaseType<IdentityUser>()
                .HasMany<Bookmark>(u => u.Bookmarks)
                .WithOne(b => b.User)
                .HasForeignKey(b => b.UserId)
                .IsRequired();

                userBuilder
                .HasMany(u => u.UsersFeeds)
                .WithOne(uf => uf.User)
                .HasForeignKey(uf => uf.UserId)
                .IsRequired();

                userBuilder.HasMany<Rating>(u => u.FeedRatings)
                .WithOne(fr => fr.User)
                .HasForeignKey(fr => fr.UserId)
                .IsRequired();

                userBuilder
                .HasOne<Preference>(u => u.Preference)
                .WithOne(p => p.User)
                .HasForeignKey<Preference>(p => p.UserId)
                .IsRequired();

            });

            builder.Entity<Models.Feed>(feedBuilder => {

                feedBuilder
                    .HasMany(f => f.UsersFeeds)
                    .WithOne(uf => uf.Feed)
                    .HasForeignKey(uf => uf.FeedId)
                    .IsRequired();

                feedBuilder
                    .HasMany(f => f.FeedTags)
                    .WithOne(ft => ft.Feed)
                    .HasForeignKey(ft => ft.FeedId)
                    .IsRequired();

                feedBuilder
                    .HasMany(f => f.Ratings)
                    .WithOne(r => r.Feed)
                    .HasForeignKey(r => r.FeedId)
                    .IsRequired();
            });

            builder.Entity<Tag>(tagBuilder => {

                tagBuilder
                    .HasMany(t => t.FeedTags)
                    .WithOne(ft => ft.Tag)
                    .HasForeignKey(ft => ft.TagId)
                    .IsRequired();

                tagBuilder
                    .HasMany(t => t.PreferenceTags)
                    .WithOne(pt => pt.Tag)
                    .HasForeignKey(pt => pt.TagId)
                    .IsRequired();
            });

            builder.Entity<Preference>(preferenceBuilder => {

                preferenceBuilder
                    .HasMany(p => p.PreferredTags)
                    .WithOne(pt => pt.Preference)
                    .HasForeignKey(pt => pt.PreferenceId)
                    .IsRequired();

            });

        }
    }
}

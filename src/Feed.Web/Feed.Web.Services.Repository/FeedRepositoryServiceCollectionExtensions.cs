using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Feed.Web.Services.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;

namespace Feed.Web.Services.Repository
{
    public static class FeedRepositoryServiceCollectionExtensions
    {
        public static void AddFeedRepositories(this IServiceCollection services, IConfiguration configuration)
        {            
            services.AddDbContext<FeedDbContext>(options =>
                options.UseSqlServer(
                    configuration.GetConnectionString("DefaultConnection")));

            services.Add(new ServiceDescriptor(typeof(DbContextOptions<DbContext>), typeof(DbContextOptions<FeedDbContext>), ServiceLifetime.Scoped));
            services.Add(new ServiceDescriptor(typeof(DbContext), typeof(FeedDbContext), ServiceLifetime.Scoped));
                       
        }

        public static IdentityBuilder AddFeedContextUserStore(this IdentityBuilder identityBuilder, IServiceCollection services)
        {
            identityBuilder.AddUserStore<UserStore<User>>();

            services.Add(new ServiceDescriptor(typeof(IUserRoleStore<User>), typeof(UserStore<User>), ServiceLifetime.Scoped));
            return identityBuilder;
        }
    }
}

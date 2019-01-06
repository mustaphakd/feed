using Feed.Web.Services.Repository;
using System;
using System.Linq;
using Microsoft.Extensions.DependencyInjection;
using System.Collections.Generic;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Feed.Web.Services.Security;
using Feed.Web.Helpers;
using Feed.Web.Services.Models;
using Feed.Web.Services.Security.Core;

namespace Feed.Web.Services.Extensions
{
    public static class DbContextSeedingExtensions
    {
        public const string UsersPassword = "Musmus_1";
        public static void Seed(this FeedDbContext context, IServiceProvider serviceProvider)
        {
            context.Database.EnsureCreated();

            EnsureRolesCreated(context, serviceProvider);
            EnsureDefaultUsersWithRoleCreated(context, serviceProvider);
        }

        private static void EnsureDefaultUsersWithRoleCreated(FeedDbContext context, IServiceProvider serviceProvider)
        {
            Check.NotNull(context, nameof(context));
            Check.NotNull(serviceProvider, nameof(serviceProvider));

            var userManager = serviceProvider.GetService<UserManager<User>>();
            var dbConTextFeed = serviceProvider.GetService<FeedDbContext>();
            var dbContext = serviceProvider.GetService<Microsoft.EntityFrameworkCore.DbContext>();
            var userRoleStore = serviceProvider.GetService<IUserRoleStore<User>>();

            CreateAdminUser(userManager, userRoleStore);
            CreatePatrons(userManager, userRoleStore);
        }

        private static void CreatePatrons(UserManager<User> userManager, IUserRoleStore<User> userRoleStore)
        {
            EnsureCreateUserWithRole("user1", "user1@mod.us", UserRoles.Patron, userManager, userRoleStore, "Failed to create user1");
            EnsureCreateUserWithRole("user2", "user2@mod.us", UserRoles.Patron, userManager, userRoleStore, "Failed to create user2");
            EnsureCreateUserWithRole("user3", "user3@mod.us", UserRoles.Patron, userManager, userRoleStore, "Failed to create user3");
        }

        private const string AdminEmail = "feed_admin@mod.us";
        private const string AdminName = "modusAdmin";
        private static void CreateAdminUser(UserManager<User> userManager, IUserRoleStore<User> userRoleStore)
        {
            EnsureCreateUserWithRole(AdminName, AdminEmail, UserRoles.Admin, userManager, userRoleStore, "Failed to create Admin user");
        }

        private static void EnsureCreateUserWithRole(string userName, string userEmail, UserRoles userRole, UserManager<User> userManager, IUserRoleStore<User> userRoleStore, string errorMessage)
        {
            Check.NotNull(userName, nameof(userName));
            Check.NotNull(userEmail, nameof(userEmail));
            Check.NotNull(userManager, nameof(userManager));
            Check.NotNull(userRoleStore, nameof(userRoleStore));

            var user = userManager.FindByEmailAsync(userEmail).Result;

            if (user?.Email != userEmail)
            {
                user = new User { UserName = userName, Email = userEmail };
                var result = userManager.CreateAsync(user, UsersPassword).Result;

                if (result.Succeeded == false)
                {
                    var errorsDescriptions = String.Join("\n", result.Errors.Select(identityError => $"[[ErrorCode: {identityError.Code}]]::{identityError.Description}\n").ToArray());
                    throw new InvalidOperationException(errorMessage + "\n " + errorsDescriptions);
                }
            }

            userRoleStore.AddToRoleAsync(user, UserRolesConverter.ToString(userRole), System.Threading.CancellationToken.None).ConfigureAwait(false).GetAwaiter().GetResult();
        }

        private static void CreateRoleIfNotExist(UserRoles role, IServiceProvider serviceProvider)
        {
            Check.NotNull(serviceProvider, nameof(serviceProvider));

            var roleManager = serviceProvider.GetService<RoleManager<IdentityRole>>();

            if (!roleManager.RoleExistsAsync(UserRolesConverter.ToString(role)).Result)
            {
                roleManager.CreateAsync(new IdentityRole(UserRolesConverter.ToString(role))).ConfigureAwait(false).GetAwaiter().GetResult();
            }
        }

        private static void EnsureRolesCreated(FeedDbContext context, IServiceProvider serviceProvider)
        {
            Check.NotNull(context, nameof(context));
            Check.NotNull(serviceProvider, nameof(serviceProvider));

            CreateRoleIfNotExist(UserRoles.Admin, serviceProvider);
            CreateRoleIfNotExist(UserRoles.Patron, serviceProvider);
        }
    }
}

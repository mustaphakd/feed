using Feed.Web.Services.Models;
using Feed.Web.Services.Repository;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.AspNetCore.Authentication;
using System;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.Extensions.Options;
using Microsoft.AspNetCore.Identity;
using System.Collections.Generic;
using Feed.Web.Services.Security;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Feed.Web.Services.Extensions;
using Microsoft.AspNetCore.Authorization;
using Feed.Web.Services.Security.AuthorizationHandlers;

namespace Feed.Web.Services.DependencyInjection
{
    public static class FeedServiceCollectionExtensions
    {
        public static SecurityBuildersAccessor AddFeedServices(this IServiceCollection services, IConfiguration configuration)
        {

            services.AddFeedRepositories(configuration); // <--> identityBUilder.AddEntityFrameworkStores


            var identityBuilder = services
                .AddIdentity<User, IdentityRole>(options =>
                {
                    //not best practice but suitable for RAD
                    options.Password.RequireDigit = false;
                    options.Password.RequiredLength = 4;
                    options.Password.RequireNonAlphanumeric = false;
                    options.Password.RequireUppercase = false;
                    options.Password.RequiredUniqueChars = 0;

                    options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromHours(1);
                    options.Lockout.MaxFailedAccessAttempts = 20;
                    options.Lockout.AllowedForNewUsers = true;

                    options.SignIn.RequireConfirmedEmail = false;
                    options.SignIn.RequireConfirmedPhoneNumber = false;

                    options.User.RequireUniqueEmail = true;
                })
                .AddFeedContextUserStore(services)
                .AddUserManager<AspNetUserManager<User>>()
                .AddSignInManager<SignInManager<User>>()
                .AddEntityFrameworkStores<FeedDbContext>();

            services.AddScoped<SignInHandler>();
            services.Add(new ServiceDescriptor(typeof(UserManager<User>), typeof(AspNetUserManager<User>), ServiceLifetime.Scoped));


            services.AddScoped<IUserAccessor, DefaultUserAccessor>();
            services.AddScoped<IAuthenticationService, Security.AuthenticationService>();

            var authenticationBuilder = services.AddAuthentication(authenticationOptions =>
            {
                //CookieAuthenticationDefaults.AuthenticationScheme; throws InvalidOperationException: No authentication handler is registered for the scheme 'Identity.Application'. The registered schemes are: Cookies. Did you forget to call AddAuthentication().Add[SomeAuthHandler]("Identity.Application",...)?
                // IdentityConstants.ApplicationScheme;
                authenticationOptions.DefaultSignInScheme = CookieAuthenticationDefaults.AuthenticationScheme;
                authenticationOptions.DefaultSignOutScheme = CookieAuthenticationDefaults.AuthenticationScheme;
                authenticationOptions.DefaultAuthenticateScheme = CookieAuthenticationDefaults.AuthenticationScheme;
                authenticationOptions.DefaultChallengeScheme = CookieAuthenticationDefaults.AuthenticationScheme;
                authenticationOptions.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
                authenticationOptions.DefaultForbidScheme = CookieAuthenticationDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(bearerOptions =>
            {

                bearerOptions.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters()
                {
                    ValidateAudience = true,
                    ValidateIssuer = true,
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = Constant.TokenSecurity.jwtAuthenticationIssuerSigningKey,
                    ValidIssuer = Constant.TokenSecurity.JwtAuthenticationAuthority,
                    ValidAudience = Constant.TokenSecurity.JwtAuthenticationAudience,
                    ClockSkew = TimeSpan.FromSeconds(19)
                };
            });
            ///// .AddCookie(configurationOptions => {
            //    configurationOptions.SlidingExpiration = true;
            //});

            services.AddScoped<UserRegistrationManager>();
            services.AddScoped<FeedService>();

            var securityBuilderAccessor = new SecurityBuildersAccessor(identityBuilder, authenticationBuilder);
            return securityBuilderAccessor;

        }

        public static IApplicationBuilder ConfigureFeedServices(this IApplicationBuilder app, IHostingEnvironment env)
        {
            var serviceProvider = app.ApplicationServices;
            // var serviceCollection = serviceProvider.GetService<IServiceCollection>();
            //var scopeFactory = serviceCollection.BuildServiceProvider();
            using (var scope = serviceProvider.CreateScope())
            {
                var dbContext = scope.ServiceProvider.GetService<FeedDbContext>();
                dbContext.Seed(scope.ServiceProvider);
            }
            return app;
        }

        public static IServiceCollection AddAuthenticationHandlers(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddAuthorization(options =>
            {
                options.InvokeHandlersAfterFailure = false;
            });

            services.AddScoped<IAuthorizationHandler, FeedServiceAuthorizationHandler>();
            return services;
        }

    }
}

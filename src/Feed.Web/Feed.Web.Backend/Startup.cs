using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc.Authorization;
using Feed.Web.Services.DependencyInjection;

using Microsoft.Extensions.Logging;
using Serilog.Core;
using Serilog.Events;
using Serilog;

using Serilog.Sinks.SystemConsole.Themes;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.Extensions.FileProviders;
using System.IO;

namespace Feed.Web.Backend
{
    public class Startup
    {
        public static LoggingLevelSwitch MyLoggingLevelSwitch { get; set; }
        public Startup(IConfiguration configuration, IHostingEnvironment env)
        {
            Configuration = configuration;
            MyLoggingLevelSwitch = new LoggingLevelSwitch();
            MyLoggingLevelSwitch.MinimumLevel = LogEventLevel.Verbose;

            Log.Logger = new LoggerConfiguration()
                .MinimumLevel.ControlledBy(MyLoggingLevelSwitch)
                .Enrich.WithProperty("App", "FeedAngularApp")
                .Enrich.FromLogContext()
                .WriteTo.Console(theme: AnsiConsoleTheme.Code)
               // .WriteTo.Seq("http://localhost:5341")
                .WriteTo.RollingFile("../Logs/FeedAngularApp")
                .CreateLogger();

            var builder = new ConfigurationBuilder()
                .SetBasePath(env.ContentRootPath)
                .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
                .AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true)
                .AddEnvironmentVariables();
            Configuration = builder.Build();
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddCors(options =>
            {
                options.AddDefaultPolicy(builder =>
                {
                    builder.AllowAnyHeader();
                    builder.AllowAnyMethod();
                    builder.AllowAnyOrigin();
                    builder.AllowCredentials();
                });
            });

            services.Configure<CookiePolicyOptions>(options =>
            {
                // This lambda determines whether user consent for non-essential cookies is needed for a given request.
                options.CheckConsentNeeded = context => true;
                options.MinimumSameSitePolicy = SameSiteMode.None;
            });

            services.ConfigureApplicationCookie(options => {
                options.Cookie.HttpOnly = true;
                options.ExpireTimeSpan = TimeSpan.FromHours(1);
                options.SlidingExpiration = true;
            });

            var buildersAccessors = services.AddFeedServices(Configuration);
            buildersAccessors.identityBuilder
                .AddDefaultUI()
                .AddDefaultTokenProviders();
            //forget to call AddAuthentication().AddCookies("Identity.External"
           // buildersAccessors.authenticationBuilder.AddCookie("Identity.External");
            //buildersAccessors.authenticationBuilder.AddCookie(IdentityConstants.ApplicationScheme);
            //buildersAccessors.authenticationBuilder.AddCookie("Identity.TwoFactorUserId"); //default UI core implementation signout logic needs it
           // buildersAccessors.authenticationBuilder.AddCookie("Identity.TwoFactorRememberMe"); // ||
           

            //IdentityConstants.ApplicationScheme for default UI core implementation
            services.AddMvc(config => {
                var policy = new AuthorizationPolicyBuilder(new[] {  IdentityConstants.ApplicationScheme, JwtBearerDefaults.AuthenticationScheme }) //CookieAuthenticationDefaults.AuthenticationScheme,
                            .RequireAuthenticatedUser()
                            .Build() ;
                
                config.Filters.Add(new AuthorizeFilter(policy));

                config.RespectBrowserAcceptHeader = true;

            }).SetCompatibilityVersion(CompatibilityVersion.Version_2_1);

            services.AddAuthenticationHandlers(Configuration);

            // After launching app, you can navigate to xxxx to view backend api accessing to mobile and front ends
            services.AddSwaggerGen(c => {
                c.SwaggerDoc("v1", new Swashbuckle.AspNetCore.Swagger.Info { Title = "Modus Feed Api", Version = "V1" });
            });
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerFactory, IAntiforgery antiforgery)
        {
            //loggerFactory.AddConsole(LogLevel.Trace, true); will use serilog console instead :)
            loggerFactory.AddDebug();
            loggerFactory.AddSerilog();

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseDatabaseErrorPage();
            }
            else
            {
                app.UseExceptionHandler("/Home/Error");
                app.UseHsts();
            }

            //skipping Csp

            // cors
            app.UseCors();

            app.ConfigureFeedServices(env);

            app.UseHttpsRedirection();

            app.UseSpaStaticFiles(
                new StaticFileOptions(
                    new Microsoft.AspNetCore.StaticFiles.Infrastructure.SharedOptions
                    {
                        FileProvider = new PhysicalFileProvider(Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/dist"))
                    }));
            app.UseStaticFiles();
            app.UseCookiePolicy();
            //https://github.com/aspnet/Security/issues/1310
            app.UseAuthentication();
            app.UseMvcWithDefaultRoute();
            
            app.UseSwagger();
            app.UseSwaggerUI(c => {
                c.SwaggerEndpoint("../swagger/v1/swagger.json", "Modus Feed ApI");
            });
        }
    }
}

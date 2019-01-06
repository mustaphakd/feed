using Feed.Web.Helpers;
using Feed.Web.Services.Security.AuthorizationRequirements;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Feed.Web.Services.Security.AuthorizationHandlers
{
    public abstract class AuthorizationHandlerBase<TResource, TRequirement> : AuthorizationHandler<TRequirement> where TRequirement : ServiceRequirement
        where TResource: class
    {
        protected AuthorizationHandlerBase(IUserAccessor userAccessor, ILogger<AuthorizationHandlerBase<TResource, TRequirement>> logger)
        {
            Check.NotNull(userAccessor, nameof(userAccessor));
            Check.NotNull(logger, nameof(logger));

            Logger = logger;
            UserAccessor = userAccessor;
        }

        public IUserAccessor UserAccessor { get; }
        public ILogger<AuthorizationHandlerBase<TResource, TRequirement>> Logger { get; }

        public bool IsUserAuthenticated
        {
            get
            {
                var principal = UserAccessor.User;

                if (principal != null && principal.Identity.IsAuthenticated)
                {
                    return true;
                }

                return false;
            }
        }

        protected override async Task HandleRequirementAsync(AuthorizationHandlerContext context, TRequirement requirement)
        {
            Check.NotNull(context, nameof(context));
            Check.NotNull(requirement, nameof(requirement));

            var expectedResourceType = typeof(TResource);
            var resourceType = context.Resource.GetType();

            if (! expectedResourceType.IsAssignableFrom(resourceType)) { return; }

            string message = this.GetType().Name + " Executing AuthorizationRequirement Handler....";
            Check.CallerLog(Logger, LoggerExecutionPositions.Body, message);

            var authorizationContext = new AuthorizationHandlerBaseContext<TResource, TRequirement>(context, requirement, UserAccessor);
            await HandleRequirementAsync(authorizationContext);
        }

        internal abstract Task HandleRequirementAsync(AuthorizationHandlerBaseContext<TResource, TRequirement> context);
    }
}

using Feed.Web.Helpers;
using Feed.Web.Services.Models;
using Feed.Web.Services.Security.AuthorizationRequirements;
using Feed.Web.Services.Security.Core;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Feed.Web.Services.Security.AuthorizationHandlers
{
    internal class FeedServiceAuthorizationHandler : AuthorizationHandlerBase<Models.Feed, ServiceRequirement>
    {
        public FeedServiceAuthorizationHandler(IUserAccessor userAccessor, ILogger<AuthorizationHandlerBase<Models.Feed, ServiceRequirement>> logger) : base(userAccessor, logger)
        {
        }
        internal override async Task HandleRequirementAsync(AuthorizationHandlerBaseContext<Models.Feed, ServiceRequirement> context)
        {
            Check.NotNull(context, nameof(context));

            var requirementResourceType = context.Requirement.ResourceType;

            if (requirementResourceType != Core.ResourceTypes.Feed)
            {
                Check.CallerLog(Logger, LoggerExecutionPositions.Entrance, "Incompatiple Resource type suggested for FeedServiceAuthorizationHandler.");
                context.Context.Fail();
            }

            var requirementOperation = context.Requirement.Operation;
            var hasValidPermission = false;

            switch(requirementOperation)
            {
                case Core.ServiceOperations.Create:
                case Core.ServiceOperations.ReadOnly:
                case Core.ServiceOperations.Update:
                case Core.ServiceOperations.Delete:
                    hasValidPermission = await this.UserAccessor.IsUserInRole(UserRolesConverter.ToString(UserRoles.Patron));
                    break;
                /*case Core.ServiceOperations.Delete:
                    hasValidPermission = await this.UserAccessor.IsUserInRole(UserRolesConverter.ToString(UserRoles.Admin)); */
                   // break;
                default:
                    throw new InvalidOperationException("Invalid requirementOperation:: " + requirementOperation.ToString("G"));
            }

            if(! hasValidPermission)
            {
                context.Context.Fail();
                return;
            }

            context.Context.Succeed(context.Requirement);
        }
    }
}

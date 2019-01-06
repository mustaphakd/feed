using Feed.Web.Services.Models;
using Feed.Web.Services.Security.AuthorizationRequirements;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Feed.Web.Services.Security.AuthorizationHandlers
{
    internal class ProfileServiceAuthorizationHandler : AuthorizationHandlerBase<Models.Preference, ServiceRequirement>
    {
        public ProfileServiceAuthorizationHandler(IUserAccessor userAccessor, ILogger<AuthorizationHandlerBase<Models.Preference, ServiceRequirement>> logger) : base(userAccessor, logger)
        {
        }
        internal override Task HandleRequirementAsync(AuthorizationHandlerBaseContext<Models.Preference, ServiceRequirement> context)
        {
            throw new NotImplementedException();
        }
    }
}
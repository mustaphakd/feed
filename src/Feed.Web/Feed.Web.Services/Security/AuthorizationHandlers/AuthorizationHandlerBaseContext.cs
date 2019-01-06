using Feed.Web.Helpers;
using Feed.Web.Services.Security.AuthorizationRequirements;
using Feed.Web.Services.Security.Core;
using Microsoft.AspNetCore.Authorization;
using System;
using System.Collections.Generic;
using System.Text;

namespace Feed.Web.Services.Security.AuthorizationHandlers
{
    internal class AuthorizationHandlerBaseContext<T, TRequirement> where T : class
        where TRequirement : ServiceRequirement
    {
        public AuthorizationHandlerBaseContext(AuthorizationHandlerContext context, TRequirement requirement, IUserAccessor userAccessor)
        {
            Check.NotNull(context, nameof(context));
            Check.NotNull(requirement, nameof(requirement));
            Check.NotNull(userAccessor, nameof(userAccessor));

            Context = context;
            Requirement = requirement;
            UserAccessor = userAccessor;
        }

        public AuthorizationHandlerContext Context { get; }
        public TRequirement Requirement { get; }
        public IUserAccessor UserAccessor { get; }
    }
}

using Feed.Web.Services.Security.AuthorizationRequirements;
using Feed.Web.Services.Security.Core;
using Microsoft.AspNetCore.Authorization;
using System;
using System.Collections.Generic;
using System.Text;

namespace Feed.Web.Services.Security
{
    public static class AuthorizationRequirementProvider
    {
        public static IEnumerable<IAuthorizationRequirement> GetRequirementsFor(ResourceTypes expectedResource, ServiceOperations operation)
        {
            return new[] { new ServiceRequirement(expectedResource, operation) };
        }
    }
}

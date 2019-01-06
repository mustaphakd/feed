using Feed.Web.Services.Security.Core;
using Microsoft.AspNetCore.Authorization;
using System;
using System.Collections.Generic;
using System.Text;

namespace Feed.Web.Services.Security.AuthorizationRequirements
{
    public class ServiceRequirement : IAuthorizationRequirement
    {
        public ServiceRequirement(ResourceTypes expectedResource, ServiceOperations operation)
        {
            ResourceType = expectedResource;
            Operation = operation;
        }

        public ResourceTypes ResourceType { get; }
        public ServiceOperations Operation { get; }
    }
}

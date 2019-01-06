using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace Feed.Web.Services
{
    public interface IUserAccessor
    {
        ClaimsPrincipal User { get; }

        Task<bool> IsUserInRole(string role);

        Task<IEnumerable<Claim>> GetUserClaims();

        string UserIdentier { get; }
    }
}

using Feed.Web.Helpers;
using Feed.Web.Services.Models;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using System.Linq;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Http;

namespace Feed.Web.Services.Security
{
    internal class DefaultUserAccessor : IUserAccessor
    {

        private readonly UserManager<User> _userManager;
        public DefaultUserAccessor(UserManager<User> userManager, IHttpContextAccessor httpContextAccessor,  ClaimsPrincipal user = null)
        {
            Check.NotNull(userManager, nameof(userManager));
            Check.NotNull(httpContextAccessor, nameof(httpContextAccessor));

            HttpContextAccessor = httpContextAccessor;
            // User = user ?? httpContextAccessor?.HttpContext?.User ?? new ClaimsPrincipal();
            _userManager = userManager;
        }
        public ClaimsPrincipal User {
            get
            {
                return this.HttpContextAccessor?.HttpContext?.User ?? new ClaimsPrincipal();
            }
        }

        public IHttpContextAccessor HttpContextAccessor { get; }

        public string UserIdentier => this.User?.Claims?.First(
                    c => c.Type.Equals(
                        ClaimTypes.NameIdentifier, StringComparison.InvariantCultureIgnoreCase)).Value ?? String.Empty;

        public async Task<IEnumerable<Claim>> GetUserClaims()
        {
            var claims = await Task.FromResult( new List<Claim>());
            /*IdentityOptions _options = new IdentityOptions();
            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.),
                new Claim(JwtRegisteredClaimNames.Jti, await _jwtOptions.JtiGenerator()),
                new Claim(JwtRegisteredClaimNames.Iat, ToUnixEpochDate(_jwtOptions.IssuedAt).ToString(), ClaimValueTypes.Integer64),
                new Claim(_options.ClaimsIdentity.UserIdClaimType, (string)principal.Identity.Name),
                new Claim(_options.ClaimsIdentity.UserNameClaimType, (string)principal.Identity.Name)
            };
            var userClaims = await _userManager.GetClaimsAsync(user);
            var userRoles = await _userManager.GetRolesAsync(user);
            claims.AddRange(userClaims);
            foreach (var userRole in userRoles)
            {
                claims.Add(new Claim(ClaimTypes.Role, userRole));
                var role = await _roleManager.FindByNameAsync(userRole);
                if (role != null)
                {
                    var roleClaims = await _roleManager.GetClaimsAsync(role);
                    foreach (Claim roleClaim in roleClaims)
                    {
                        claims.Add(roleClaim);
                    }
                }
            }*/
            return claims;
        }

        public async Task<bool> IsUserInRole(string role)
        {
            Check.NotNull(role, nameof(role));

            if (User == null) return false;

            var userIdentifier = this.UserIdentier;

            var modelUser = await _userManager.FindByIdAsync(
               userIdentifier ?? String.Empty);

            if (modelUser == null) return false;

            var isInRole = await _userManager.IsInRoleAsync(modelUser, role);
            return isInRole;
        }
    }



    /*private async Task<object> GenerateJwtTokenAsync(string email, ApplicationUser user)
    {
        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, email),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(ClaimTypes.NameIdentifier, user.Id)
        };

        var roles = await _userManager.GetRolesAsync(user);

        claims.AddRange(roles.Select(role => new Claim(ClaimsIdentity.DefaultRoleClaimType, role)));
    }*/
}

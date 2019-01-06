using Feed.Web.Services.Models;
using Feed.Web.Services.Repository;
using Microsoft.AspNetCore.Identity;
using Feed.Web.Helpers;
using System.Linq;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Authentication;

namespace Feed.Web.Services.Security
{
    public class SignInHandler
    {
        private readonly SignInManager<User> _signInManager;
        private readonly FeedDbContext _dbContext;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public SignInHandler(SignInManager<User> signInManager, FeedDbContext dbContext, IHttpContextAccessor httpContextAccessor)
        {
            Check.NotNull(signInManager, nameof(signInManager));
            Check.NotNull(dbContext, nameof(dbContext));
            Check.NotNull(httpContextAccessor, nameof(httpContextAccessor));

            _signInManager = signInManager;
            _dbContext = dbContext;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<SignInResult> LoginAsync(string userEmail, string password, bool isPersistent, string scheme = null)
        {
            // perform complex logic before authentication user
            var user = _dbContext.Users.FirstOrDefault(usr => usr.Email == userEmail);

            if (user == null) return SignInResult.Failed;

            var result = await _signInManager.CheckPasswordSignInAsync(user, password, false);
            //var result = await _signInManager.PasswordSignInAsync(user, password, isPersistent, false);

            var userPrincipal = await _signInManager.CreateUserPrincipalAsync(user);

            scheme = scheme ?? IdentityConstants.ApplicationScheme;

            await _httpContextAccessor.HttpContext.SignInAsync(
                scheme,
                userPrincipal,
                new AuthenticationProperties());

            return result;
        }

        public async Task Logout()
        {
            await _httpContextAccessor.HttpContext.SignOutAsync();
        }
    }
}

using Feed.Web.Helpers;
using Feed.Web.Services.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.UI.Services;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Feed.Web.Services.Security
{
    public class UserRegistrationManager : BaseService<UserRegistrationManager>
    {
        private readonly UserManager<User> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly IUserStore<User> _userStore;
        private readonly IUserEmailStore<User> _emailStore;
        private readonly IEmailSender _emailSender;

        public UserRegistrationManager(
            UserManager<User> userManager,
            IUserStore<User> userStore,
            IEmailSender emailSender,
            RoleManager<IdentityRole> roleManager,
            ILogger<UserRegistrationManager> logger) : base(logger)
        {
            _userManager = userManager;
            _userStore = userStore;
            _emailSender = emailSender;
            _emailStore = (IUserEmailStore<User>) userStore;

            _roleManager = roleManager;
        }

        public struct UserRegistrationResult
        {
            public UserRegistrationResult(IdentityResult result, User user)
            {
                this.Result = result;
                this.User = user;
            }

            public IdentityResult Result { get; }
            public User User { get; }
        }

        public async Task<UserRegistrationResult> RegisterUserAsync(string userEmail, string userPassword)
        {
            Check.NotNull(userEmail, nameof(userEmail));

            this.Log(LoggerExecutionPositions.Entrance);

            var user = new User();

            user.Preference = new Preference();
            user.Preference.ViewLayout = Services.Core.ViewLayouts.FourColumns;

            await _userStore.SetUserNameAsync(user, userEmail, CancellationToken.None);
            await _emailStore.SetEmailAsync(user, userEmail, CancellationToken.None);
            var result = await _userManager.CreateAsync(user, userPassword);

            this.Log(LoggerExecutionPositions.Exit, $"User registration success is : {result.Succeeded}");

            var registrationResult = new UserRegistrationResult(result, user);

            return registrationResult;
        }

    }
}

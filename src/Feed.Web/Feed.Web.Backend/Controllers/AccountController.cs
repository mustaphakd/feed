using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text.Encodings.Web;
using System.Threading;
using System.Threading.Tasks;
using Feed.Web.Helpers;
using Feed.Web.Services.Models;
using Feed.Web.Services.Security;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.UI.Pages.Account.Internal;
using Microsoft.AspNetCore.Identity.UI.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace Feed.Web.Backend.Controllers
{
    [ApiExplorerSettings(IgnoreApi = true)]
    public class AccountController : Controller
    {
        private readonly SignInManager<User> _signInManager;
        private readonly ILogger<AccountController> _logger;
        private readonly UserRegistrationManager _registrationManager;
        private readonly SignInHandler _signInHandler;

        public class InputModel
        {
            [Required]
            [EmailAddress]
            [Display(Name = "Email")]
            public string Email { get; set; }

            [Required]
            [StringLength(100, ErrorMessage = "The {0} must be at least {2} and at max {1} characters long.", MinimumLength = 6)]
            [DataType(DataType.Password)]
            [Display(Name = "Password")]
            public string Password { get; set; }

            [DataType(DataType.Password)]
            [Display(Name = "Confirm password")]
            [Compare("Password", ErrorMessage = "The password and confirmation password do not match.")]
            public string ConfirmPassword { get; set; }

            public string ReturnUrl { get; set; }
        }

        public class LoginModel
        {
            public class InputModel
            {
                [Required]
                [EmailAddress]
                public string Email { get; set; }

                [Required]
                [DataType(DataType.Password)]
                public string Password { get; set; }
            }

            public InputModel Input { get; set; }
            
            public Boolean RememberMe { get; set; }

        }

        public AccountController(
            UserRegistrationManager registrationManager,
            SignInManager<User> signInManager,
            SignInHandler signInHandler,
            ILogger<AccountController> logger)
        {
            Check.NotNull(registrationManager, nameof(registrationManager));
            Check.NotNull(signInManager, nameof(signInManager));
            Check.NotNull(signInHandler, nameof(signInHandler));
            Check.NotNull(logger, nameof(logger));

            _signInManager = signInManager;
            _signInHandler = signInHandler;
            _logger = logger;
            _registrationManager = registrationManager;
        }
        public IActionResult Index()
        {
            return View();
        }

        [HttpGet]
        [AllowAnonymous]
        public IActionResult Register(string returnUrl = null)
        {
            returnUrl = ExtractReturnUrl(returnUrl);

            Check.CallerLog<AccountController>(_logger, LoggerExecutionPositions.Body, $"Account::Registration() - returnUrl: [[{returnUrl}]]");

            var inputModel = new InputModel();
            inputModel.ReturnUrl = returnUrl;

            return View(inputModel);
        }

        private string ExtractReturnUrl(string returnUrl = null)
        {
            var referrer = Request.Headers["Referer"].ToString();
            returnUrl = returnUrl ?? referrer ?? Url.Content("~/");
            return returnUrl;
        }

        //https://github.com/aspnet/Identity/blob/master/src/UI/Areas/Identity/Pages/Account/Register.cshtml.cs
        [HttpPost]
        [AllowAnonymous]
        public async Task<IActionResult> Register(InputModel inputModel)
        {
            if (!ModelState.IsValid)
            {
                return View(inputModel);
            }

            var registrationResult = await _registrationManager.RegisterUserAsync(inputModel.Email, inputModel.Password);
            var returnUrl = inputModel.ReturnUrl;
            var result = registrationResult.Result;
            var user = registrationResult.User;

            if (result.Succeeded)
            {
                Check.CallerLog<AccountController>(_logger, LoggerExecutionPositions.Body, $"User created a new account with password.\n Signing user in.");

                ///await _signInManager.SignInAsync(user, isPersistent: false);
                await _signInHandler.LoginAsync(inputModel.Email, inputModel.Password, false);

                return Redirect(returnUrl);
            }
            foreach (var error in result.Errors)
            {
                ModelState.AddModelError(string.Empty, error.Description);
            }
            return View(inputModel);
        }

        [HttpPost("/Identity/Account/Login")]
        [AllowAnonymous]
        [AutoValidateAntiforgeryToken]
        public async Task<IActionResult> Login([FromForm]LoginModel loginModel)
        {
            var returnUrl = ExtractReturnUrl();

            if (!ModelState.IsValid)
            {
                return new RedirectResult(returnUrl);
            }

            await _signInHandler.LoginAsync(loginModel.Input.Email, loginModel.Input.Password, false);

            return new RedirectResult(Url.Content("~/"));
        }
    }
}
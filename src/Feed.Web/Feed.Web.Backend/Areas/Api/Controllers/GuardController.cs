using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Feed.Web.Helpers;
using Feed.Web.Services;
using Feed.Web.Services.Models;
using Feed.Web.Services.Security;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace Feed.Web.Backend.Areas.Api.Controllers
{
    [Authorize(AuthenticationSchemes =
    JwtBearerDefaults.AuthenticationScheme)]
    [Produces("application/json")]
    [Route("api/[controller]")]
    [ApiController]
    public class GuardController : ControllerBase
    {
        private readonly SignInHandler _signInHandler;
        private readonly ILogger<GuardController> _logger;
        private readonly IHttpContextAccessor _contextAccessor;

        // should have base controller for all controller to properly expose logger
        public GuardController(SignInHandler signInHandler, ILogger<GuardController> logger, IHttpContextAccessor contextAccessor)
        {
            Check.NotNull(signInHandler, nameof(signInHandler));
            Check.NotNull(logger, nameof(logger));
            Check.NotNull(contextAccessor, nameof(contextAccessor));

            _signInHandler = signInHandler;
            _logger = logger;
            _contextAccessor = contextAccessor;
        }

        public class loginInput
        {
            public string UserId { get; set; }
            public string UserPassword { get; set; }
        }

        // this route definition confuses swagger with identitic route definition found under AccountController and breaks swagger :)
        [HttpPost("/Identity/Account/Login")]
        [AllowAnonymous]
        [Consumes("application/json","text/json","application/*+json","application/json-patch+json") ]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
        public async Task<ObjectResult> Login([FromBody]loginInput credential )
        {
            Check.NotNull(credential, nameof(credential));

            var userId = credential.UserId;
            var userPassword = credential.UserPassword;
            var identityResult = await this._signInHandler.LoginAsync(userId, userPassword, true, JwtBearerDefaults.AuthenticationScheme);

            if (! identityResult.Succeeded) return new BadRequestObjectResult(userId);

            var authToken = _contextAccessor.HttpContext.Items[Constant.AuthTokenKey];

            return new OkObjectResult(new { Token = authToken });
        }
 /*
        // GET: api/Guard
        [HttpGet]
        public IEnumerable<string> Get()
        {
            return new string[] { "value1", "value2" };
        }

        // GET: api/Guard/5
       [HttpGet("{id}", Name = "Get")]
        public string Get(int id)
        {
            return "value";
        }

        // POST: api/Guard
        [HttpPost]
        public void Post([FromBody] string value)
        {
        }

        // PUT: api/Guard/5
        [HttpPut("{id}")]
        public void Put(int id, [FromBody] string value)
        {
        }

        // DELETE: api/ApiWithActions/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }*/
    }
}

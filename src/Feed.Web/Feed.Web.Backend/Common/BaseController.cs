using Feed.Web.Helpers;
using Feed.Web.Services.Security;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace Feed.Web.Backend.Common
{
    [Controller]
    public abstract class BaseController<T> : ControllerBase
    {
        private readonly SignInHandler _signInHandler;
        private readonly ILogger<T> _logger;
        private readonly IHttpContextAccessor _contextAccessor;

        // should have base controller for all controller to properly expose logger
        public BaseController(SignInHandler signInHandler, ILogger<T> logger, IHttpContextAccessor contextAccessor)
        {
            Check.NotNull(signInHandler, nameof(signInHandler));
            Check.NotNull(logger, nameof(logger));
            Check.NotNull(contextAccessor, nameof(contextAccessor));

            _signInHandler = signInHandler;
            _logger = logger;
            _contextAccessor = contextAccessor;
        }

        public SignInHandler SignInHandler
        {
            get
            {
                return this._signInHandler;
            }
        }

        public ILogger<T> Logger
        {
            get
            {
                return this._logger;
            }
        }

        public IHttpContextAccessor ContextAccessor
        {
            get
            {
                return this._contextAccessor;
            }
        }
    }
}
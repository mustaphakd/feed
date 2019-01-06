using Feed.Web.Helpers;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Runtime.CompilerServices;
using System.Text;

namespace Feed.Web.Services
{
    public class BaseService<T> where T : BaseService<T>
    {
        public BaseService(
            ILogger<T> logger)
        {
            this.Logger = logger;
        }

        public ILogger<T> Logger { get; }
    }

    public static class BaseServiceExtenstion
    {
        public static void Log<T>(this BaseService<T> baseService, LoggerExecutionPositions executioningPosition, string message = null, [CallerMemberName] string callerName = null) where T: BaseService<T>
        {
            Check.CallerLog<T>(baseService.Logger, executioningPosition, message, callerName);

        }
    }
}

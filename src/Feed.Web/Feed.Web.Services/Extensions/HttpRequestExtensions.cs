using Feed.Web.Helpers;
using Microsoft.AspNetCore.Http;
using Microsoft.Net.Http.Headers;
using Microsoft.AspNetCore.Http.Headers;
using System.Net.Mime;

namespace Feed.Web.Services.Extensions
{
    public static class HttpRequestExtensions
    {
        private const string RequestedWithHeader = "X-Requested-With";

        private const string XmlHttpRequest = "XMLHttpRequest";


        public static bool IsAjaxRequest(this HttpRequest request)
        {
            Check.NotNull(request, nameof(request));

            return request.RequestHeaderMatched(RequestedWithHeader, XmlHttpRequest);
        }

        public static bool IsHtmlRequest(this HttpRequest request)
        {
            Check.NotNull(request, nameof(request));

            return request.RequestHeaderMatched(HeaderNames.Accept, MediaTypeNames.Text.Html);
        }

        public static bool IsPlainTextRequest(this HttpRequest request)
        {
            Check.NotNull(request, nameof(request));

            return request.RequestHeaderMatched(HeaderNames.Accept, MediaTypeNames.Text.Plain);
        }

        public static bool IsJsonRequest(this HttpRequest request)
        {
            Check.NotNull(request, nameof(request));

            var requestHeaders = new RequestHeaders(request.Headers);
            var jsonRequestHeaderFound = requestHeaders.Accept == null ? false : requestHeaders.Accept.Contains(
                new MediaTypeHeaderValue(
                    new Microsoft.Extensions.Primitives.StringSegment(MediaTypeNames.Application.Json)));

            return jsonRequestHeaderFound;

            //return request.RequestHeaderMatched(AcceptHeader, XmlHttpRequest);
        }

        public static bool IsOnlyJsonOrAjaxRequest(this HttpRequest request)
        {
            Check.NotNull(request, nameof(request));

            return (!request.IsHtmlRequest()) &&
                (request.IsAjaxRequest() || request.IsJsonRequest());
        }

        private static bool RequestHeaderMatched(this HttpRequest request, string requestHeader, string expectedValue)
        {
            var matched = false;

            if (request.Headers != null)
            {
                var headerContent = request.Headers[requestHeader].ToString();                
                matched = headerContent.Contains(expectedValue);
            }

            return matched;
        }
    }
}

using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using Feed.Web.Backend.Common;
using Feed.Web.Helpers;
using Feed.Web.Services;
using Feed.Web.Services.Security;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Headers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace Feed.Web.Backend.Areas.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FeedController : BaseController<FeedController>
    {
        const string LogPrefix = "Feed.Web.Backend.Areas.Api.Controllers.FeedController."; // better than reflection but more verbose

        public FeedService FeedService { get; }

        public FeedController(
            SignInHandler signInHandler,
            ILogger<FeedController> logger,
            IHttpContextAccessor contextAccessor,
            FeedService feedService): 
            base(
                signInHandler,
                logger,
                contextAccessor)
        {
            Check.NotNull(feedService, nameof(feedService));
            this.FeedService = feedService;
        }

        [AllowAnonymous]
        [Produces("text/html", "text/plain")]
        [HttpGet("Fetch"), ActionName("Fetch")]
        public async Task<string> Fetch(string url)
        {
            Logger.LogDebug(LogPrefix + "Fetch() - invoking httpClient on {url}", url);
            var httpClient = new HttpClient();
            var result = "";
            var requestHeaders = new RequestHeaders(this.Request.Headers);
            var accepts = requestHeaders.Accept;
            
            if (accepts.Any(mediaTypeHeaderValue => {
                var media = mediaTypeHeaderValue.MediaType;

                if (media.HasValue == false)
                {
                    return false;
                }

                var mediaValue = media.Value.ToLowerInvariant();

                if (mediaValue.Contains("html"))
                {
                    return true;
                }
                else if (mediaValue.Contains("plain")) {
                    this.Response.Headers["Content-Type"] = "text/plain";
                }

                return false;
            }))
            {
                this.Response.Headers["Content-Type"] = "text/html";
            }

            try
            {
                result = await httpClient.GetStringAsync(url);
            }
            catch(Exception ex)
            {
                Logger.LogWarning(LogPrefix + "Fetch() - Exception raised: {ex}", ex);
            }

            return result;
        }

        [AllowAnonymous]
        [Produces("text/html")]
        [HttpGet("Html"), ActionName("Html")]
        public async Task<ActionResult> Html(string url)
        {
            Logger.LogDebug(LogPrefix + "Fetch() - invoking httpClient on {url}", url);
            var httpClient = new HttpClient();
            var result = "";

            try
            {
                result = await httpClient.GetStringAsync(url);
            }
            catch (Exception ex)
            {
                Logger.LogWarning(LogPrefix + "Fetch() - Exception raised: {ex}", ex);
            }

            var content = new ContentResult();
            content.Content = result;
            content.ContentType = "text/html";
            content.StatusCode = 200;

            this.Response.Headers["Cache-Control"] = "private;max-age=3600";

            return content;
        }

        // GET: api/Feed
        [HttpGet]
        // [AllowAnonymous]
        public async Task<IEnumerable<string>> Get()
        {
            Logger.LogDebug(LogPrefix + "Get() - }");

            /* var result = new string[]  {
                 "https://www.yahoo.com/news/world/rss",
                 "http://feeds.feedburner.com/WarNewsUpdates",
                 "https://www.thecipherbrief.com/feed",
                 "http://www.globalissues.org/news/feed",
                 "http://www.e-ir.info/category/blogs/feed",
                 "http://defence-blog.com/feed",
                 "http://www.aljazeera.com/xml/rss/all.xml",
                 "https://www.buzzfeed.com/world.xml",
                 "https://www.nytimes.com/svc/collections/v1/publish/https://www.nytimes.com/section/world/rss.xml",
                 "https://news.google.com/news/rss/headlines/section/topic/WORLD?ned=us&hl=en",
                 "http://feeds.bbci.co.uk/news/world/rss.xml" }; */
            // "https://www.reddit.com/r/worldnews/.rss" };

            var feeds = await this.FeedService.GetUserFeeds();
            var result = feeds.Select(feed => feed.url).ToArray();

            Logger.LogDebug(LogPrefix + "Get() - results: {result} End", result);
            return await Task.FromResult(result);
        }

        // GET: api/Feed/5
        [HttpGet("{id}", Name = "Get")]
        public string Get(int id)
        {
            return "value";
        }

        // POST: api/Feed
        [HttpPost]
        // [AllowAnonymous]
        public async Task Post([FromBody] IEnumerable<string> values)
        {
            Logger.LogDebug(LogPrefix + "Post()- Start - saving profile feeds", values);
            await this.FeedService.SaveUserFeeds(values);
            Logger.LogDebug(LogPrefix + "Post()- End");
        }
        /*
        // PUT: api/Feed/5
        [HttpPut("{id}")]
        public void Put(int id, [FromBody] string value)
        {
        }

        // DELETE: api/ApiWithActions/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        } */
    }
}

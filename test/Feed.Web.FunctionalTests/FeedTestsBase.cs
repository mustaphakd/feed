using Feed.Web.Backend;
using Feed.Web.Helpers;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using Xunit;

namespace Feed.Web.FunctionalTests
{
    public class FeedTestsBase : IClassFixture<WebApplicationFactory<Program>>
    {
        protected FeedTestsBase(WebApplicationFactory<Program> factory)
        {
            Factory = factory;
        }

        protected HttpClient CreateClient(WebApplicationFactoryClientOptions clientOptions)
        {
            var client = Factory.CreateClient(clientOptions);
            return client;
        }

        protected HttpClient CreateClient(Action<IWebHostBuilder> configuration)
        {
            var client = Factory
               .WithWebHostBuilder(configuration)
               .CreateClient();

            return client;
        }

        protected async Task<HttpResponseMessage> GetAsync(string url)
        {
            Check.NotNull(url, nameof(url));

            var client = this.Factory.CreateClient();
            var response = await client.GetAsync(url);

            return response;
        }

        public WebApplicationFactory<Program> Factory { get; }

    }
}

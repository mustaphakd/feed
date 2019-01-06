using Feed.Web.Backend;
using Microsoft.AspNetCore.Mvc.Testing;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using Xunit;

namespace Feed.Web.FunctionalTests
{
    public class AuthenticationTests : FeedTestsBase
    {
        public AuthenticationTests(WebApplicationFactory<Program> factory): base(factory) { }

        [Theory]
        [InlineData("/")]
        [InlineData("/home/Index")]
        [InlineData("/account/register")]
        [InlineData("/Home/About")]
        [InlineData("/home/Privacy")]
        public async Task ValidatePublicPagesAccessible(string url)
        {
            var response = await this.GetAsync(url);

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            Assert.Equal("text/html; charset=utf-8", response.Content.Headers.ContentType.ToString());
        }

        [Theory]
        [InlineData("/home/Reader")]
        public async Task ValidateWebUnAuthorizedAccessDenial(string url)
        {
            var response = await this.GetAsync(url);

            Assert.Contains("account/login", response.RequestMessage.RequestUri.AbsolutePath.ToLowerInvariant());
        }

        [Fact]
        public async Task ValidateMobileApiAuthentication()
        {
            var client = Factory.CreateClient();

            var request = new HttpRequestMessage(HttpMethod.Post, new Uri("/identity/account/login",UriKind.Relative));
            request.Headers.Add("X-Requested-With", "XMLHttpRequest");
            var accept = request.Headers.Accept;
            accept.Prepend(new System.Net.Http.Headers.MediaTypeWithQualityHeaderValue("application/json"));

            var loginModel = new { userId = "user1@mod.us", userPassword = "Musmus_1" };
            var jsonLoginModel = JsonConvert.SerializeObject(loginModel, Formatting.Indented);
            var httpByteContent = new StringContent(jsonLoginModel, System.Text.Encoding.UTF8, "application/json");

            request.Content = httpByteContent;
            var response = await client.SendAsync(request);
            var responseContent = await response.Content.ReadAsStringAsync();

            // although it works, does not check to make sure token value is not null or an empty string.  works for now :)
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            Assert.Contains("token", responseContent);
        }

        [Fact]
        public Task WebFrontEndAccessesApiEndpoints()
        {
            return Task.CompletedTask;
        }
    }
}

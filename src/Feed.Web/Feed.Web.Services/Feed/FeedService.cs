using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using Feed.Web.Helpers;
using Feed.Web.Services.Repository;
using Feed.Web.Services.Security.AuthorizationRequirements;
using Feed.Web.Services.Security.Core;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Logging;
using System.Linq;
using Microsoft.EntityFrameworkCore;

namespace Feed.Web.Services
{
    public class FeedService: BaseService<FeedService>
    {
        const string LogPrefix = "Feed.Web.Services.FeedService::";
        public FeedService(
            ILogger<FeedService> logger,
            IUserAccessor userAccessor,
            IAuthorizationService authorizationService,
            FeedDbContext dbContext) : base(logger)
        {
            this.Logger.LogDebug(LogPrefix + "ctr() - Start- ");
            Check.NotNull(userAccessor, nameof(userAccessor));
            Check.NotNull(authorizationService, nameof(authorizationService));
            Check.NotNull(dbContext, nameof(dbContext));

            this.UserAccessor = userAccessor;
            this.AuthorizationService = authorizationService;
            this.dbContext = dbContext;
            this.Logger.LogDebug(LogPrefix + "ctr() - End- ");
        }

        public async Task<IEnumerable<Models.Feed>> GetUserFeeds()
        {
            this.Logger.LogDebug(LogPrefix + "GetUserFeeds() - Start- ");
            await this.ValidateAuthenticatedUserAuthorizationAsync(ServiceOperations.ReadOnly);

            var user = await this.LoadUser();

            var feeds = user.UsersFeeds.Select(userFeeds => userFeeds.Feed).ToList();
            this.Logger.LogDebug(LogPrefix + "GetUserFeeds() - End- feeds: {feeds}", feeds);
            return feeds;
        }

        public async Task SaveUserFeeds(IEnumerable<string> feedUrls)
        {
            this.Logger.LogDebug(LogPrefix + "SaveUserFeeds() - Start- feedUrls: {feedUrls}", feedUrls);
            await this.ValidateAuthenticatedUserAuthorizationAsync(ServiceOperations.Update);
            await this.ValidateAuthenticatedUserAuthorizationAsync(ServiceOperations.Create);
            await this.ValidateAuthenticatedUserAuthorizationAsync(ServiceOperations.Delete);


            var user = await this.LoadUser();
            user.UsersFeeds.Clear();
            var remainingFeeds = new List<string>();

            foreach(var url in feedUrls)
            {
                var foundFeed = this.dbContext.Feeds.FirstOrDefault(feed => feed.url == url);

                if (foundFeed != null)
                {
                    var userFeed = new Models.UserFeeds { UserId = user.Id, FeedId = foundFeed.Id };
                    user.UsersFeeds.Add(userFeed);
                    continue;
                }

                var newUserFeed = new Models.UserFeeds { UserId = user.Id, Feed = new Models.Feed { url = url } };
                user.UsersFeeds.Add(newUserFeed);
            }

            await this.dbContext.SaveChangesAsync();

            this.Logger.LogDebug(LogPrefix + "SaveUserFeeds() - End- ");
        }

        private async Task<Models.User> LoadUser()
        {
            var user = await this.dbContext.FeedUsers.FindAsync(this.UserAccessor.UserIdentier);
            await this.dbContext.Entry(user).Collection(usr => usr.UsersFeeds).LoadAsync();
            await this.dbContext.Entry(user).Collection(usr => usr.UsersFeeds)
                    .Query().OfType<Models.UserFeeds>().Include(usrFeed => usrFeed.Feed).LoadAsync();

            return user;
        }
        private async Task ValidateAuthenticatedUserAuthorizationAsync(ServiceOperations serviceOperations)
        {
            this.Logger.LogDebug(LogPrefix + "ValidateAuthenticatedUserAuthorizationAsync() - Start- serviceOperations: {serviceOperations}", serviceOperations);
            Check.NotNull(this.UserAccessor.User, nameof(this.UserAccessor.User), "Invalid User");
            var requirement = new ServiceRequirement(ResourceTypes.Feed, serviceOperations);
            var authorization = await this.AuthorizationService.AuthorizeAsync(
                this.UserAccessor.User,
                new Models.Feed(),
                requirement);

            if (authorization.Succeeded != true)
            {
                throw new InvalidOperationException(authorization.Failure.ToString());
            }

            this.Logger.LogDebug(LogPrefix + "ValidateAuthenticatedUserAuthorizationAsync() - End");

        }

        public IUserAccessor UserAccessor { get; }
        public IAuthorizationService AuthorizationService { get; }
        public FeedDbContext dbContext { get; }
    }
}

using System;
using System.Collections.Generic;
using System.Text;

namespace Feed.Web.Services.Models
{
    public class Feed
    {
        public string Id { get; set; }
        public string iconUrl { get; set; }
        public string url { get; set; }
        public ICollection<FeedTag> FeedTags { get; set; }
        public ICollection<Rating> Ratings { get; set; }


        public ICollection<UserFeeds> UsersFeeds { get; set; }
    }
}

using System;
using System.Collections.Generic;
using System.Text;

namespace Feed.Web.Services.Models
{
    public class UserFeeds
    {
        public string Id { get; set; }

        public string UserId { get; set; }
        public User User { get; set; }

        public string FeedId { get; set; }
        public Feed Feed { get; set; }
    }
}

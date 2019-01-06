using System;
using System.Collections.Generic;
using System.Text;

namespace Feed.Web.Services.Models
{
    public class FeedTag
    {
        public string Id { get; set; }

        public string FeedId { get; set; }
        public Feed Feed { get; set; }

        public string TagId { get; set; }
        public Tag Tag { get; set; }
    }
}

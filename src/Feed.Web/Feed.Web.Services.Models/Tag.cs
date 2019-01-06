using System;
using System.Collections.Generic;
using System.Text;

namespace Feed.Web.Services.Models
{
    public class Tag
    {
        public string Id { get; set; }
        public string Label { get; set; }

        public ICollection<FeedTag> FeedTags { get; set; }
        public ICollection<PreferenceTag> PreferenceTags { get; set; }
    }
}

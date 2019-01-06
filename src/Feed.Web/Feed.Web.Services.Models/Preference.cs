using Feed.Web.Services.Core;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Text;

namespace Feed.Web.Services.Models
{
    [PersonalData]
    public class Preference
    {
        public string Id { get; set; }
        public string UserId { get; set; }
        public User User { get; set; }
        public ViewLayouts ViewLayout { get; set; }

        public ICollection<PreferenceTag> PreferredTags { get; set; }
    }
}

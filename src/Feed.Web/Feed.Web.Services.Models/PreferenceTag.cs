using System;
using System.Collections.Generic;
using System.Text;

namespace Feed.Web.Services.Models
{
    public class PreferenceTag
    {
        public string Id { get; set; }

        public Preference Preference { get; set; }
        public string PreferenceId { get; set; }

        public Tag Tag { get; set; }
        public string TagId { get; set; }
    }
}

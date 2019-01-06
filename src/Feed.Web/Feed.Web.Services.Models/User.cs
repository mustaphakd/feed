using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Feed.Web.Services.Models
{
    public class User: IdentityUser
    {
       public User() : base(){}

        public User(string userName) : base() { }

        public virtual ICollection<Bookmark> Bookmarks { get; set; }
        public Preference Preference { get; set; }

        public virtual ICollection<UserFeeds> UsersFeeds { get; set; }

        public virtual ICollection<Rating> FeedRatings { get; set; }

        // this prop used just for validation purpose
        public string morph { get; set; }

    }
}

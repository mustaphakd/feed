using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Feed.Web.Services.Models
{
    public class Bookmark
    {
        public string Id { get; set; }
        [Required]
        public string UserId { get; set; }
        public User User { get; set; }

        [Required]
        public string FeedId { get; set; }
        [Required]
        public string Note { get; set; }
        public DateTimeOffset Date { get; set; }
    }
}

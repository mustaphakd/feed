using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Feed.Web.Services.Models
{
    public class Rating
    {
        public string Id { get; set; }

        [Required]
        public string FeedId { get; set; }
        public Feed Feed { get; set; }

        [Required]
        public string UserId { get; set; }
        public User User { get; set; }

        [Required]
        public DateTimeOffset Date { get; set; }

        [Required]
        [Range(0, 5)]
        public int grade { get; set; }
    }
}

using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.Text;

namespace Feed.Web.Services
{
    public static class Constant
    {
        public const string AuthTokenKey = "authToken";
        internal static class TokenSecurity
        {
            public const string JwtAuthenticationAuthority = "http://modus-feed.com";
            public const string JwtAuthenticationAudience = "modus-feed-resources";
            public const string JwtAuthenticationSubject = "modus-feed-principals";
            private static readonly string secretKey = "iaoe72r&Y)(*&Y@yr48at_secrfaw33tey!12353";
            public static readonly SymmetricSecurityKey jwtAuthenticationIssuerSigningKey = new SymmetricSecurityKey(
                    Encoding.ASCII.GetBytes(secretKey)
                );
        }
    }
}

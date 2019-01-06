
using Feed.Web.Helpers;
using System;
using System.Collections.Generic;
using System.Text;

namespace Feed.Web.Services.Security.Core
{
    public enum UserRoles
    {
        Patron,
        Admin
    }

    public static class UserRolesConverter
    {

        public static string ToString(this UserRoles userRole)
        {
            var enumName = Enum.GetName(typeof(UserRoles), userRole);
            enumName = enumName.Substring(0,1).ToUpper() + enumName.Substring(1).ToLower();

            return enumName;
        }

        public static UserRoles FromString(string userRole)
        {
            Check.NotNull(userRole, nameof(userRole));
            var lowerCasedRole = userRole.ToLower();
            
            switch(lowerCasedRole)
            {
                case "admin":
                    return UserRoles.Admin;
                case "patron":
                    return UserRoles.Patron;
                default:
                    throw new InvalidOperationException("UserRoles::FromString() - Unkown user role: " + userRole);
            }
        }
    }
}

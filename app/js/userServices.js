'use strict';

/* Services */

angular.module('user.services', ['ngCookies']).
    factory('User', ['$resource', 'config', function ($resource, config) {
        return $resource(config.service.url + '/user/:uri/:action/:userAlias/:emailAddress', {}, {
            get: {method: 'GET', params: {userAlias: 'current'}, isArray: false},
            getExternal: {method: 'GET', params: {emailAddress:'external', userAlias: 'current'}, isArray: false},
            logout: {method: 'POST', params: {userAlias: 'logout'}, isArray: false},
            confirm: {method: 'PUT', params: {action: "sendEmailConfirm"}, isArray: false},
            submitPassChange: {method: 'POST', params: {action:'submitPassChange'}, isArray: false},
            sendMessage: {method: 'PUT', params: {uri:"messages", action:'send'}, isArray: false},
            markMessage: {method: 'POST', params: {uri:"messages", action:'mark'}, isArray: false},
            listMessages: {method: 'GET', params: {uri:"messages", pageNum:1,perPage:5, status:'unread'}, isArray: true}
        });
    }]).
    factory('UserSocial', ['$resource', 'config', function ($resource, config) {
        return $resource(config.service.url + '/userActivity/:userAlias/:action/:toUserAlias', {}, {
            follow: {method: 'PUT', params: {action: 'follow', toUserAlias: 'current'}, isArray: false},
            unfollow: {method: 'DELETE', params: { action: 'follow', toUserAlias: 'current'}, isArray: false},
            getRecommandByTags: {method: "POST", params:{action: 'recommand', toUserAlias: 'users'}, isArray: true },
            getRecommand: {method: "POST", params:{action: 'recommand', toUserAlias: 'user'}, isArray: true },
            getFollowed: {method: "GET", params:{action: 'followed', pageSize: 5}, isArray: true },
            getFollowing: {method: "GET", params:{action: 'following', pageSize: 5}, isArray: true }
        });
    }]).
    factory('UserService', ['User', '$cookies', function (User, $cookies) {
        var currentUser = {userAlias: '', role: 'guest', loginType: 'wowoice'};
        if ($cookies.role)
        {
            currentUser.role = $cookies.role;
        }
        var adminRoles = ["admin"];
        var userRoles = ["user"];
        var proRoles = ["pro"];
        var sproRoles = ["spro"];
        var guestRoles = ["guest"];
        var color = {upper: '#00B2EE', lower: '#A4D3EE', deeper: '#008AEE'};
        var playMode = 0;

        return {
            setupUser: function (user) {
                if (user)
                {
                    currentUser.userAlias = user.userAlias;
                    $cookies.userAlias =  user.userAlias;
                    currentUser.role = user.role;
                    $cookies.role = user.role;
                    if (user.type)
                    {
                        currentUser.loginType = user.type;
                        $cookies.role = user.type;
                    }
                }
                else
                {
                    currentUser.userAlias =  '';
                    $cookies.userAlias =   '';
                    currentUser.role = 'guest';
                    $cookies.role = "";
                }
            },
            getLoginType: function() {
                if ($cookies.loginType)
                {
                     return  $cookies.loginType;
                }
                else
                {
                    return currentUser.loginType;
                }
            },
            validateRoleAdmin: function () {
                return _.contains(adminRoles, currentUser.role);
            },
            validateRoleUser: function () {
                return _.contains(userRoles, currentUser.role);
            },
            validateRoleGuest: function () {
                return _.contains(guestRoles, currentUser.role);
            },
            validateRolePro: function () {
                return _.contains(proRoles, currentUser.role);
            },
            getTimeCapacity: function() {
               if (this.validateRoleUser())
               {
                    return 120;
               }
               if (this.validateRolePro())
               {
                    return 360;
               }
                else
               {
                   0;
               }
            },
            validateRolesPro: function () {
                return _.contains(sproRoles, currentUser.role);
            },
            getCurUserAlias: function () {
                if ($cookies.userAlias != '')
                {
                    return $cookies.userAlias;
                }
                else
                {
                    return currentUser.userAlias;
                }
            },
            getColor: function(){
                if ($cookies.color && JSON.parse($cookies.color))
                {
                    return JSON.parse($cookies.color);
                }
                else
                {
                    return color;
                }
            },
            setColor: function(newColor)
            {
                if (newColor)
                {
                    color = newColor;
                    $cookies.color = JSON.stringify(newColor);
                }
            } ,
            setUserAlias: function(userAlias)
            {
                if (userAlias)
                {
                    currentUser.userAlias = userAlias;
                    $cookies.userAlias =  userAlias;
                }
                else
                {
                    currentUser.userAlias = '';
                    $cookies.userAlias =  '';
                }
            },
            getPlayMode: function(){
                if ($cookies.playMode)
                {
                    return parseInt($cookies.playMode);
                }
                else
                {
                    return playMode;
                }
            },
            setPlayMode: function(newPlayMode)
            {
                playMode = newPlayMode;
                $cookies.playMode = "" + newPlayMode;
            }
        };
    }])
;

'use strict';

/* Services */

angular.module('wooice.service.sound', ['ngResource'])
    .factory('Stream', ['$resource', 'config', function ($resource, config) {
        return $resource(config.service.url + '/sound/streams/:subPath', {}, {
            stream: {method: 'GET', params: {subPath: 'current', pageNum: 0, soundsPerPage: 4}, isArray: true}
        });
    }
    ])
    .factory('Sound', ['$resource', 'config', function ($resource, config) {
        return $resource(config.service.url + '/sound/:sound', {}, {
            load: {method: 'GET', params: {sound: 'current'}, isArray: false},
            delete: {method: 'DELETE', params: {sound: 'current'}, isArray: false},
            save: {method: 'PUT', params: {}, isArray: false},
            update: {method: 'POST', params: {}, isArray: false },
            getSoundToUpload: {method: 'GET', params: {}, isArray: false }
        });
    }
    ])
    .factory('SoundSocial', ['$resource', 'config', function ($resource, config) {
        return $resource(config.service.url + '/soundActivity/:action/:sound', {}, {
            play: {method: 'PUT', params: {action: 'play'}, isArray: false},
            like: {method: 'PUT', params: {action: 'like'}, isArray: false},
            unlike: {method: 'DELETE', params: {action: 'like'}, isArray: false},
            repost: {method: 'PUT', params: {action: 'repost'}, isArray: false},
            unrepost: {method: 'DELETE', params: {action: 'repost'}, isArray: false},
            comment: {method: 'PUT', params: {action: 'comment'}, isArray: false}
        });
    }
    ])
    .factory('SoundSocialList', ['$resource', 'config', function ($resource, config) {
        return $resource(config.service.url + '/soundActivity/:sound/:action', {}, {
            comment: {method: 'GET', params: {action: 'comments', commentsPerPage: 8}, isArray: true}
        });
    }
    ])
;

angular.module('wooice.service.user', ['ngCookies']).
    factory('User', ['$resource', 'config', function ($resource, config) {
        return $resource(config.service.url + '/user/:action/:userAlias/:emailAddress', {}, {
            get: {method: 'GET', params: {userAlias: 'current'}, isArray: false},
            isAlive: {method: 'GET', params: {userAlias: 'isAlive'}, isArray: false},
            logout: {method: 'POST', params: {userAlias: 'logout'}, isArray: false},
            confirm: {method: 'PUT', params: {action: "sendEmailConfirm"}, isArray: false}
        });
    }]).
    factory('UserSocial', ['$resource', 'config', function ($resource, config) {
        return $resource(config.service.url + '/userActivity/:action/:toUserAlias', {}, {
            follow: {method: 'PUT', params: {action: 'follow', toUserAlias: 'current'}, isArray: false},
            unfollow: {method: 'DELETE', params: { action: 'follow', toUserAlias: 'current'}, isArray: false},
            getRecommandByTags: {method: "POST", params:{action: 'recommand', toUserAlias: 'users'}, isArray: true },
            getRecommand: {method: "POST", params:{action: 'recommand', toUserAlias: 'user'}, isArray: true },
            getFollowed: {method: "GET", params:{action: 'followed', pageSize: 5}, isArray: true },
            getFollowing: {method: "GET", params:{action: 'following', pageSize: 5}, isArray: true }
        });
    }]).
    factory('UserProfile', ['$resource', 'config', function ($resource, config) {
        return $resource(config.service.url + '/userActivity/:action/:toUserAlias', {}, {
            follow: {method: 'PUT', params: { action: 'follow', toUserAlias: 'current'}, isArray: false},
            unfollow: {method: 'DELETE', params: { action: 'follow', toUserAlias: 'current'}, isArray: false}
        });
    }]).
    factory('UserService', ['User', '$cookies', function (User, $cookies) {
        var currentUser = {userAlias: '', role: 'guest'};
        var adminRoles = ["admin"];
        var userRoles = ["user"];
        var guestRoles = ["guest"];

        return {
            setupUser: function (user) {
                if (user)
                {
                    currentUser.userAlias = user.userAlias;
                    $cookies.userAlias =  user.userAlias;
                    currentUser.role = user.role;
                }
                else
                {
                    currentUser.userAlias =  '';
                    $cookies.userAlias =   '';
                    currentUser.role = 'guest';
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
            getCurUserAlias: function () {
                if ($cookies.userAlias != '')
                {
                    return $cookies.userAlias;
                }
                else
                {
                    return currentUser.userAlias;
                }
            }
        };
    }])
;

angular.module('wooice.service.tag', []).
    factory('Tag', ['$resource', 'config', function ($resource, config) {
        return $resource(config.service.url + '/tag/:path/:action', {}, {
            query: {method: 'GET', params: {path: 'list'}, isArray: false},
            attach: {method: 'PUT', params: {}, isArray: false},
            curated: {method: 'GET', params: {path:'list', action:'curated'}, isArray: true},
            categories: {method: 'GET', params: {path:'list', action:'categories'}, isArray: true}
        });
    }])
;

angular.module('wooice.service.guest', []).
    factory('Guest', ['$resource', 'config', function ($resource, config) {
        return $resource(config.service.url + '/guest/:uri/:userAlias/:emailAddress/:action', {}, {
            create: {method: 'PUT', params: {uri: "create"}, isArray: false},
            login: {method: 'POST', params: {uri: "login"}, isArray: false},
            checkAlias: {method: 'GET', params: {action: "checkAlias"}, isArray: false},
            checkEmail: {method: 'GET', params: {action: "checkEmail"}, isArray: false}
        });
    }])
;

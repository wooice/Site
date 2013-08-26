'use strict';

/* Services */

angular.module('wooice.service.sound', ['ngResource'])
    .factory('Stream', ['$resource', 'config', function ($resource, config) {
        return $resource(config.service.url + '/sound/streams/:user', {}, {
            stream: {method: 'GET', params: {user: 'current', pageNum: 0, soundsPerPage: 5}, isArray: true}
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
        return $resource(config.service.url + '/soundActivity/:user/:action/:sound', {}, {
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

angular.module('wooice.service.user', []).
    factory('User', ['$resource', 'config', function ($resource, config) {
        return $resource(config.service.url + '/user/:userAlias', {}, {
            get: {method: 'GET', params: {userAlias: 'current'}, isArray: false},
            isAlive: {method: 'GET', params: {userAlias: 'isAlive'}, isArray: false},
            logout: {method: 'POST', params: {userAlias: 'logout'}, isArray: false}
        });
    }]).
    factory('UserSocial', ['$resource', 'config', function ($resource, config) {
        return $resource(config.service.url + '/userActivity/:fromUserAlias/:action/:toUserAlias', {}, {
            follow: {method: 'PUT', params: {fromUserAlias: 'current', action: 'follow', toUserAlias: 'current'}, isArray: false},
            unfollow: {method: 'DELETE', params: {fromUserAlias: 'current', action: 'follow', toUserAlias: 'current'}, isArray: false}
        });
    }]).
    factory('UserProfile', ['$resource', 'config', function ($resource, config) {
        return $resource(config.service.url + '/userActivity/:fromUserAlias/:action/:toUserAlias', {}, {
            follow: {method: 'PUT', params: {fromUserAlias: 'current', action: 'follow', toUserAlias: 'current'}, isArray: false},
            unfollow: {method: 'DELETE', params: {fromUserAlias: 'current', action: 'follow', toUserAlias: 'current'}, isArray: false}
        });
    }]).
    factory('UserService', ['User', function (User) {
        var currentUser = {userAlias: '', role: 'guest'};
        var adminRoles = ["admin"];
        var userRoles = ["user"];
        var guestRoles = ["guest"];

        return {
            setupUser: function (user) {
                currentUser.userAlias = user.userAlias;
                currentUser.role = user.role;
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
                return currentUser.userAlias;
            }
        };
    }])
;

angular.module('wooice.service.tag', []).
    factory('Tag', ['$resource', 'config', function ($resource, config) {
        return $resource(config.service.url + '/tag/:action/:soundAlias', {}, {
            query: {method: 'GET', params: {action: 'match'}, isArray: false},
            attach: {method: 'PUT', params: {action: 'attach'}, isArray: false}
        });
    }])
;

angular.module('wooice.service.guest', []).
    factory('Guest', ['$resource', 'config', function ($resource, config) {
        return $resource(config.service.url + '/guest/:uri', {}, {
            login: {method: 'POST', params: {uri: "login"}, isArray: false}
        });
    }])
;

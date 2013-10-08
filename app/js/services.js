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
        return $resource(config.service.url + '/sound/:sound/:userAlias', {}, {
            load: {method: 'GET', params: {sound: 'current'}, isArray: false},
            delete: {method: 'DELETE', params: {sound: 'current'}, isArray: false},
            save: {method: 'PUT', params: {}, isArray: false},
            update: {method: 'POST', params: {}, isArray: false },
            getSoundToUpload: {method: 'GET', params: {}, isArray: false},
            hasNew: {method: 'GET', params: {sound: 'hasNew'}, isArray: false},
            hasNewCreated: {method: 'GET', params: {sound: 'hasNewCreated'}, isArray: false}
        });
    }
    ])
    .factory('SoundSocial', ['$resource', 'config', function ($resource, config) {
        return $resource(config.service.url + '/soundActivity/:action/:sound/:commentId', {}, {
            play: {method: 'PUT', params: {action: 'play'}, isArray: false},
            like: {method: 'PUT', params: {action: 'like'}, isArray: false},
            unlike: {method: 'DELETE', params: {action: 'like'}, isArray: false},
            repost: {method: 'PUT', params: {action: 'repost'}, isArray: false},
            unrepost: {method: 'DELETE', params: {action: 'repost'}, isArray: false},
            comment: {method: 'PUT', params: {action: 'comment'}, isArray: false},
            uncomment: {method: 'DELETE', params: {action: 'comment'}, isArray: false},
            recommandSounds: {method: 'GET', params: {action:'recommand', sound: 'sounds', pageNum:1, pageSize: 5}, isArray: true}
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
        return $resource(config.service.url + '/user/:uri/:action/:userAlias/:emailAddress', {}, {
            get: {method: 'GET', params: {userAlias: 'current'}, isArray: false},
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
    factory('UserProfile', ['$resource', 'config', function ($resource, config) {
        return $resource(config.service.url + '/userActivity/:action/:toUserAlias', {}, {
            follow: {method: 'PUT', params: { action: 'follow', toUserAlias: 'current'}, isArray: false},
            unfollow: {method: 'DELETE', params: { action: 'follow', toUserAlias: 'current'}, isArray: false}
        });
    }]).
    factory('Storage', ['$resource', 'config', function ($resource, config) {
        return $resource(config.service.url + '/storageV2/:action/:type/:key', {}, {
            getSoundUploadURL: {method: 'GET', params: { action: 'upload', type: 'sound'}, isArray: false},
            getImageUploadURL: {method: 'GET', params: { action: 'upload', type: 'image'}, isArray: false},
            getDownloadURL: {method: 'GET', params: { action: 'download'}, isArray: false},
            upload: {method: 'POST', params: { action: 'upload'}, isArray: false}
        });
    }]).
    factory('MessageService', ['User', '$cookies', function (User, $cookies) {
        function loadMessages() {
            var messages = User.listMessages({}, function () {
                $.each(messages, function (index, message) {
                    $.globalMessenger().post({
                        message: message.content,
                        hideAfter: 0,
                        showCloseButton: true
                    });

                    var postData = {};
                    postData.toUser = message.to.profile.alias;
                    postData.id = message.id;
                    postData.status = "read";
                    User.markMessage({}, postData, function () {
                    });
                });
            });
        }
        setInterval(loadMessages, 60 * 1000);
    }]).
    factory('UserService', ['User', '$cookies', function (User, $cookies) {
        var currentUser = {userAlias: '', role: 'guest'};
        var adminRoles = ["admin"];
        var userRoles = ["user"];
        var guestRoles = ["guest"];
        var color = {upper: '#00B2EE', lower: '#A4D3EE'};

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
            },
            getColor: function(){
                if ($cookies.color)
                {
                     return $cookies.color;
                }
                else
                {
                    return color;
                }
            },
            setColor: function(newColor)
            {
                color = newColor;
                $cookies.color = newColor;
            }
        };
    }])
;

angular.module('wooice.service.tag', []).
    factory('Tag', ['$resource', 'config', function ($resource, config) {
        return $resource(config.service.url + '/tag/:path/:action', {}, {
            query: {method: 'GET', params: {path: 'list'}, isArray: false},
            attach: {method: 'PUT', params: {path: 'attach'}, isArray: false},
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
            checkEmail: {method: 'GET', params: {action: "checkEmail"}, isArray: false},
            reportForget: {method: 'PUT', params: {uri: "reportForget"}, isArray: false}
        });
    }])
;


angular.module('wooice.service.auth', []).
    factory('Auth', ['$resource', 'config', function ($resource, config) {
        return $resource(config.service.url + '/auth/:uri/:confirmCode/:action/:code', {}, {
            doConfirm: {method: 'GET', params: {uri:"confirmEmail", confirmCode:''}, isArray: false},
            verifyReset: {method: 'GET', params: {uri:"resetRequest", action:'', code:''}, isArray: false},
            isAlive: {method: 'GET', params: {uri: 'isAlive'}, isArray: false},
            changePass: {method: 'POST', params: {uri: "updatePassword"}, isArray: false}
        });
    }])
;
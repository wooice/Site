'use strict';

/* Services */

angular.module('wooice.service.sound', ['ngResource'])
.factory('Stream', ['$resource', 'config', function($resource,config){
return $resource(config.service.url + '/sound/streams/:user', {}, {
stream: {method:'GET', params:{user:'current', pageNum:0, soundsPerPage: 5}, isArray:true}
});
}
])
.factory('Sound', ['$resource', 'config', function($resource,config){
    return $resource(config.service.url + '/sound/:sound', {}, {
        load: {method:'GET', params:{sound:'current'}, isArray:false},
        delete: {method:'DELETE', params:{sound:'current'}, isArray:false}
    });
}
])
.factory('SoundSocial', ['$resource', 'config', function($resource,config){
    return $resource(config.service.url + '/soundActivity/:user/:action/:sound', {}, {
        play: {method:'PUT', params:{action:'play'}, isArray:false},
        like: {method:'PUT', params:{action:'like'}, isArray:false},
        unlike: {method:'DELETE', params:{action:'like'}, isArray:false},
        repost: {method:'PUT', params:{action:'repost'}, isArray:false},
        unrepost: {method:'DELETE', params:{action:'repost'}, isArray:false},
        comment: {method:'PUT', params:{action:'comment'}, isArray:false}
    });
}
])
.factory('SoundSocialList', ['$resource', 'config', function($resource,config){
     return $resource(config.service.url + '/soundActivity/:sound/:action', {}, {
          comment: {method:'GET', params:{action:'comments', commentsPerPage:8}, isArray:true}
     });
}
])
;

angular.module('wooice.service.user', []).
factory('User', ['$resource',  'config', function($resource, config){
return $resource(config.service.url + '/user/:userAlias', {}, {
        get: {method:'GET', params:{userAlias:'current'}, isArray:false}
});
}]).
factory('UserSocial', ['$resource',  'config', function($resource, config){
    return $resource(config.service.url + '/userActivity/:fromUserAlias/:action/:toUserAlias', {}, {
        follow: {method:'PUT', params:{fromUserAlias:'current',action: 'follow', toUserAlias:'current'}, isArray:false},
        unfollow: {method:'DELETE', params:{fromUserAlias:'current',action: 'follow', toUserAlias:'current'}, isArray:false}
    });
}]);

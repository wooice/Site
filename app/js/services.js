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
        like: {method:'PUT', params:{sound:'current'}, isArray:false},
        unlike: {method:'DELETE', params:{sound:'current'}, isArray:false},
        repost: {method:'PUT', params:{sound:'current'}, isArray:false},
        unrepost: {method:'DELETE', params:{sound:'current'}, isArray:false}
    });
}
]);

angular.module('wooice.service.user', []).
factory('User', ['$resource', function($resource){
return $resource('users/:userId.json', {}, {
query: {method:'GET', params:{userId:'current'}, isArray:false}
});
}]);

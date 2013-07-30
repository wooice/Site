'use strict';

/* Services */

angular.module('musicShare.service.musiccat', ['ngResource']).
factory('Music', ['$resource', function($resource){
return $resource('musics/:musicId.json', {}, {
query: {method:'GET', params:{musicId:'sounds'}, isArray:true},
queryTop: {method:'GET', params:{musicId:'phones-top'}, isArray:true}

});
}]);

angular.module('musicShare.service.user', []).
factory('User', ['$resource', function($resource){
return $resource('users/:userId.json', {}, {
query: {method:'GET', params:{userId:'current'}, isArray:false},
});
}]);

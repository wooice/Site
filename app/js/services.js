'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('myApp.services', []).
  value('version', '0.1');

angular.module('musicShare.service.musiccat', ['ngResource']).
factory('Music', function($resource){
return $resource('musics/:musicId.json', {}, {
query: {method:'GET', params:{musicId:'sounds'}, isArray:true},
queryTop: {method:'GET', params:{musicId:'phones-top'}, isArray:true}

});
});



angular.module('musicShare.service.user', ['ngResource']).
factory('User', function($resource){
return $resource('users/:userId.json', {}, {
query: {method:'GET', params:{userId:'current'}, isArray:false},
});
});

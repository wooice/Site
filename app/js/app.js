'use strict';

/* App Module */
angular.module('musicShare', ['musicShare.filters', 'musicShare.directives', 'musicShare.controllers', 'musicShare.config', 'musicShare.module.upload', 'musicShare.service.musiccat', 'musicShare.service.user']).
  config(['$routeProvider', function($routeProvider) {
  $routeProvider.
      when('/musics', {templateUrl: 'partials/music-list.html',   controller: MusicListCtrl}).
      when('/musics/:musicId', {templateUrl: 'partials/music-detail.html', controller: MusicDetailCtrl}).
      when('/profile', {templateUrl: 'partials/user-profile.html', controller: UserCtrl}).
      when('/upload', {templateUrl: 'partials/upload.html', resolve: function(){alert(1);}).
      otherwise({redirectTo: '/musics'});
}])
	.run(function($rootScope, config){
		$rootScope.config = config;
	});

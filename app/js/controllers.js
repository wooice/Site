'use strict';

/* Controllers */

angular.module('wooice.controllers', ['wooice.service.musiccat', 'wooice.service.user']).
  controller('streamCtrl', ['$scope', 'Music',function($scope, Music) {
        $scope.streamLoader = new $.stream();

		$scope.$on('$viewContentLoaded', function(){
                $scope.streamLoader.load("robot");
		});
	}])

    .controller('userStreamCtrl', ['$scope', 'Music',function($scope, Music) {
        $scope.streamLoader = new $.stream();
        $scope.$on('$viewContentLoaded', function(){
            $scope.streamLoader.load("robot");
        });
    }])

  .controller('soundDetailCtrl', ['$scope', '$routeParams', 'Music',function($scope, $routeParams, Music) {
        $scope.$on('$viewContentLoaded', function(){
                var waveData = [];

                for(var i =0; i< 1800; i++)
                {
                    waveData[i] = Math.random();
                }
                var player = new $.player({
                    id: 1,
                    waveData: waveData,
                    url: 'resources/sound.mp3',
                    poster: 'resources/images.jpg',
                    title: {alias: 'Fushi Mountain', route:'#'},
                    owner: {alias:'Eason Chen', route:'#'},
                    duration: 256*1000
                });
                player.renderSound();
        });
	}])

	.controller('UserCtrl', ['$scope', '$routeParams', 'User', function($scope, $routeParams, User) {
		$scope.profile = User.query();
	}])
;


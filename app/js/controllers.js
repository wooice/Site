'use strict';

/* Controllers */

angular.module('musicShare.controllers', ['musicShare.service.musiccat', 'musicShare.service.user']).
  controller('MusicListCtrl', ['$scope', 'Music',function($scope, Music) {

		$scope.$musics = Music.query();
		$scope.orderProp = 'age';

		$scope.musics_top = Music.queryTop();
		$scope.orderProp = 'age';

		$scope.$on('$viewContentLoaded', function(){

			for (var j=0; j< 6; j++)
			{
				var waveData = [];

				for(var i =0; i< 1800; i++)
				{
					waveData[i] = Math.random();
				}
				var player = new $.player({
					id: j,
					waveData: waveData,
					url: 'resources/sound.mp3',
					poster: 'resources/images.jpg',
					title: {alias: 'Fushi Mountain', route:'#'},
					owner: {alias:'Eason Chen', route:'#'},
					duration: 256*1000
				});
				player.renderSound();
			}
		});
	}])

  .controller('MusicDetailCtrl', ['$scope', '$routeParams', 'Music',function($scope, $routeParams, Music) {
		$scope.music = Music.get({phoneId: $routeParams.phoneId}, function(phone) {
			$scope.mainImageUrl = $scope.music.images[0];
		});

		$scope.setImage = function(imageUrl) {
			$scope.mainImageUrl = imageUrl;
		};
	}])

	.controller('UserCtrl', ['$scope', '$routeParams', 'User', function($scope, $routeParams, User) {
		$scope.profile = User.query();
	}])
;


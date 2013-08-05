'use strict';

/* Controllers */

angular.module('wooice.controllers', []).
  controller('streamCtrl', ['$scope','Stream',function($scope, Stream) {

        $scope.togglePause = function(id){
            $('body').soundPlayer().toggle({
                id: id
            });
        };

        $scope.toggleLike = function(id){

        }

		$scope.$on('$viewContentLoaded', function(){
            $scope.pageNum = 0;
            var soundsData = Stream.stream({user:'',userAlias:'robot', pageNum:$scope.pageNum},function()
            {
                $scope.sounds = [];
                $.each(soundsData, function(index, soundRecord) {
                    var sound = {
                        id: index+1,
                        waveData: soundRecord.sound.soundData.wave[0],
                        url: soundRecord.sound.soundData.url,
                        poster: soundRecord.sound.profile.poster.url,
                        title: {alias: soundRecord.sound.profile.name, route:'#'},
                        owner: {alias: soundRecord.owner.profile.alias, route:'#'},
                        duration: soundRecord.sound.soundData.duration*1000,
                        soundSocial: soundRecord.sound.soundSocial,
                        soundUserPrefer: soundRecord.sound.userRrefer
                    };
                    $scope.sounds.push(sound);
                });

                //TODO
                $scope.$apply();
                $.each($scope.sounds, function(index, sound) {
                    var player = new $.player(sound);
                    player.renderSound();
                });

                $scope.pageNum++;
            });
		});

	}])

    .controller('userStreamCtrl', ['$scope','$routeParams','Stream',function($scope,$routeParams, Stream) {

        $scope.togglePause = function(id){
            $('body').soundPlayer().toggle({
                id: id
            });
        };

        $scope.$on('$viewContentLoaded', function(){
            $scope.pageNum = 0;
            var soundsData = Stream.stream({user:$routeParams.userId,pageNum:$scope.pageNum},function()
            {
                $scope.sounds = [];
                $.each(soundsData, function(index, soundRecord) {
                    var sound = {
                        id: index+1,
                        waveData: soundRecord.sound.soundData.wave[0],
                        url: soundRecord.sound.soundData.url,
                        poster: soundRecord.sound.profile.poster.url,
                        title: {alias: soundRecord.sound.profile.name, route:'#'},
                        owner: {alias: soundRecord.owner.profile.alias, route:'#'},
                        duration: soundRecord.sound.soundData.duration*1000,
                        soundSocial: soundRecord.sound.soundSocial,
                        soundUserPrefer: soundRecord.sound.userRrefer
                    };
                    $scope.sounds.push(sound);
                });

                //TODO
                $scope.$apply();
                $.each($scope.sounds, function(index, sound) {
                    var player = new $.player(sound);
                    player.renderSound();
                });

                $scope.pageNum++;
            });
        });
    }])

  .controller('soundDetailCtrl', ['$scope', '$routeParams', 'Sound',function($scope, $routeParams, Sound) {

        $scope.togglePause = function(id){
            $('body').soundPlayer().toggle({
                id: id
            });
        };

        $scope.$on('$viewContentLoaded', function(){
                var sound = Sound.load({sound:$routeParams.soundId}, function(){
                    $scope.sound = {
                        id: 1,
                        waveData: sound.soundData.wave[0],
                        url: sound.soundData.url,
                        poster: sound.profile.poster.url,
                        title: {alias: sound.profile.name, route:'#'},
                        owner: {alias: sound.profile.owner.profile.alias, route:'#'},
                        duration: sound.soundData.duration*1000,
                        soundSocial: sound.soundSocial,
                        soundUserPrefer: soundRecord.sound.userRrefer
                    };
                    //TODO
                    $scope.$apply();

                    var player = new $.player($scope.sound);
                    player.renderSound();
                });
        });
	}])

	.controller('UserCtrl', ['$scope', '$routeParams', function($scope, $routeParams, $http) {

	}])
;


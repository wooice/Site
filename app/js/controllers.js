'use strict';

/* Controllers */

angular.module('wooice.controllers', []).
  controller('streamCtrl', ['$scope','Stream', 'SoundSocial' ,function($scope, Stream, SoundSocial) {

        $scope.togglePause = function(id){
            $('body').soundPlayer().toggle({
                id: id
            });

            var sound = $scope.sounds[id-1];
            if (!sound.played)
            {
                SoundSocial.play({user:'robot', sound:sound.title.alias}, null,function(count){
                    sound.played = true;
                    sound.soundSocial.playedCount = parseInt(count[0]);
                });
            }
        };

        $scope.toggleLike = function(id){
             var sound = $scope.sounds[id-1];
             if (sound.soundUserPrefer.like)
             {
                 SoundSocial.unlike({user:'robot', sound:sound.title.alias}, null,function(count){
                     sound.soundUserPrefer.like = 0;
                     sound.soundUserPrefer.likeWording = "Like";
                     sound.soundSocial.likesCount = parseInt(count[0]);
                 });
             }
             else
             {
                 SoundSocial.like({user:'robot', sound:sound.title.alias}, null,function(count){
                     sound.soundUserPrefer.like = 1;
                     sound.soundUserPrefer.likeWording = "";
                     sound.soundSocial.likesCount = parseInt(count[0]);
                 });
             }
            return false;
        }

        $scope.toggleRepost = function(id){
            var sound = $scope.sounds[id-1];
            if (sound.soundUserPrefer.repost)
            {
                SoundSocial.unrepost({user:'robot', sound:sound.title.alias}, null, function(count){
                    sound.soundUserPrefer.repost = 0;
                    sound.soundUserPrefer.repostWording = "Repost";
                    sound.soundSocial.reportsCount = parseInt(count[0]);
                });
            }
            else
            {
                SoundSocial.repost({user:'robot', sound:sound.title.alias}, null, function(count){
                    sound.soundUserPrefer.repost = 1;
                    sound.soundUserPrefer.repostWording = "";
                    sound.soundSocial.reportsCount = parseInt(count[0]);
                });
            }
            return false;
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
                        soundUserPrefer: soundRecord.sound.userPrefer,
                        played: false
                    };
                    sound.soundUserPrefer.likeWording = (sound.soundUserPrefer.like)? "": "Like";
                    sound.soundUserPrefer.repostWording = (sound.soundUserPrefer.repost)? "": "Repost";
                    $scope.sounds.push(sound);
                });

                //TODO
                $scope.$apply();

                $.each($scope.sounds, function(index, sound) {
                    var player = new $.player(sound);
                    player.renderSound();
                    sound.waveData = null;
                });

                $scope.pageNum++;
            });
		});

	}])

  .controller('soundDetailCtrl', ['$scope', '$routeParams', 'Sound', 'SoundSocial', function($scope, $routeParams, Sound, SoundSocial) {
        $scope.togglePause = function(id){
            $('body').soundPlayer().toggle({
                id: id
            });

            var sound = $scope.sound;
            if (!sound.played)
            {
               var test= SoundSocial.play({user:'robot', sound:sound.title.alias}, null,function(count){
                    sound.played = true;
                    sound.soundSocial.playedCount = parseInt(count[0]);
                });
                console.log(test);
            }
        };

        $scope.toggleLike = function(id){
            var sound = $scope.sound;
            if (sound.soundUserPrefer.like)
            {
                SoundSocial.unlike({user:'robot', sound:sound.title.alias}, null,function(count){
                    sound.soundUserPrefer.like = 0;
                    sound.soundUserPrefer.likeWording = "Like";
                    sound.soundSocial.likesCount = parseInt(count[0]);
                });
            }
            else
            {
                SoundSocial.like({user:'robot', sound:sound.title.alias}, null,function(count){
                    sound.soundUserPrefer.like = 1;
                    sound.soundUserPrefer.likeWording = "";
                    sound.soundSocial.likesCount = parseInt(count[0]);
                });
            }
            return false;
        }

        $scope.toggleRepost = function(id){
            var sound = $scope.sound;
            if (sound.soundUserPrefer.repost)
            {
                SoundSocial.unrepost({user:'robot', sound:sound.title.alias}, null, function(count){
                    sound.soundUserPrefer.repost = 0;
                    sound.soundUserPrefer.repostWording = "Repost";
                    sound.soundSocial.reportsCount = parseInt(count[0]);
                });
            }
            else
            {
                SoundSocial.repost({user:'robot', sound:sound.title.alias}, null, function(count){
                    sound.soundUserPrefer.repost = 1;
                    sound.soundUserPrefer.repostWording = "";
                    sound.soundSocial.reportsCount = parseInt(count[0]);
                });
            }
            return false;
        }

        $scope.$on('$viewContentLoaded', function(){
                var sound = Sound.load({userAlias:'robot', sound:$routeParams.soundId}, function(){
                    $scope.sound = {
                        id: 1,
                        waveData: sound.soundData.wave[0],
                        url: sound.soundData.url,
                        poster: sound.profile.poster.url,
                        title: {alias: sound.profile.name, route:'#'},
                        owner: {alias: sound.profile.owner.profile.alias, route:'#'},
                        duration: sound.soundData.duration*1000,
                        soundSocial: sound.soundSocial,
                        soundUserPrefer: sound.userPrefer,
                        played: false
                    };

                    $scope.sound.soundUserPrefer.likeWording = ($scope.sound.soundUserPrefer.like)? "": "Like";
                    $scope.sound.soundUserPrefer.repostWording = ($scope.sound.soundUserPrefer.repost)? "": "Repost";

                    //TODO
                    $scope.$apply();

                    var player = new $.player($scope.sound);
                    player.renderSound();

                    $scope.sound.waveData = null;
                });
        });
	}])

	.controller('userBasicController', ['$scope', '$routeParams', function($scope, $routeParams, $http) {

	}])

    .controller('userSocialController', ['$scope', '$routeParams', function($scope, $routeParams, $http) {

    }])
;


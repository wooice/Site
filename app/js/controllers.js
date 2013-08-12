'use strict';

/* Controllers */

angular.module('wooice.controllers', []).
  controller('streamCtrl', ['$scope','Stream', 'SoundSocial', function($scope, Stream, SoundSocial) {
        $scope.togglePause = function(id){
            var sound = null;
            $.each($scope.sounds, function(index, oneSound){
                   if (oneSound.id == id)
                   {
                       sound = oneSound;
                       return;
                   }
            });

           $(window).trigger('onToggle', {
               id: sound.id
           });
        };

        $scope.toggleLike = function(id){
            var sound = null;
            $.each($scope.sounds, function(index, oneSound){
                if (oneSound.id == id)
                {
                    sound = oneSound;
                    return;
                }
            });

             if (sound && sound.soundUserPrefer.like)
             {
                 var likesCount = SoundSocial.unlike({user:'robot', sound:sound.title.alias}, null,function(count){
                     sound.soundUserPrefer.like = 0;
                     sound.soundUserPrefer.likeWording = "Like";
                     sound.soundSocial.likesCount = parseInt(likesCount.liked);
                 });
             }
             else
             {
                 var likesCount = SoundSocial.like({user:'robot', sound:sound.title.alias}, null,function(count){
                     sound.soundUserPrefer.like = 1;
                     sound.soundUserPrefer.likeWording = "";
                     sound.soundSocial.likesCount = parseInt(likesCount.liked);
                 });
             }
            return false;
        }

        $scope.toggleRepost = function(id){
            var sound = null;
            $.each($scope.sounds, function(index, oneSound){
                if (oneSound.id == id)
                {
                    sound = oneSound;
                    return;
                }
            });

            if (sound && sound.soundUserPrefer.repost)
            {
               var repostsCount = SoundSocial.unrepost({user:'robot', sound:sound.title.alias}, null, function(count){
                    sound.soundUserPrefer.repost = 0;
                    sound.soundUserPrefer.repostWording = "Repost";
                    sound.soundSocial.reportsCount = parseInt(repostsCount.reposted);
                });
            }
            else
            {
                var repostsCount =  SoundSocial.repost({user:'robot', sound:sound.title.alias}, null, function(count){
                    sound.soundUserPrefer.repost = 1;
                    sound.soundUserPrefer.repostWording = "";
                    sound.soundSocial.reportsCount = parseInt(repostsCount.reposted);
                });
            }
            return false;
        }

		$scope.$on('$viewContentLoaded', function(){
            $scope.pageNum = 1;
            $(window).soundPlayer().setSocialClient(SoundSocial);
            var soundsData = Stream.stream({user:'',userAlias:'robot', pageNum:$scope.pageNum},function()
            {
                $scope.sounds = [];
                $.each(soundsData, function(index, soundRecord) {
                    var sound = {
                        id: soundRecord.sound.profile.name,
                        waveData: soundRecord.sound.soundData.wave[0],
                        url: soundRecord.sound.soundData.url,
                        poster: soundRecord.sound.profile.poster.url,
                        title: {alias: soundRecord.sound.profile.name, route:'index.html#/sound/' + soundRecord.sound.profile.name},
                        owner: {alias: soundRecord.owner.profile.alias, route: 'index.html#/stream/' + soundRecord.owner.profile.alias},
                        duration: soundRecord.sound.soundData.duration*1000,
                        soundSocial: soundRecord.sound.soundSocial,
                        soundUserPrefer: soundRecord.sound.userPrefer,
                        played: false
                    };
                    sound.soundUserPrefer.likeWording = (sound.soundUserPrefer.like)? "": "Like";
                    sound.soundUserPrefer.repostWording = (sound.soundUserPrefer.repost)? "": "Repost";

                    $scope.sounds.push(sound);

                    //TODO
                    $scope.$apply();

                    //render wave
                    var player = new $.player(sound);
                    player.renderSound();
                    sound.waveData = null;

                    //record sound info
                    $(window).soundPlayer().addSound({
                        id: sound.id,
                        duration: sound.duration
                    });


                    $('#sound_commentbox_input_' + sound.id).bind('keyup',function(event) {
                        if (event.keyCode==13)
                        {
                            var comment = $('#sound_commentbox_input_' +  + sound.id).val();
                            var sec = $("#sound_comment_point_" + sound.id).val();
                            SoundSocial.comment({user:'robot', sound:sound.title.alias, comment:comment, pointAt:sec}, null, function(count){
                                sound.soundSocial.commentsCount = parseInt(count[0]);
                                $('#sound_commentbox_input_' + sound.id).val('');
                                $('#sound_commentbox_input_' + sound.id).attr("placeholder", "Thank you for your comment!");
                            });
                        }
                    });
                });

                $scope.pageNum++;
            });
		});

	}])

  .controller('soundDetailCtrl', ['$scope', '$routeParams', 'Sound', 'SoundSocial',  'SoundSocialList',function($scope, $routeParams, Sound, SoundSocial, SoundSocialList) {
        $scope.togglePause = function(id){
            var sound = $scope.sound;

            $(window).trigger('onToggle', {
                id: sound.id
            });
        };

        $scope.toggleLike = function(id){
            var sound = $scope.sound;
            if (sound.soundUserPrefer.like)
            {
                var likesCount =  SoundSocial.unlike({user:'robot', sound:sound.title.alias}, null,function(count){
                    sound.soundUserPrefer.like = 0;
                    sound.soundUserPrefer.likeWording = "Like";
                    sound.soundSocial.likesCount = parseInt(likesCount.liked);
                });
            }
            else
            {
                var likesCount = SoundSocial.like({user:'robot', sound:sound.title.alias}, null,function(count){
                    sound.soundUserPrefer.like = 1;
                    sound.soundUserPrefer.likeWording = "";
                    sound.soundSocial.likesCount = parseInt(likesCount.liked);

                    $(window).soundPlayer().toggle({
                        id: id
                    });
                });
            }
            return false;
        }

        $scope.toggleRepost = function(id){
            var sound = $scope.sound;
            if (sound.soundUserPrefer.repost)
            {
                var repostsCount = SoundSocial.unrepost({user:'robot', sound:sound.title.alias}, null, function(count){
                    sound.soundUserPrefer.repost = 0;
                    sound.soundUserPrefer.repostWording = "Repost";
                    sound.soundSocial.reportsCount = parseInt(repostsCount.reposted);
                });
            }
            else
            {
                var repostsCount =  SoundSocial.repost({user:'robot', sound:sound.title.alias}, null, function(count){
                    sound.soundUserPrefer.repost = 1;
                    sound.soundUserPrefer.repostWording = "";
                    sound.soundSocial.reportsCount = parseInt(repostsCount.reposted);
                });
            }
            return false;
        }

        $scope.$on('$viewContentLoaded', function(){
                $(window).soundPlayer().setSocialClient(SoundSocial);
                var sound = Sound.load({userAlias:'robot', sound:$routeParams.soundId}, function(){
                    $scope.sound = {
                        id: sound.profile.name,
                        waveData: sound.soundData.wave[0],
                        url: sound.soundData.url,
                        poster: sound.profile.poster.url,
                        title: {alias: sound.profile.name, route: 'index.html#/sound/' + sound.profile.name},
                        owner: {alias: sound.profile.owner.profile.alias, route: 'index.html#/stream/' + sound.profile.owner.profile.alias},
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

                    //record sound info
                    $(window).soundPlayer().addSound({
                        id: sound.id,
                        duration: sound.duration
                    });

                    $('#sound_commentbox_input_' + $scope.sound.id).bind('keyup',function(event) {
                        if (event.keyCode==13)
                        {
                            var comment = $('#sound_commentbox_input_' +  + $scope.sound.id).val();
                            var sec = $("#sound_comment_point_" + $scope.sound.id).val();
                            SoundSocial.comment({user:'robot', sound:$scope.sound.title.alias, comment:comment, pointAt:sec}, null, function(count){
                                $scope.sound.soundSocial.commentsCount = parseInt(count[0]);
                                $('#sound_commentbox_input_' + sound.id).val('');
                                $('#sound_commentbox_input_' + sound.id).attr("placeholder", "Thank you for your comment!");
                            });
                        }
                    });

                    $scope.commentPageNum = 1;
                    var comments = SoundSocialList.comment({sound:$scope.sound.title.alias, pageNum: $scope.commentPageNum}, function(){
                        $scope.comments = comments;

                        $.each($scope.comments, function(index, comment){
                             if (!comment.owner.profile.avatorUrl)
                             {
                                 comment.owner.profile.avatorUrl = "img/default_avatar.png";
                                 comment.owner.route = "index.html#/stream/" + comment.owner.profile.alias;
                             }
                        });
                    });
                });
        });
	}])

	.controller('userBasicController', ['$scope', '$routeParams','User','UserSocial', function($scope, $routeParams, User, UserSocial) {
               var user = User.get({userAlias:'robot'}, function(){
                   $scope.user = user;

                   if(!$scope.user.profile.avatorUrl)
                   {
                       $scope.user.profile.avatorUrl = 'img/default_avatar_large.png';
                   }
                   if ($scope.user.userPrefer.following)
                   {
                       $scope.user.userPrefer.followingString = "Following";
                   }
                   else
                   {
                       $scope.user.userPrefer.followingString = "Follow";
                   }

                   $scope.follow = function(userAlias){
                       if ($scope.user.userPrefer.following)
                       {
                           var result = UserSocial.unfollow({fromUserAlias:'robot', toUserAlias:'robot'}, null,function(count){
                                    $scope.user.userPrefer.following = false;
                                    $scope.user.social.followed = result.followed;
                                    $scope.user.userPrefer.followingString = "Follow";
                           });
                       }
                       else
                       {
                           var result = UserSocial.follow({fromUserAlias:'robot', toUserAlias:'robot'}, null,function(count){
                                   $scope.user.userPrefer.following = true;
                                   $scope.user.social.followed = result.followed;
                                   $scope.user.userPrefer.followingString = "Following";
                           });
                       }
                   }
               });
	}])

    .controller('userSocialController', ['$scope', '$routeParams', function($scope, $routeParams, $http) {

    }])
;


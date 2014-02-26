'use strict';

angular.module('header.controllers', [])
    .controller('headerCtrl', ['$scope', '$rootScope', '$location', '$routeParams', '$timeout', 'User', 'CurSoundList', 'UserService', 'PlayList', 'WooicePlayer','Feedback',
    function ($scope, $rootScope, $location, $routeParams, $timeout, User,CurSoundList, UserService, PlayList, WooicePlayer, Feedback) {
        $scope.q = $routeParams.q;
        $scope.userAlias = UserService.getCurUserAlias();
        $scope.userAvatar = UserService.getAvatar();
        $scope.unreadMsgs =  UserService.getUnreadMsgs();
        $scope.playMode = UserService.getPlayMode();
        $scope.playModes = ['顺序播放', '单曲循环', '随机播放', '播完即止'];
        $scope.wooicePlayer =  WooicePlayer;
        $scope.playList = PlayList;
        $scope.userService = UserService;

        function postLogout(){
            var token = $.cookie("token");
            if (!token)
            {
                UserService.setupUser(null);
            }

            $.globalMessenger().post({
                message: "感谢您的使用",
                hideAfter: 10,
                showCloseButton: true
            });

            $.removeCookie('curSound');
            $location.path('/interest');
        }

        $scope.logout = function () {
            var type = UserService.getLoginType();

             switch(type)
             {
                 case 'wowoice':
                     User.logout({}, function () {
                         postLogout();
                     })
                     break;
                 case 'sina':
                     if (WB2.checkLogin())
                     {
                         WB2.logout(function(){
                             postLogout();
                         });
                     }
                     else
                     {
                         postLogout();
                     }
                 case 'qq':
                     if (QC.Login.check())
                     {
                         QC.Login.logout();
                     }
                     postLogout();
                     break;
             }
        };

        $scope.showLoginForm = function() {
            $('#login_modal').modal();
        }

        $scope.feedback = {};
        $scope.feedback.function = null;
        $scope.feedback_content = null;
        $scope.sendFeedback = function (){
            $scope.feedback.content = $scope.feedback_content;
            Feedback.create({}, $scope.feedback, function(){
                $('#feedback').modal('hide');
                $.globalMessenger().post({
                    message: "感谢您的反馈！",
                    hideAfter: 10,
                    showCloseButton: true
                });
            });
        }

        $scope.goto = function (uri) {
            $location.url(uri);
        }

        $scope.togglePause = function () {
            WooicePlayer.toggle({});
        };

        $scope.togglePauseList = function (id) {
            var soundDisplayed = CurSoundList.getSound(id);
            if (soundDisplayed)
            {
                PlayList.addSound(soundDisplayed);
            }
            WooicePlayer.toggle(PlayList.getSound(id));
        };

        $scope.playPre = function () {
            WooicePlayer.playSibling('pre');
        };

        $scope.playNext = function () {
            WooicePlayer.playSibling('next');
        };

        $scope.changePlayStyle = function() {
            $scope.playMode = ++$scope.playMode %  $scope.playModes.length;
            UserService.setPlayMode($scope.playMode);
        }

        $scope.removeSoundFromPlaylist = function(sound) {
             PlayList.removeSound(sound);
        }

        $scope.findBootstrapEnvironment = function() {
            var envs = ['xs', 'sm', 'md', 'lg'];

            var el = $('<div>');
            el.appendTo($('body'));

            for (var i = envs.length - 1; i >= 0; i--) {
                var env = envs[i];

                el.addClass('hidden-'+env);
                if (el.is(':hidden')) {
                    el.remove();
                    return env
                }
            };
        }
        $rootScope.deviceEnv = $scope.findBootstrapEnvironment();


        $('#search_box').bind('keyup', function (event) {
            if (event.keyCode == 13) {
                $scope.$apply(function () {
                    $location.url('/stream/match/' + $scope.q);
                });
            }
        });
    }]);
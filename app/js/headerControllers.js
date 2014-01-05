'use strict';

/* Controllers */

angular.module('header.controllers', [])
    .controller('headerCtrl', ['$scope', '$location', '$routeParams', 'User', 'UserService','WooicePlayer','Feedback', 'MessageService',
    function ($scope, $location, $routeParams, User, UserService, WooicePlayer, Feedback, MessageService) {
        $scope.q = $routeParams.q;
        $scope.userAlias = UserService.getCurUserAlias();
        $scope.playMode = UserService.getPlayMode();
        $scope.playModes = ['顺序播放', '单曲循环', '随机播放', '播完即止'];

        function postLogout(){
            var token = $.cookie("token");
            if (!token)
            {
                UserService.setupUser(null);
            }

            MessageService.destroyMessager();
            $.globalMessenger().post({
                message: "感谢您的使用",
                hideAfter: 10,
                showCloseButton: true
            });

            $.removeCookie('curSound');
            $location.path('/guest/login');
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

        var curSound = WooicePlayer.getCurSound();
        if (curSound)
        {
            $('#sound_player_button_global').addClass('icon-pause');
        }

        $scope.goto = function (uri) {
            $location.url(uri);
        }

        $scope.togglePause = function (id) {
            WooicePlayer.toggle({});
        };

        $scope.playPre = function (id) {
            WooicePlayer.playSibling('pre');
        };

        $scope.playNext = function (id) {
            WooicePlayer.playSibling('next');
        };

        $scope.changePlayStyle = function() {
            $scope.playMode = ++$scope.playMode %  $scope.playModes.length;
            UserService.setPlayMode($scope.playMode);
        }

        $('#search_box').bind('keyup', function (event) {
            if (event.keyCode == 13) {
                $scope.$apply(function () {
                    $location.url('/stream/match/' + $scope.q);
                });
            }
        });
    }]);
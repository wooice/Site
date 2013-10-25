'use strict';

/* Controllers */

angular.module('header.controllers', [])
    .controller('headerCtrl', ['$scope', '$location', '$routeParams', 'User', 'UserService', function ($scope, $location, $routeParams, User, UserService) {
        $scope.q = $routeParams.q;
        $scope.userAlias = UserService.getCurUserAlias();
        $scope.logout = function () {
            User.logout({}, function () {
                UserService.setupUser(null);
                $.globalMessenger().post({
                    message: "感谢您的使用",
                    hideAfter: 10,
                    showCloseButton: true
                });

                $.removeCookie('curSound');
                $location.path('/guest/login');
            })
        };

        var curSound = $(window).soundPlayer().getCurSound();
        if (curSound)
        {
            $('#sound_player_button_global').addClass('icon-pause');
        }

        $scope.goto = function (uri) {
            $location.url(uri);
        }

        $scope.togglePause = function (id) {
            $(window).triggerHandler('onToggle', {
            });
        };

        $scope.playPre = function (id) {
           $(window).triggerHandler('onPlaySibling', 'pre');
        };

        $scope.playNext = function (id) {
           $(window).triggerHandler('onPlaySibling', 'next');
        };

        $('#search_box').bind('keyup', function (event) {
            if (event.keyCode == 13) {
                $scope.$apply(function () {
                    $location.url('/stream/match/' + $scope.q);
                });
            }
        });

    }]);
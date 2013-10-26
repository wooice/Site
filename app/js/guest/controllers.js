'use strict';

angular.module('guest.controllers', [])
    .controller('loginCtrl', ['$scope', '$location', 'Guest', 'UserService', 'Util', function ($scope, $location, Guest, UserService, Util) {
        $scope.userId = "";
        $scope.password = "";

        $scope.toLogin = function () {
            var user = {userId: $scope.userId, password: $scope.password};
            var curUser = Guest.login({}, user, function () {
                UserService.setupUser({
                    userAlias: curUser.profile.alias,
                    role: curUser.userRoles[0].role
                });
                UserService.setColor(curUser.profile.color);
                $.globalMessenger().post({
                    message: curUser.profile.alias + "，欢迎回来！",
                    hideAfter: 10,
                    showCloseButton: true
                });
                if (!UserService.validateRoleGuest()) {
                    $location.url('/stream');
                }
            }, function () {
                $scope.loginMsgClass = "text-warning";
                $scope.loginMsg = '失败了，用户名或密码错误';
            });
        }
    }])

    .controller('registerCtrl', ['$scope', '$location', 'Guest', 'UserService', 'User', function ($scope, $location, Guest, UserService, User) {
        $scope.userAlias = "";
        $scope.emailAddress = "";
        $scope.password1 = null;
        $scope.password2 = null;

        $scope.toRegister = function () {
            var user = {userAlias: $scope.userAlias, emailAddress: $scope.emailAddress, password: $scope.password1};
            var curUser = Guest.create({}, user, function () {
                var login = {userId: $scope.userAlias, password: $scope.password1};
                curUser = Guest.login({}, login, function () {
                    UserService.setupUser({
                        userAlias: $scope.userAlias,
                        role: curUser.userRoles[0].role
                    });
                    User.confirm({userAlias: $scope.userAlias, emailAddress: $scope.emailAddress}, null, function () {
                        $location.url('/interest');
                    });
                });
            });
        }
    }])

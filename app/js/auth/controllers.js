'use strict';

/* Controllers */

angular.module('auth.controllers', [])
    .controller('confirmControl', ['$scope', 'config', '$location', '$routeParams', 'Auth', function ($scope, config, $location, $routeParams, Auth) {
        $scope.result = "";
        if ($routeParams.confirmCode) {
            Auth.doConfirm({confirmCode: $routeParams.confirmCode}, function () {
                $scope.result = "邮件确认成功！请开始您的发现声音之旅。";
            }, function () {
                $scope.result = "邮件确认失败，请确认您收到的激活邮件重新尝试,或重新发送邮件";
            });
        }
        else {
            if ($routeParams.resetCode) {
                var result = Auth.verifyReset({action: "confirm", code: $routeParams.resetCode}, function () {
                    if (result.result) {
                        $location.url('/auth/changePass?code=' + $routeParams.resetCode);
                    } else {
                        $scope.result = "验证失败，请确认您有权进行当前操作。";
                    }
                });
            }
            else {
                if ($routeParams.cancelCode) {
                    var result = Auth.verifyReset({action: "cancel", code: $routeParams.cancelCode}, function () {
                        if (result.result) {
                            $scope.result = "取消修改成功，感谢您的协助。";
                        } else {
                            $scope.result = "验证失败，请确认您有权进行当前操作。";
                        }
                    });
                }
            }
        }
    }])
    .controller('changePassCtrl', ['$scope', '$routeParams', '$location', 'Auth', function ($scope, $routeParams, $location, Auth) {
        $scope.oldPassword = null;
        $scope.password1 = null;
        $scope.password2 = null;
        $scope.confirmCode = $routeParams.code;

        $scope.changePass = function () {
            var postData = {};
            postData.confirmCode = $scope.confirmCode;
            postData.oldPassword = $scope.oldPassword;
            postData.newPassword = $scope.password1
            Auth.changePass({}, postData, function () {
                $scope.messageClass = "text-success";
                $scope.message = "密码修改成功！";
                $location.url("/guest/login");
            }, function (data) {
                $scope.messageClass = "text-error";
                if (data.status == 400) {
                    $scope.message = "密码修改失败，请确认您输入的当前密码正确且新旧密码不相同。";
                }
                else {
                    $scope.message = "密码修改失败，请稍后再试";
                }
            });
        }
    }])
    .controller('submitChangePassCtrl', ['$scope', '$routeParams', 'User', function ($scope, $routeParams, User) {
        $scope.confirmCode = $routeParams.code;

        $scope.changePass = function () {
            User.submitPassChange({}, {}, function () {
                $scope.messageClass = "text-success";
                $scope.message = "提交成功，我们已发送密码修改链接到您的邮箱，请查收后修改密码。";
            }, function () {
                $scope.messageClass = "text-error";
                $scope.message = "提交失败，请确认您是否已通过邮件确认，并再次尝试";
            });
        }
    }])
    .controller('forgetPassCtrl', ['$scope', '$routeParams', 'Guest', function ($scope, $routeParams, Guest) {
        $scope.emailAddress = null;
        $scope.show = true;

        $scope.toSubmit = function () {
            var passObj = {};
            passObj.emailAddress = $scope.emailAddress;
            Guest.reportForget({}, passObj, function () {
                $scope.messageClass = "text-success";
                $scope.message = "提交成功，我们已发送密码修改链接到您的邮箱，请查收后修改密码。";
                $scope.show = false;
            }, function (data) {
                $scope.messageClass = "text-error";
                if (data.status == 400) {
                    $scope.message = "提交失败，请确保您输入的邮箱正确";
                }
                else {
                    $scope.message = "提交失败，请稍后再试";
                }

            });
        }
    }]);
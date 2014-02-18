'use strict';

/* Controllers */

angular.module('auth.controllers', [])
    .controller('confirmControl', ['$scope', 'config', '$location', '$routeParams', 'Auth', function ($scope, config, $location, $routeParams, Auth) {
        $scope.result = "";
        if ($routeParams.confirmCode) {
            Auth.doConfirm({confirmCode: $routeParams.confirmCode}, function () {
                $scope.result = "邮件确认成功！";
            }, function (error) {
                switch (error.data)
                {
                    case 'USER_404':
                        $scope.result = "对不起，用户不存在。";
                        break;
                    case 'CONFIRMED':
                        $scope.result = "您已经完成确认，请勿重复确认。";
                        break;
                    case 'TO_CONFIRM_404':
                        $scope.result = "没有找到需要确认的请求，请确认您收到的激活邮件重新尝试,或重新发送邮件。";
                        break;
                    default:
                        $scope.result = "邮件确认失败，请确认您收到的激活邮件重新尝试,或重新发送邮件。";
                        break;
                }
            });
        }
        else {
            if ($routeParams.resetCode) {
                var result = Auth.verifyReset({action: "confirm", code: $routeParams.resetCode}, function () {
                    if (result.result) {
                        $location.url('/auth/resetPass?code=' + $routeParams.resetCode);
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
            postData.oldPassword =  md5($scope.oldPassword);
            postData.newPassword =  md5($scope.password1);
            Auth.changePass({}, postData, function () {
                $scope.messageClass = "text-success";
                $scope.message = "密码修改成功！";
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
    .controller('resetPassCtrl', ['$scope', '$routeParams', '$location', 'Auth', function ($scope, $routeParams, $location, Auth) {
        $scope.password1 = null;
        $scope.password2 = null;
        $scope.confirmCode = $routeParams.code;

        $scope.resetPass = function () {
            var postData = {};
            postData.confirmCode = $scope.confirmCode;
            postData.newPassword = md5($scope.password1);
            Auth.resetPass({}, postData, function () {
                $scope.messageClass = "text-success";
                $scope.message = "密码重置成功！";
            }, function (data) {
                $scope.messageClass = "text-error";
                if (data.status == 400) {
                    $scope.message = "密码重置失败，请确认您输入的当前密码正确且新旧密码不相同。";
                }
                else {
                    $scope.message = "密码重置失败，请稍后再试";
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
            }, function (error) {
                $scope.messageClass = "text-error";
                switch(error.data){
                    case 'NO_EMAIL_BIND':
                        $scope.message = "您还没有绑定邮箱，请先绑定邮箱作为修改权限凭证。";
                        break;
                    case 'NOT_CONFIRMED':
                        $scope.message = "您还未验证绑定的邮箱，修改密码后请先修改邮箱。";
                        break;
                    default:
                        $scope.message = "提交失败，请确认您是否已通过邮件确认，并再次尝试。";
                        break;
                }
            });
        }
    }])

    .controller('changeContactEmailCtrl', ['$scope', '$routeParams', 'User', function ($scope, $routeParams, User) {
        $scope.targetEmail = null;

        $scope.changeContact = function () {
            User.changeContactEmail({emailAddress: $scope.targetEmail}, {}, function (data) {
                $scope.messageClass = "text-success";
                $scope.message = "提交成功，请登录" + data.emailToVerify + "完成当前邮箱绑定。";
            }, function (error) {
                $scope.messageClass = "text-error";
                switch(error.data){
                    case 'USER_404':
                        $scope.message = "您尚未登录，请先登录后修改密码。";
                        break;
                    case 'EMAIL_NOT_CONFIRMED':
                        $scope.message = "您还未验证绑定的邮箱，再次绑定前请先登陆当前绑定邮箱完成验证。";
                        break;
                    case 'CONFIRMED_ALREADY':
                        $scope.message = "您输入的邮箱已经完成绑定，请勿重复绑定。";
                        break;
                    default:
                        $scope.message = "提交失败，请稍后再试。";
                        break;
                }
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
                $scope.messageClass = "text-warning";
                if (data.data == "USER_404")
                {
                    $scope.message = "您输入的邮箱尚未与任何WOWOICE账号绑定，请确认后重新输入";
                    return ;
                }
                if (data.status == 400) {
                    $scope.message = "提交失败，请确保您输入的邮箱正确";
                }
                else {
                    $scope.message = "提交失败，请稍后再试";
                }

            });
        }
    }]);
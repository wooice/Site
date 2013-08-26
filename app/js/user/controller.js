'use strict';

angular.module('wooice.controller.profile', [])
    .controller('basicProfileCtrl', ['$scope', '$routeParams','config', 'User','UserService','UserProfile', function ($scope, $routeParams, config, User, UserService, UserProfile) {
        $scope.message = "";
        $scope.uploadAvatarUrl = config.service.url_noescp + '/storage/upload/avatar';

        var user = User.get({userAlias: UserService.getCurUserAlias()},function(){
           if(!user.profile.avatorUrl)
           {
               user.profile.avatorUrl = "img/default_avatar.png";
           }
            $scope.user = user;
        });

        $scope.saveProfile = function(){
            UserProfile.updateBasic({},$scope.user.profile, function(){
                $scope.messageClass = "alert alert-success";
                $scope.message = "基本信息保存成功";
            },function(){
                $scope.messageClass = "alert alert-error";
                $scope.message = "基本信息保存失败，请稍后再试";
            });
        }

        $('#avatar_upload').fileupload({
            url: $scope.uploadAvatarUrl,
            dataType: 'json',
            acceptFileTypes: /\.(gif|jpg|jpeg|tiff|png)$/i,

            add: function (e, data) {
                console.log('add');
                if (!(/\.(gif|jpg|jpeg|tiff|png)$/i).test(data.files[0].name)) {
                    $scope.$apply(function () {
                        $scope.messageClass = "alert alert-error";
                        $scope.message = '您上传的头像图片可能不正确，请上传以下格式中的一种:gif, jpg, jpeg, tiff, png。';
                    });
                    return;
                }
                if (data.files[0].size > 10000000) {
                    $scope.$apply(function () {
                        $scope.messageClass= "alert alert-error";
                        $scope.message = '您上传的文件过大，请上传小于10MB的头像图片。';
                    });
                    return;
                }
                data.submit();
            },
            submit: function (e, data) {
                data.formData = {fileLenth: data.files[0].size};
                $("#save_button").addClass("disabled");
            },
            progress: function (e, data) {
            },
            send: function (e, data) {
            },
            done: function (e, data) {
                console.log('done');
                $scope.$apply(function () {
                    $scope.messageClass = "alert alert-success";
                    $scope.message = '个人头像上传成功';
                });

                $("#save_button").removeClass("disabled");
            },
            fail: function (e, data) {
                $scope.$apply(function () {
                    $scope.messageClass = "alert alert-error";
                    $scope.message = '个人头像图片上传失败，请稍后再试。';
                });
            }
        });

    }])

    .controller('externalProfileCtrl', ['$scope', '$routeParams','User','UserService', 'UserProfile', function ($scope, $routeParams, User, UserService, UserProfile) {
        var user = User.get({userAlias: UserService.getCurUserAlias()},function(){
            $scope.user = user;
        });

        $scope.saveProfile = function(){

            UserProfile.updateExternal({}, $scope.user.external, function(){
                $scope.messageClass = "alert alert-success";
                $scope.message = "站外信息保存成功";
            },function(){
                $scope.messageClass = "alert alert-error";
                $scope.message = "基本信息保存失败，请稍后再试";
            });
        }
    }])
    .controller('changePassCtrl', ['$scope', '$routeParams','User','UserService', 'UserProfile', function ($scope, $routeParams, User, UserService,UserProfile) {
        $scope.changePass = function(){
            if(!$scope.oldPassword || !$scope.newPassword1 || !$scope.newPassword2)
            {
                $scope.messageClass = "alert alert-error";
                $scope.message = "请输入原始密码及新密码";
                return;
            }

            if ($scope.newPassword1 !== $scope.newPassword2)
            {
                $scope.messageClass = "alert alert-error";
                $scope.message = "两次密码不一致，请重新输入";
                return;
            }

            if ($scope.oldPassword == $scope.newPassword1)
            {
                $scope.messageClass = "alert alert-error";
                $scope.message = "新旧密码一致，请重新输入";
                return;
            }
            var passObj = {};
            passObj.oldPassword = $scope.oldPassword;
            passObj.newPassword = $scope.newPassword1;
            UserProfile.changePass({}, passObj, function(){
                $scope.messageClass = "alert alert-success";
                $scope.message = "密码修改成功";
            },function(){
                $scope.messageClass = "alert alert-error";
                $scope.message = "密码修改失败，请稍后再试";
            });
        }
    }])
;
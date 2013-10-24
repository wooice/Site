'use strict';

angular.module('profile.controllers', [])
    .controller('userProfileCtrl', ['$scope', '$routeParams', function ($scope, $routeParams, $http) {
        $scope.innerPage = 'partials/user/basicProfile.html';

        $scope.jumpTo = function (page) {
            $scope.innerPage = 'partials/user/' + page + '.html';
        }
    }])

    .controller('basicProfileCtrl', ['$scope', '$routeParams','config', 'User','UserService','UserProfile','Storage','Util', function ($scope, $routeParams, config, User, UserService, UserProfile, Storage, Util) {
        $scope.message = "";
        $scope.uploadAvatarUrl = "http://up.qiniu.com";
        $scope.uplodingPoster = false;

        $scope.colors = [];
        $scope.colors.push({upper: '#00B2EE', lower: '#A4D3EE', deeper: '#008AEE'});
        $scope.colors.push({upper: '#ff9900', lower: '#ffb74c', deeper :'#cc7a00'});
        $scope.colors.push({upper: '#ff6666', lower: '#ff9393', deeper: '#cc5151'});
        $scope.colors.push({upper: '#b7e500', lower: '#ccec4c', deeper: '#92b700'});
        $scope.colors.push({upper: '#cc3300', lower: '#db704c', deeper: '#a32800'});
        $scope.colors.push({upper: '#006b75', lower: '#4c979e', deeper: '#00555d'});
        $scope.colors.push({upper: '#003300', lower: '#4c704c', deeper: '#002800'});

        var user = User.get({userAlias: UserService.getCurUserAlias()},function(){
           if(!user.profile.avatorUrl)
           {
               user.profile.avatorUrl = "img/default_avatar.png";
           }
            $scope.user = user;

            if (!$scope.user.profile.color)
            {
                $scope.user.profile.color = {};
                $scope.user.profile.color.upper = "#00B2EE";
                $scope.user.profile.color.lower = "#A4D3EE";
            }

           var location = Util.checkLocation({}, function(){
               $scope.user.profile.country = location.country;
               $scope.user.profile.city = location.city;
            });
        });

        $scope.saveProfile = function(){
            UserProfile.updateBasic({},$scope.user.profile, function(){
                UserService.setUserAlias($scope.user.profile.alias);
                UserService.setColor($scope.user.profile.color);

                $scope.messageClass = "text-success";
                $scope.message = "基本信息保存成功";
            },function(){
                $scope.messageClass = "text-error";
                $scope.message = "基本信息保存失败，请稍后再试";
            });
        }

        $scope.chooiceColor = function(){
            $scope.user.profile.color = this.color;
        }

        $('#avatar_upload').change(function () {
            var oFReader = new FileReader();
            oFReader.onload = function (oFREvent) {
                $("#poster_img").attr('src', oFREvent.target.result);
            };
            oFReader.readAsDataURL(this.files[0]);
        });

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

                $scope.posterInfo = Storage.getImageUploadURL({key: $scope.user.id}, function () {
                    data.formData = {key: $scope.user.id, token: $scope.posterInfo.token};
                    data.submit();
                });
            },
            submit: function (e, data) {
                $scope.uplodingPoster = true;
                $("#save_button").addClass("disabled");
                $('#cancel_img_upload').click(function () {
                    data.abort();
                    $scope.$apply(function () {
                        $scope.uplodingPoster = false;
                    });
                });
            },
            progress: function (e, data) {
                var progress = parseInt(data.loaded / data.total * 100, 10);
                $scope.$apply(function () {
                    $scope.posterUploadMsg = '已上传' + progress + '%';
                });
            },
            send: function (e, data) {
                $scope.posterUploadMsgClass = "text-info";
                $scope.posterUploadMsg = '已上传0%';
            },
            done: function (e, data) {
                var postData = {};
                postData.avatorUrl = $scope.user.id;
                UserProfile.updateBasic({}, postData, function(){
                    $scope.posterUploadMsgClass = "text-success";
                    $scope.posterUploadMsg = '个人头像上传成功';
                    $scope.uplodingPoster = false;

                    $("#save_button").removeClass("disabled");
                });
            },
            fail: function (e, data) {
                $scope.$apply(function () {
                    $scope.posterUploadMsgClass = "text-error";
                    $scope.posterUploadMsg = '个人头像图片上传失败，请稍后再试。';
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
                $scope.messageClass = "text-success";
                $scope.message = "站外信息保存成功";
            },function(){
                $scope.messageClass = "text-error";
                $scope.message = "基本信息保存失败，请稍后再试";
            });
        }
    }])

;
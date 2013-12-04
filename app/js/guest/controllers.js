'use strict';

angular.module('guest.controllers', [])
    .controller('loginCtrl', ['$scope', '$location', 'config', '$routeParams', 'Guest', 'UserService', 'MessageService', function ($scope, $location, config, $routeParams, Guest, UserService,MessageService) {
        $('#login_div').height($(window).height());
        var undef,
            v = 3,
            div = document.createElement('div'),
            all = div.getElementsByTagName('i');

        while (
            div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->',
                all[0]
            );

        v = v > 4 ? v : undef;
        if (v<9)
        {
            $('#blocker').modal({
                backdrop: 'static',
                keyboard: false
            });
            return;
        }

        if ($location.absUrl().indexOf("http://wowoice.cn/") >= 0 || $location.absUrl().indexOf("http://wowoice.com/") >= 0)
        {
            window.location = (config.site.url);
            return;
        }

        $scope.qqLogin = function()
        {
            QC.Login.showPopup({
                appId: "100565532",
                redirectURI: config.site.url + "#/guest/login?action=qqLoginCallback"
            });
        }
        checkQQcallback();

        function checkQQcallback()
        {
             if ($routeParams.action == 'qqLoginCallback' && QC.Login.check())
             {
                     QC.Login.getMe(function(openId, accessToken){
                         QC.api("get_user_info").
                             success(function(ad){
                                 var data = ad.data;
                                 var qqUser = {};
                                 var external = {};
                                 external.sites = [];
                                 external.sites[0] = {name:'qq', displayName:'腾讯QQ', url:'', uid: openId, userName: data.nickname};
                                 qqUser.profile = {avatorUrl: data.figureurl_qq_2, gender: (data.gender=='男')?true: false};
                                 qqUser.external = external;
                                 var user = Guest.sync({action:'qq'}, qqUser, function(){
                                     postLogin(user);
                                 });
                             }).error(function(){
                             });
                     });
             }
        }

        $scope.weiboLogin = function()
        {
            WB2.login(function(o) {
                if (WB2.checkLogin())
                {
                    WB2.anyWhere(function(W){
                        //数据交互
                        W.parseCMD('/account/get_uid.json', function(oResult, bStatus) {
                                if (bStatus)
                                {
                                    W.parseCMD('/users/show.json', function(oResult, bStatus) {
                                        if(bStatus) {
                                            var city =  oResult.location.split(" ")[0];
                                            var weiboUser = {};
                                            var external = {};
                                            external.sites = [];
                                            external.sites[0] = {name:'sina', displayName:'新浪微博', url:'http://weibo.com/'+oResult.profile_url, uid: oResult.id, userName: oResult.screen_name};
                                            weiboUser.profile = {avatorUrl: oResult.avatar_large, city:city, gender: (oResult.gender=='m')?true: false, description:oResult.description};
                                            weiboUser.external = external;

                                            var user = Guest.sync({action:'sina'}, weiboUser, function(){
                                                postLogin(user);
                                            });
                                        }
                                    }, {
                                        uid  : oResult.uid
                                    }, {
                                        method : 'get',
                                        cache_time : 30
                                    });
                                }
                            },{},
                            {
                                method : 'get',
                                cache_time : 30
                            });
                    });
                }
            });
        }

        if ($routeParams.relogin == 'true' && $.cookie('token'))
            {
            var user = {userId: UserService.getCurUserAlias(), token: $.cookie('token')};;
                Guest.tokenLogin({}, user, function(){
                $location.url('/stream');
            }, function(){
                $location.url('/guest/login');
            });
        }

        $scope.userId = "";
        $scope.password = "";
        $scope.rememberUser = false;
        $scope.verifyCode = "";
        $scope.showVerify = $.cookie('show_verify');
        $scope.error;

        $scope.toLogin = function () {
            var user = {userId: $scope.userId, password: md5($scope.password), rememberUser:$scope.rememberUser};
            if ($scope.verifyCode)
            {
                user.verifyCode =  $scope.verifyCode;
            }
            var curUser = Guest.login({}, user, function () {
                postLogin(curUser);
            }, function (error, data) {
                if (error.data == 'PASSWORD_VERIFY' || error.data == 'VERIFY_CODE')
                {
                    $.cookie('show_verify', true);
                    $scope.showVerify = true;
                }
                $scope.loginMsgClass = "text-warning";
                $scope.error = error.data;
            });
        }

        function postLogin(user) {
            UserService.setupUser({
                userAlias: user.profile.alias,
                role: user.userRoles[0].role
            });
            UserService.setColor(user.profile.color);
            $.globalMessenger().post({
                message: user.profile.alias + "，欢迎回来！",
                hideAfter: 10,
                showCloseButton: true
            });

            if ($scope.rememberUser)
            {
                if (user.auth)
                {
                    $.cookie("token", user.authToken, {
                        expires : 7
                    });
                }
            }
            else
            {
                $.cookie("token", null);
            }
            $.cookie('show_verify', false);
            MessageService.setupMessager();
            if (!UserService.validateRoleGuest()) {
                $location.url('/interest');
            }
        }
    }])

    .controller('registerCtrl', ['$scope', '$location', 'Guest', 'UserService', 'User', 'config', function ($scope, $location, Guest, UserService, User, config) {
        $scope.userAlias = "";
        $scope.emailAddress = "";
        $scope.password1 = null;
        $scope.password2 = null;
        $scope.verifyCode = "";
        $scope.success = true;
        $scope.config = config;

        $scope.toRegister = function () {
            var user = {userAlias: $scope.userAlias, emailAddress: $scope.emailAddress, password:  md5($scope.password1), verifyCode:  $scope.verifyCode};
            var curUser = Guest.create({}, user, function () {
                $scope.success = true;
                var login = {userId: $scope.userAlias, password: md5($scope.password1)};
                curUser = Guest.login({}, login, function () {
                    UserService.setupUser({
                        userAlias: $scope.userAlias,
                        role: curUser.userRoles[0].role
                    });
                    User.confirm({userAlias: $scope.userAlias, emailAddress: $scope.emailAddress}, null, function () {
                        $location.url('/interest');
                    });
                });
            }, function(error) {
                $scope.failedReason = error.data;
            });
        }
    }])

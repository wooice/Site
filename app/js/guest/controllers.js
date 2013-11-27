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
        if ($location.absUrl().indexOf("wowoice.cn") >= 0 || $location.absUrl().indexOf("http://wowoice.com") >= 0)
        {
            window.location = (config.site.url);
            return;
        }

        WB2.anyWhere(function (W) {
            W.widget.connectButton({
                id: "wb_connect_btn",
                type: '3,2',
                callback: {
                    login: function (o) { //登录后的回调函数
                        alert("login: " + o.screen_name)
                    },
                    logout: function () { //退出后的回调函数
                        alert('logout');
                    }
                }
            });
        });

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
                                                UserService.setupUser({
                                                    userAlias: user.profile.alias,
                                                    role: user.userRoles[0].role,
                                                    type: 'sina'
                                                });
                                                UserService.setColor(user.profile.color);
                                                $.globalMessenger().post({
                                                    message: user.profile.alias + "，欢迎回来！",
                                                    hideAfter: 10,
                                                    showCloseButton: true
                                                });
                                                if (user.auth)
                                                {
                                                    $.cookie("token", curUser.auth.authToken, {
                                                        expires : 7//expires in 7 days
                                                    });
                                                }
                                                $.cookie('show_verify', false);
                                                MessageService.setupMessager();
                                                if (!UserService.validateRoleGuest()) {
                                                    $location.url('/stream');
                                                }
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
            UserService.tokenLogin({}, user, function(){
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
                if (curUser.auth)
                {
                    $.cookie("token", curUser.auth.authToken, {
                        expires : 7//expires in 7 days
                    });
                }
                $.cookie('show_verify', false);
                MessageService.setupMessager();
                if (!UserService.validateRoleGuest()) {
                    $location.url('/stream');
                }
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

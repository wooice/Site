'use strict';

/* Controllers */

angular.module('modal.controllers', [])
    .controller("userModalCtrl", ['$scope', '$routeParams', 'User', 'UserSocial', function ($scope, $routeParams, User, UserSocial) {
        $scope.hideModal = function(){
            $('#'+ $scope.modalId).modal('hide');
        };

        $scope.follow = function (user) {
            if (user.userPrefer.following) {
                var result = UserSocial.unfollow({toUserAlias: user.profile.alias}, null, function (count) {
                    user.userPrefer.following = false;
                });
            }
            else {
                var result = UserSocial.follow({ toUserAlias: user.profile.alias}, null, function (count) {
                    user.userPrefer.following = true;
                });
            }
        };
    }])
    .controller("messageModalCtrl", ['$scope', '$routeParams', 'User', 'UserMessage', function ($scope, $routeParams, User, UserMessage) {
        $scope.reset = function(){
            $scope.topic="";
            $scope.content="";
            $scope.sending = false;
            $scope.isSent = false;
            $scope.result = null;
        }

        $('#message_modal').on('hidden.bs.modal', function(){
            $scope.reset();
        });

        $scope.sendMessage = function()
        {
            UserMessage.sendMessage({}, {toUser: $scope.user.profile.alias, topic: $scope.topic, content: $scope.content}, function(){
                $scope.isSent = true;
                $scope.result = 'success';
            }, function(){
                $scope.isSent = true;
                $scope.result = 'failed';
            });
        }

        $scope.reset();
    }])
;

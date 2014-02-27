'use strict';

/* Controllers */

angular.module('modal.controllers', [])
    .controller("userModalCtrl", ['$scope', function ($scope) {
        $scope.hideModal = function(){
            $('#'+ $scope.modalId).modal('hide');
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
            }, function(error){
                $scope.isSent = true;
                if (error.status != 401)
                {
                    $scope.result = 'failed';
                }
            });
        }

        $scope.reset();
    }])
;

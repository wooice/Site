'use strict';

angular.module('user.message.controllers', [])
    .controller('messagesCtrl', ['$scope', '$routeParams', '$q', 'config', 'User', 'UserService', 'UserMessage', 'Storage', 'Util', function ($scope, $routeParams, $q, config, User, UserService, UserMessage, Storage, Util) {
        $scope.messages = [];
        $scope.perPage = 15;
        $scope.loading = false;
        $scope.userService = UserService;

        $scope.list = function (page) {
            var defer = $q.defer();
            $scope.loading = true;

            UserMessage.listMessages({pageNum: page, perPage: $scope.perPage, status: null}, function (messages) {
                for (var i = 0; i < messages.length; i++) {
                    if (messages[i].lastReply) {
                        messages[i].viewMessage = messages[i].lastReply;
                    }
                    else {
                        messages[i].viewMessage = messages[i];
                    }
                }

                $scope.messages = $scope.messages.concat(messages);
                $scope.loading = false;
                defer.resolve();
            });

            return defer.promise;
        }

        $scope.count = function () {
            var defer = $q.defer();
            UserMessage.countMessage({}, function (data, headers) {
                defer.resolve(parseInt(headers('result-length')));
            }, function () {
            });

            return defer.promise;
        }

        $scope.hasUnRead = function () {
            if (this.message.viewMessage.to.profile.alias == UserService.getCurUserAlias() && this.message.viewMessage.toStatus == 'unread') {
                return true;
            }
            return false;
        }

        $scope.trashMessage = function () {
            if (confirm('确定要删除本条消息吗?')) {
                var postData = {};
                postData.toUser = this.message.to.profile.alias;
                postData.id = this.message.id;
                postData.status = "deleted";
                UserMessage.markMessage({}, postData, $.proxy(function () {
                    $scope.messages.splice(this.message, 1);
                }, this));
            }
        }
    }])

    .controller('messageCtrl', ['$scope', '$routeParams', 'UserMessage', 'UserService', function ($scope, $routeParams, UserMessage, UserService) {
        $scope.message = {};
        $scope.replies = [];
        $scope.userService = UserService;
        $scope.reply = '';
        $scope.sending = false;
        $scope.sendResult = null;
        var messageId = $routeParams.msgId;

        UserMessage.getMessage({msgId: messageId}, function (message) {
            $scope.message = message;

            var postData = {
                id: messageId,
                status: 'read'
            };
            UserMessage.markMessage({}, postData, function () {
            });
        });

        UserMessage.getReplies({msgId: messageId}, function (replies) {
            $scope.replies = replies;

            $('html, body').animate({scrollTop: $(document).height() + 300}, 'slow');
        });

        $scope.replyMessage = function () {
            var toUserAlias = "";
            if ($scope.message.from && $scope.message.from.profile.alias == UserService.getCurUserAlias()) {
                toUserAlias = $scope.message.to.profile.alias;
            }
            else {
                toUserAlias = $scope.message.from.profile.alias;
            }
            $scope.sending = true;
            UserMessage.replyMessage({}, {to_id: messageId, toUser: toUserAlias, content: $scope.reply}, function (newRply) {
                $scope.reply = '';
                $scope.sendResult = 'success';
                $scope.sending = false;
                $scope.replies.push(newRply);
            }, function () {
                $scope.reply = '';
                $scope.sendResult = 'failed';
                $scope.sending = false;
            });
        }
    }])
;
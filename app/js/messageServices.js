'use strict';

/* Services */

angular.module('message.services', ['ngCookies']).
    factory('MessageService', ['User', function (User) {
        function loadMessages() {
            var messages = User.listMessages({}, function () {
                $.each(messages, function (index, message) {
                    $.globalMessenger().post({
                        message: message.content,
                        hideAfter: 0,
                        showCloseButton: true
                    });

                    var postData = {};
                    postData.toUser = message.to.profile.alias;
                    postData.id = message.id;
                    postData.status = "read";
                    User.markMessage({}, postData, function () {
                    });
                });
            });
        }
        setInterval(loadMessages, 60 * 1000);
    }]);
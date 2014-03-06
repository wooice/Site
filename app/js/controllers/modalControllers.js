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
    .controller("tagsSelectCtrl", ['$scope', '$http', 'config', 'Tag', function ($scope, $http, config, Tag) {
        $scope.curatedTags = [];
        $scope.inputTags = [];
        $scope.inputTag = null;

        $scope.odd = function (cate) {
            return cate.id % 2 == 0;
        }

        $scope.even = function (cate) {
            return cate.id % 2 == 1;
        }

        var categories = Tag.categories({}, function () {
            $.each(categories, function (index, cate) {
                cate.id = index;
            });
            $scope.categories = categories;
        });

        var tags = Tag.curated({}, function () {
            $.each(tags, function (index, tag) {
                tag.class = 'gray';
                $scope.curatedTags.push(tag);
            });
        });

        $scope.toogleInterest = function () {
            this.curatedTag.interested = !this.curatedTag.interested;
        };

        $scope.searchTags = function(queryString){
            return $http
                ({
                    method: 'GET',
                    url: config.service.url_noescp + '/tag/list?term=' + queryString
                })
                .then(function($res){
                    var tags = [];
                    if ($res)
                    {
                        $.each($res.data, function (index, tag) {
                            tags.push(tag);
                        });
                    }

                    return tags;
                });
        };

        $scope.addInputTag = function(){
            if(!$scope.inputTag)
            {
                return;
            }

            var isCurated = false;
            $.each($scope.curatedTags, function(index, curatedTag){
                if (curatedTag.label === $scope.inputTag)
                {
                    curatedTag.interested = true;
                    isCurated = true;
                }
            });

            if (!isCurated && $.inArray($scope.inputTag, $scope.inputTags) === -1)
            {
                $scope.inputTags.push($scope.inputTag);
            }

            $scope.inputTag = null;
        }

        $scope.removeTag = function (label) {
            $scope.inputTags = jQuery.grep($scope.inputTags, function (value) {
                return value != label;
            });
            $("#tag_" + label).remove();
        }

        $scope.attachTags = function()
        {
            if ($scope.defaultSound)
            {
                $scope.defaultSound.tags = [];

                $.each($scope.curatedTags, function (index, tag) {
                    if (tag.interested)
                    {
                        $scope.defaultSound.tags.push(tag.label);
                    }
                });

                $.each($scope.inputTags, function (index, tag) {
                     $scope.defaultSound.tags.push(tag);
                });

                $('#tags_modal').modal('hide');
            }
        }
    }])
;

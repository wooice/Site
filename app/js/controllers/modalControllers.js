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
    .controller("tagsSelectCtrl", ['$scope', '$http', 'config', function ($scope, $http, config) {
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
            var interestedTags = [];
            $.each(tags, function (index, tag) {
                if (tag.interested) {
                    tag.class = "#0089e0";
                    interestedTags.push(tag.label);
                }
                else {
                    tag.class = 'gray';
                }
                $scope.curatedTags.push(tag);
            });
        });

        $scope.toogleInterest = function () {
            var curatedTag = this.curatedTag;

            if (curatedTag.interested) {
                curatedTag.class = "gray";
                curatedTag.interested = false;
                //TODO: REMOVE THIS TAG FROM INPUT TAGS
            }
            else {
                curatedTag.class = "#0089e0";
                curatedTag.interested = true;
                $scope.inputTags.push(curatedTag);
            }
        };

        $scope.searchTags = function(queryString){
            return $http.get(config.service.url_noescp + '/tag/list?term=' + queryString, {
            }).then(function(res){
                    var tags = [];
                    $.each(res, function (index, tag) {
                        tags.push(tag);
                    });
                    return tags;
            });
        };

        $scope.addInputTag = function(){
            $scope.inputTags.push($scope.inputTag);
        }

        $scope.addTagsToSound = function()
        {
            $scope.defaultSound.tags.$scope.inputTags($scope.inputTags);
            $('#tags_modal').hide();
        }
    }])
;

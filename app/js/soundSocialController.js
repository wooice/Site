
angular.module('sound.social.controllers', [])
    .controller('soundSocialCtrl', ['$scope', '$window', 'config', '$routeParams', 'Sound', 'SoundUtilService', 'Storage', 'SoundSocial', 'SoundSocialList', 'UserService', '$location', '$anchorScroll', 'SoundSocialProSocial', 'SoundProSocial', 'UserSocial', 'Tag',
        function ($scope, $window, config, $routeParams, Sound, SoundUtilService, Storage, SoundSocial, SoundSocialList, UserService, $location, $anchorScroll, SoundSocialProSocial, SoundProSocial, UserSocial, Tag) {

            $scope.$parent.$on('$includeContentLoaded', function (event) {
                $("#" + $scope.target + "_li").addClass("active");
                $("#" + $scope.target).addClass("active");

                $("#tags").typeahead({
                    remote: {
                        url: config.service.url_noescp + '/tag/list?term=%QUERY',
                        filter: function (parsedResponse) {
                            var tags = [];
                            $.each(parsedResponse, function (index, tag) {
                                tags.push(tag.label);
                            });
                            return tags;
                        }
                    }
                });

                $("#tags").bind('keyup', function (event) {
                    if (event.keyCode == 13) {
                        var attached = false;
                        var label = $("#tags").val();
                        $.each($scope.sound.tags, function (index, tag) {
                            if (label == tag.label) {
                                attached = true;
                                return;
                            }
                        });
                        if (attached) {
                            return;
                        }

                        var tags = Tag.attach({action: $scope.sound.id}, {tags: [label]}, function () {
                            $scope.newTag = "";
                            $.each(tags, function (index, tag) {
                                $scope.sound.tags.push(tag);
                            });
                        });
                    }
                });
            });
 }]);

  
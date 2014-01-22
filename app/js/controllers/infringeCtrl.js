'use strict';

/* Controllers */

angular.module('infringe.controllers', [])
    .controller('infringeCtrl', ['$scope', 'config', '$location', '$routeParams', 'User', 'UserService', 'SoundInfringe', function ($scope,config, $location, $routeParams, User, UserService, SoundInfringe) {
        $scope.infringe = {};
        $scope.infringe.links = null;
        $scope.infringe.ownerRight = null;
        $scope.infringe.rightIssue = null;
        $scope.infringe.detail = null;
        $scope.infringe.iswc = null;
        $scope.infringe.informer = {};
        $scope.infringe.informer.xing = null;
        $scope.infringe.informer.ming = null;
        $scope.infringe.informer.company = null;
        $scope.infringe.informer.rightsHolder = null;
        $scope.infringe.informer.street = null;
        $scope.infringe.informer.city = null;
        $scope.infringe.informer.postalCode = null;
        $scope.infringe.informer.country = null;
        $scope.infringe.informer.email = null;
        $scope.infringe.informer.mobile = null;
        $scope.infringe.informer.phone = null;
        $scope.infringe.confirm = {};
        $scope.infringe.confirm.notAuthorized = null;
        $scope.infringe.confirm.guarantee = null;
        $scope.infringe.confirm.responsibility = null;
        $scope.infringe.confirm.sign = null;

        $scope.soundLinks = null;

        if ($routeParams.alias)
        {
            $scope.soundLinks = config.site.url + "#/sound/" + $routeParams.alias;
        }

        $scope.submit = function(){
            $scope.infringe.links = $scope.soundLinks;
            SoundInfringe.create({}, $scope.infringe, function(){
                $.globalMessenger().post({
                    message: '侵权举报发布成功，请耐心等待处理结果',
                    hideAfter: 15,
                    showCloseButton: true
                });

                $location.url('/stream');
            });
        }
    }]);
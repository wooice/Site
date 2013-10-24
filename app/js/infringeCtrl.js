'use strict';

/* Controllers */

angular.module('infringe.controllers', [])
    .controller('infringeCtrl', ['$scope', '$location', '$routeParams', 'User', 'UserService', function ($scope, $location, $routeParams, User, UserService) {
        $scope.links = null;
        $scope.ownerRight = null;
        $scope.rightIssue = null;
        $scope.xing = null;
        $scope.ming = null;
        $scope.company = null;
        $scope.rightsHolder = null;
        $scope.street = null;
        $scope.city = null;
        $scope.postalCode = null;
        $scope.country = null;
        $scope.username = null;
        $scope.email = null;
        $scope.mobile = null;
        $scope.phone = null;
        $scope.notAuthorized = null;
        $scope.accurateInfo = null;
        $scope.responsibility = null;
        $scope.sign = null;

        $scope.submit = function(){

        }
    }]);
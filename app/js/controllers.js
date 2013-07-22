'use strict';

/* Controllers */

angular.module('myApp.controllers', []).
  controller('MyCtrl1', [function() {

  }])
  .controller('MyCtrl2', [function() {

  }]);


/* Controllers */

function MusicListCtrl($scope, Music) {
  $scope.musics = Music.query();
  $scope.orderProp = 'age';
  
  $scope.musics_top = Music.queryTop();
  $scope.orderProp = 'age';
  
}

//PhoneListCtrl.$inject = ['$scope', 'Phone'];



function MusicDetailCtrl($scope, $routeParams, Music) {
  $scope.music = Music.get({phoneId: $routeParams.phoneId}, function(phone) {
    $scope.mainImageUrl = $scope.music.images[0];
  });

  $scope.setImage = function(imageUrl) {
    $scope.mainImageUrl = imageUrl;
  }
}

//PhoneDetailCtrl.$inject = ['$scope', '$routeParams', 'Phone'];


function UserCtrl($scope, $routeParams, User) {
  $scope.profile = User.query();
}


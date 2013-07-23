'use strict';

/* Controllers */

angular.module('myApp.controllers', []).
  controller('MyCtrl1', [function() {

  }])
  .controller('MyCtrl2', [function() {

  }]);


/* Controllers */

function MusicListCtrl($scope, Music) {
 
  $scope.$musics = Music.query();
  $scope.orderProp = 'age';
  
  $scope.musics_top = Music.queryTop();
  $scope.orderProp = 'age';
  
  $scope.$on('$viewContentLoaded', function(){
	  
	  for (var j=0; j< 6; j++) 
	  {
		  var waveData = [];
			
	      for(var i =0; i< 1800; i++)
	      {
	          waveData[i] = Math.random();
	      }
	      var player = new $.player({
	          id: j,
	          waveData: waveData,
	          url: 'resources/sound.mp3',
	          poster: 'resources/images.jpg',
	          title: {alias: 'Fushi Mountain', route:'#'},
	          owner: {alias:'Eason Chen', route:'#'},
	          duration: 256*1000
	      });
	      player.renderSound();  
	  }
	  
	  
  });
  
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


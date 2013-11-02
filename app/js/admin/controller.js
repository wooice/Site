'use strict';

angular.module('admin.controllers', [])
    .controller('adminCtrl', ['$scope', '$routeParams', function ($scope, $routeParams, $http) {
        $scope.innerPage = 'partials/user/infringe.html';

        $scope.jumpTo = function (page) {
            $scope.innerPage = 'partials/admin/' + page + '.html';
        }
    }])

    .controller('infringeCtrl', ['$scope', 'config', '$routeParams', 'SoundInfringe', function ($scope,config, $routeParams, SoundInfringe) {
        $scope.pageNum = 1;
        $scope.isloading = false;
        $scope.infringes = [];

        $scope.loadInfringes = function()
        {
            if ($scope.isloading)
            {
                return;
            }
            var infringes = SoundInfringe.list({pageNum: $scope.pageNum}, function(){
                $.each(infringes, function(index, infringe){
                    var had = false;
                    $.each($scope.infringes, function(index, oldInfringe){
                          if (oldInfringe.id = infringe.id)
                          {
                              had = true;
                          }
                    });
                    if (!had)
                    {
                        $scope.infringes.push(infringe);
                    }
                });

                if (infringes.length >= config.soundsPerPage) {
                    $scope.pageNum++;
                }

                $scope.isloading = false;
            });
        }

        $scope.loadInfringes();

        var scrollHandler = function () {
            if ($(window).height() + $(window).scrollTop() >= ($('#infringes').height())) {
                $scope.loadInfringes();
            }
        };

        $(window).scroll(scrollHandler);
        $scope.$on('$destroy', function (e) {
            clearInterval(soundsReLoad);
            $(window).off("scroll", scrollHandler);
        });
    }])
;
'use strict';

/* Directives */

angular.module('wooice.directives', []).
    directive('passEqual', ['Guest', function (Guest) {
        return {
            require: 'ngModel',
            link: function (scope, ele, attrs, c) {
                scope.$watch(attrs.ngModel, function () {
                    if (scope.password1 && scope.password2)
                    {
                        if (scope.password1 == scope.password2)
                        {
                            scope.the_form.inputPassword1.$setValidity('equal', true);
                            scope.the_form.inputPassword2.$setValidity('equal', true);
                        }
                        else
                        {
                            c.$setValidity('equal', false);
                        }
                    }
                });
            }
        }
    }]).
    directive('aliasUnique', ['Guest', 'UserService', function (Guest, UserService) {
        return {
            require: 'ngModel',
            link: function (scope, ele, attrs, c) {
                scope.$watch(attrs.ngModel, function () {
                    if (UserService.getCurUserAlias() === c.$modelValue)
                    {
                        c.$setValidity('unique', true);
                        return;
                    }

                    if (c.$modelValue)
                    {
                       var result = Guest.checkAlias({userAlias: c.$modelValue}, function(){
                             if (result.unique == "true")
                             {
                                 c.$setValidity('unique', true);
                             }
                             else
                             {
                                 c.$setValidity('unique', false);
                             }
                        });
                    }
                });
            }
        }
    }]).
    directive('emailUnique', ['Guest', function (Guest) {
        return {
            require: 'ngModel',
            link: function (scope, ele, attrs, c) {
                scope.$watch(attrs.ngModel, function () {
                    if (c.$modelValue)
                    {
                        var result = Guest.checkEmail({emailAddress: c.$modelValue}, function(){
                            if (result.unique == "true")
                            {
                                c.$setValidity('unique', true);
                            }
                            else
                            {
                                c.$setValidity('unique', false);
                            }
                        });
                    }
                });
            }
        }
    }]).
    directive('svg', ['Guest', function (Guest) {
        return  function(scope, ele, attrs, c) {
            var $img = jQuery(ele[0]);
            var imgClass = $img.attr('class');
            var imgURL = $img.attr('src');

            jQuery.get(imgURL, function(data) {
                // Get the SVG tag, ignore the rest
                var $svg = jQuery(data).find('svg');

                // Add replaced image's classes to the new SVG
                if(typeof imgClass !== 'undefined') {
                    $svg = $svg.attr('class', imgClass+' replaced-svg');
                }

                // Remove any invalid XML tags as per http://validator.w3.org
                $svg = $svg.removeAttr('xmlns:a');

                // Replace image with new SVG
                $img.replaceWith($svg);
            }, 'xml');
        }
    }]).
    directive('pagination', function($parse, $q) {
        return {
            restrict: 'E',
            scope: {},
            templateUrl: 'partials/directives/pagination.html',
            link: function(scope, element, attrs) {
                var _this = this;
                scope.data = $parse(attrs.data)(scope.$parent);
                scope.loadFunc = $parse(attrs.loadFunc)(scope.$parent);
                scope.countAllFunc = $parse(attrs.countAllFunc)(scope.$parent);
                scope.countAllFunc().then(function(data) {
                    return scope.allNum = data;
                });
                scope.loadFunc(1).then(function() {
                    return scope.data = $parse(attrs.data)(scope.$parent);
                });;

                scope.has_more = function() {
                    return scope.data.length < scope.allNum;
                };
                scope.loaded = true;
                return scope.show_more = function() {
                    var countPromise, loadPromise,
                        _this = this;
                    scope.loaded = false;
                    loadPromise = scope.loadFunc(scope.data.length + 1).then(function() {
                        return scope.data = $parse(attrs.data)(scope.$parent);
                    });
                    countPromise = scope.countAllFunc().then(function(data) {
                        return scope.allNum = data;
                    });
                    return $q.all([loadPromise, countPromise]).then(function() {
                        return scope.loaded = true;
                    });
                };
            }
        };
    });

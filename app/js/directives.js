'use strict';

/* Directives */

angular.module('wooice.directives', []).
    directive('appVersion', ['version', function (version) {
        return function (scope, elm, attrs) {
            elm.text(version);
        };
    }]).
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
    directive('aliasUnique', ['Guest', function (Guest) {
        return {
            require: 'ngModel',
            link: function (scope, ele, attrs, c) {
                scope.$watch(attrs.ngModel, function () {
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
    }]);

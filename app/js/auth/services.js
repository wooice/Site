'use strict';

/* Services */

angular.module('auth.services', []).
    factory('Auth', ['$resource', 'config', function ($resource, config) {
        return $resource(config.service.url + '/auth/:uri/:confirmCode/:action/:code', {}, {
            doConfirm: {method: 'GET', params: {uri:"confirmEmail", confirmCode:''}, isArray: false},
            verifyReset: {method: 'GET', params: {uri:"resetRequest", action:'', code:''}, isArray: false},
            isAlive: {method: 'GET', params: {uri: 'isAlive'}, isArray: false},
            changePass: {method: 'POST', params: {uri: "updatePassword"}, isArray: false}
        });
    }])
;
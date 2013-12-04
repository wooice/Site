'use strict';

/* Services */

angular.module('guest.services', []).
    factory('Guest', ['$resource', 'config', function ($resource, config) {
        return $resource(config.service.url + '/guest/:uri/:userAlias/:emailAddress/:action', {}, {
            create: {method: 'PUT', params: {uri: "create"}, isArray: false},
            login: {method: 'POST', params: {uri: "login"}, isArray: false},
            tokenLogin: {method: 'POST', params: {uri: "login", action:'token'}, isArray: false},
            checkAlias: {method: 'GET', params: {action: "checkAlias"}, isArray: false},
            checkEmail: {method: 'GET', params: {action: "checkEmail"}, isArray: false},
            reportForget: {method: 'PUT', params: {uri: "reportForget"}, isArray: false},
            sync: {method:'POST', params:{uri:"sync"}, isArray: false}
        });
    }])
;
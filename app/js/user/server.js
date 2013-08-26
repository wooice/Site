angular.module('wooice.service.userProfile', []).
    factory('UserProfile', ['$resource', 'config', function ($resource, config) {
        return $resource(config.service.url + '/user/:uri', {}, {
            updateBasic: {method: 'POST', params: {uri: "updateBasic"}, isArray: false},
            updateExternal: {method: 'POST', params: {uri: "updateSns"}, isArray: false},
            changePass: {method: 'POST', params: {uri: "updatePassword"}, isArray: false}
        });
    }])
;
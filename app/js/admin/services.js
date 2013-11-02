angular.module('admin.services', []).
    factory('SoundInfringe', ['$resource', 'config', function ($resource, config) {
        return $resource(config.service.url + '/infringe/:action', {}, {
            create: {method: 'POST', params: { action: 'create'}, isArray: false},
            list: {method: 'GET', params: { action: 'list', pageNum: 1, perPage: config.infringesPerPage}, isArray: true}
        });
    }])
;
'use strict';


// Declare app level module which depends on filters, and services
angular.module('wooice.config', []).constant(
	'config',
	{
		site : {
			url : 'http://localhost:8080/code/sources/xduo/Site/app'
		},

		service : {
			url : 'http://localhost\\:8080/commonService',
            url_noescp : 'http://localhost:8080/commonService'
		},

        userStreamPath: 'index.html#/stream/',

        soundsPerPage: 4,
        commentsPerPage: 8,
        likesPerPage: 9,
        repostsPerPage:9,
        playsPerPage: 9,
        visitsPerPage: 9
	}
);
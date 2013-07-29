'use strict';


// Declare app level module which depends on filters, and services
angular.module('musicShare.config', []).constant(
	'config',
	{
		site : {
			url : 'http://localhost:8080/code/sources/xduo/Site/app'
		},

		service : {
			url : 'http://localhost:8983/commonService'
		}

	}
);
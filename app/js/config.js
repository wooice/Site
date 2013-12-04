'use strict';


// Declare app level module which depends on filters, and services
angular.module('wooice.config', []).constant(
	'config',
	{
//		site : {
//			url : 'http://wowoice.com:8080/Site/app/index.html'
//		},
//		service : {
//			url : 'http:///wowoice.com\\:8080/Services',
//            url_noescp : 'http:///wowoice.com:8080/Services'
//		},
//        storage: {
//            wave: 'http://wooice-wave-dev.u.qiniudn.com'
//        },

        site : {
            url : 'http://www.wowoice.com'
        },

        service : {
            url : 'http://www.wowoice.com/Services',
            url_noescp : 'http://www.wowoice.com/Services'
        },
          storage: {
             wave: 'http://wowoice-wave.u.qiniudn.com'
          },

        userStreamPath: 'index.html#/stream/',
        soundsPerPage: 4,
        commentsPerPage: 8,
        likesPerPage: 9,
        repostsPerPage:9,
        playsPerPage: 9,
        visitsPerPage: 9,
        infringesPerPage: 9
	}
);
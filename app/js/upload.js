/*
 * jQuery File Upload Plugin Angular JS Example 1.2.0
 * https://github.com/blueimp/jQuery-File-Upload
 *
 * Copyright 2013, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

/*jslint nomen: true, regexp: true */
/*global window, angular */

(function () {
    'use strict';

    angular.module('wooice.module.upload', [
        'wooice.config'
    ])
        .controller('soundUploadCtrl', [
            '$scope', '$http', 'config',
            function ($scope, $http, config) {
                $scope.updateUrl = config.service.url_noescp + '/storage/upload';

                    $('#fileupload').fileupload({
                        url:  $scope.updateUrl,
                        dataType: 'json',

                        add: function(e, data) {
                            console.log('add');
                            $('#uploadpart').hide();
                            $('#progress').show();
                            data.submit();
                        },
                        progress: function (e, data) {
                            var progress = parseInt(data.loaded / data.total * 100, 10);
                            $('#progress .bar').css(
                                'width',
                                progress + '%'
                            );
                            $scope.$apply(function () {
                                $scope.percentage = '已上传' + progress + '%';
                            });
                        },
                        send: function(e, data){
                            console.log('send');
                            $scope.$apply(function () {
                                $scope.percentage = '已上传0%';
                            });
                        },
                        done: function (e, data) {
                            console.log('done');
                            $scope.$apply(function () {
                                $scope.percentage = '上传完成';
                            });
                        },
                        fail: function (e, data){
                            console.log('fail');
                        }
                    }).prop('disabled', !$.support.fileInput)
                        .parent().addClass($.support.fileInput ? undefined : 'disabled');
            }
        ])

}());

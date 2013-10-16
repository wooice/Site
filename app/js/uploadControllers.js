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

    angular.module('upload.controllers', [
            'wooice.config'
        ])
        .controller('soundUploadCtrl', [
            '$scope', 'Sound', 'Tag', 'User', 'config', 'Storage', 'UserService',
            function ($scope, Sound, Tag, User, config, Storage, UserService) {
                reset();
                $scope.uploadUrl = "http://up.qiniu.com";
                $scope.defaultSound.minutesToUpload = 120;
                $scope.defaultSound.secondsToUpload = 0;

                $scope.removeTag = function (label) {
                    $scope.defaultSound.tags = jQuery.grep($scope.defaultSound.tags, function (value) {
                        return value != label;
                    });
                    $("#tag_" + label).remove();

                    if ($scope.defaultSound.tags.length == 0) {
                        $('#profile_error').removeClass("hide");
                        $("#tags").attr("placeholder", "请打一个标签");
                        $("#save_button").addClass("disabled");
                    }
                }

                $scope.setPrivate = function () {
                    $scope.defaultSound.status = "private";
                }

                $scope.setPublic = function () {
                    $scope.defaultSound.status = "public";
                }

                $scope.commentModes = [
                    {name: '所有人可見', id:'public'},
                    {name: '自己可見', id:'private'},
                    {name: '关闭評論', id:'closed'}
                ];
                $scope.defaultSound.commentMode =  $scope.commentModes[0];

                $scope.save = function () {
                    if ($("#save_button").hasClass("disabled")) {
                        return;
                    }
                    if ($scope.defaultSound.name && $scope.defaultSound.tags.length > 0) {
                        $scope.defaultSound.profileError = '';

                        if ($scope.defaultSound.alias) {
                            var soundProfile = {};
                            soundProfile.name = $scope.defaultSound.name;
                            soundProfile.description = $scope.defaultSound.description;
                            soundProfile.status = $scope.defaultSound.status;
                            soundProfile.commentMode = $scope.defaultSound.commentMode.id;

                            if ($scope.defaultSound.posterId)
                            {
                                soundProfile.poster = {};
                                soundProfile.poster.posterId =  $scope.defaultSound.posterId;
                            }
                            var sound = Sound.update({sound: $scope.defaultSound.id}, soundProfile, function (count) {
                                $scope.defaultSound.profileMsgClass = "text-success";
                                $scope.defaultSound.profileMsg = "声音信息保存成功";
                                $scope.defaultSound.id = sound.id;
                                $scope.defaultSound.alias = sound.alias;
                                Tag.attach({action: sound.id}, {tags: $scope.defaultSound.tags}, function (count) {
                                    $scope.defaultSound.profileSaved = true;
                                    if ($scope.defaultSound.dataSaved) {
                                        $scope.defaultSound.profileMsg = "";
                                        $.globalMessenger().post({
                                            message: "您的声音" + $scope.defaultSound.name + "上传成功。我们将尽快处理您上传的声音，这可能需要几分钟，请耐心等待。",
                                            hideAfter: 15,
                                            showCloseButton: true
                                        });

                                        $('#uploadpart').show();
                                        $('#progresspart').hide();
                                        $('#sound_info').hide();
                                        reset();
                                    }
                                });

                            }, function () {
                                $scope.defaultSound.profileMsgClass = "text-error";
                                $scope.defaultSound.profileMsg = "声音信息保存失败";
                            });
                        }
                        else {
                            var soundProfile = {};
                            soundProfile.name = $scope.defaultSound.name;
                            soundProfile.description = $scope.defaultSound.description;
                            soundProfile.status = $scope.defaultSound.status;
                            soundProfile.remoteId = $scope.defaultSound.fileName;
                            soundProfile.commentMode = $scope.defaultSound.commentMode.id;

                            if ($scope.defaultSound.posterId)
                            {
                                soundProfile.poster = {};
                                soundProfile.poster.posterId =  $scope.defaultSound.posterId;
                            }

                            var sound = Sound.save({sound: $scope.defaultSound.name}, soundProfile, function (count) {
                                $scope.defaultSound.profileMsgClass = "text-success";
                                $scope.defaultSound.profileMsg = "声音信息保存成功";
                                $scope.defaultSound.id = sound.id;
                                $scope.defaultSound.alias = sound.alias;
                                Tag.attach({action: sound.id}, {tags: $scope.defaultSound.tags}, function (count) {
                                    $scope.defaultSound.profileSaved = true;
                                    if ($scope.defaultSound.dataSaved) {
                                        $.globalMessenger().post({
                                            message: "您的声音" + $scope.defaultSound.name + "上传成功。我们将尽快处理您上传的声音，这可能需要几分钟，请耐心等待。",
                                            hideAfter: 15,
                                            showCloseButton: true
                                        });

                                        $scope.defaultSound.uploadMsg = "";
                                        $('#uploadpart').show();
                                        $('#progresspart').hide();
                                        $('#sound_info').hide();
                                        reset();
                                    }
                                });

                            }, function () {
                                $scope.defaultSound.profileMsgClass = "text-error";
                                $scope.defaultSound.profileMsg = "声音信息保存失败";
                            });
                        }
                    }
                    else {
                        $scope.defaultSound.profileMsgClass = "text-error";
                        $scope.defaultSound.profileMsg = "请填写声音名称并打至少一个tag"
                    }
                }

                $scope.shouldCheckCapacity = function()
                {
                    return UserService.validateRoleUser() || UserService.validateRolePro();
                }

                $scope.$on('$viewContentLoaded', function () {
                    var user = User.get({userAlias: UserService.getCurUserAlias()}, function () {
                        $scope.defaultSound.minutesToUpload = Math.floor(UserService.getTimeCapacity() - user.userSocial.soundDuration / 60);
                        $scope.defaultSound.secondsToUpload = (user.userSocial.soundDuration == 0)? 0:(60 - user.userSocial.soundDuration % 60);
                    });
                    var soundToUpload = Sound.getSoundToUpload(
                        {sound: 'toupload'}, function () {
                            if (soundToUpload.profile) {
                                $scope.defaultSound.id = soundToUpload.id;
                                $scope.defaultSound.name = soundToUpload.profile.name;
                                $scope.defaultSound.fileName = soundToUpload.profile.remoteId;
                                $scope.defaultSound.alias = soundToUpload.profile.alias;
                                $scope.defaultSound.description = soundToUpload.profile.description;
                                $scope.defaultSound.status = soundToUpload.profile.status;

                                if (soundToUpload.profile.poster && soundToUpload.profile.poster.url) {
                                    $scope.defaultSound.posterUrl = soundToUpload.profile.poster.url;
                                }
                                var tagList = [];
                                $.each(soundToUpload.tags, function (index, oneTag) {
                                    tagList.push(oneTag.label);
                                });
                                $scope.defaultSound.uploadStatus = "hide";
                                $scope.defaultSound.tags = tagList;
                                $scope.defaultSound.profileSaved = true;
                                $scope.defaultSound.uploadMsgClass = "text-warning";
                                $scope.defaultSound.uploadMsg = "您有未完成的声音分享，请完成声音" + $scope.defaultSound.name + "的音频上传。";
                                $('#uploadpart').hide();
                                $('#progresspart').show();
                                $('#sound_info').show();
                            }
                            else {
                                if (soundToUpload.soundData) {
                                    $scope.defaultSound.uploadStatus = "hide";
                                    var names = soundToUpload.soundData.originName.split(".");
                                    $scope.defaultSound.name = names[0];
                                    $scope.defaultSound.fileName = soundToUpload.soundData.objectId;
                                    $scope.defaultSound.dataSaved = true;
                                    $scope.defaultSound.uploadMsgClass = "text-warning";
                                    $scope.defaultSound.uploadMsg = "您有未完成的声音分享，请完善" + $scope.defaultSound.name + "的声音信息。";
                                    $('#uploadpart').hide();
                                    $('#progresspart').show();
                                    $('#sound_info').show();
                                }
                                else {
                                    $('#uploadpart').show();
                                }
                            }
                        }
                    );

                    $("#tags").typeahead({
                        remote: {
                            url: config.service.url_noescp + '/tag/list?term=%QUERY',
                            filter: function (parsedResponse) {
                                var tags = [];
                                $.each(parsedResponse, function (index, tag) {
                                    tags.push(tag.label);
                                });
                                return tags;
                            }
                        }
                    });
                    $("#tags").bind('keyup', function (event) {
                        if (event.keyCode == 13) {
                            var label = $("#tags").val();
                            if (label) {
                                if ($.inArray(label, $scope.defaultSound.tags) != -1) {
                                    return;
                                }
                                $scope.$apply(function () {
                                    $scope.defaultSound.tags.push(label);
                                });
                                $("#tags").val("");
                                $("#tags").attr("placeholder", "请再多打几个");

                                if ($scope.defaultSound.name && !$scope.defaultSound.uplodingPoster) {
                                    $("#save_button").removeClass("disabled");
                                } else {
                                    $("#save_button").addClass("disabled");
                                }
                            }
                        }
                    });

                    $('#name').bind('keyup', function (event) {
                        if ($scope.defaultSound.name && $scope.defaultSound.tags.length > 0 && !$scope.defaultSound.uplodingPoster) {
                            $("#save_button").removeClass("disabled");
                        } else {
                            $("#save_button").addClass("disabled");
                        }
                    });
                });

                $('#poster_upload').change(function () {
                    var oFReader = new FileReader();
                    oFReader.onload = function (oFREvent) {
                        $("#poster_img").attr('src', oFREvent.target.result);
                    };
                    oFReader.readAsDataURL(this.files[0]);
                });

                $scope.$on('$locationChangeStart', function (event, next, current) {
                    if ($scope.defaultSound.isSoundUploading || $scope.defaultSound.uplodingPoster) {
                        var result = confirm("你的声音正在上传，离开当然页面将放弃本次上传，确定离开吗？");
                        if (!result) {
                            event.preventDefault();
                        }
                    }
                });

                window.onbeforeunload = function (event) {
                    if ($scope.defaultSound.isSoundUploading || $scope.defaultSound.uplodingPoster) {
                        var message = '你的声音正在上传，离开当然页面将放弃本次上传，确定离开吗？';
                        if (typeof event == 'undefined') {
                            event = window.event;
                        }
                        if (event) {
                            event.returnValue = message;
                        }
                        return message;
                    }
                }

                $scope.jqXHR = $('.upload_button').fileupload({
                    url: $scope.uploadUrl,
                    dataType: 'json',
                    acceptFileTypes: /(\.|\/)(mp3|wav)$/i,

                    add: function (e, data) {
                        if (!(/\.(mp3|wav|flac|ogg)$/i).test(data.files[0].name)) {
                            $scope.$apply(function () {
                                $scope.defaultSound.uploadMsgClass = "text-error";
                                $scope.defaultSound.uploadMsg = '对不起,您上传的文件格式不被本站接受，请上传以下音频文件中的一种：mp3,wav,flac,ogg';
                            });
                            return;
                        }
                        if (data.files[0].size > 100 * 1000 * 1000) {
                            $scope.$apply(function () {
                                $scope.defaultSound.uploadMsgClass = "text-error";
                                $scope.defaultSound.uploadMsg = '对不起,您上传的文件过大，请上传小于100MB的音频文件';
                            });
                            return;
                        }
                        $('#uploadpart').hide();
                        $('#progresspart').show();
                        $('#sound_info').show();
                        $scope.defaultSound.uploadStatus = '';

                        var soundName = data.files[0].name;
                        var names = soundName.split(".");
                        if (!$scope.defaultSound.name) {
                            $scope.defaultSound.name = names[0];
                        }

                        //生成文件唯一标示
                        if (!$scope.defaultSound.fileName) {
                            $scope.defaultSound.fileName = new Date().getTime() + "_" + UserService.getCurUserAlias();
                        }

                        $scope.urlInfo = Storage.getSoundUploadURL({key: $scope.defaultSound.fileName}, function () {
                            data.formData = {key: $scope.defaultSound.fileName, token: $scope.urlInfo.token};
                            data.submit();
                        });
                    },
                    submit: function (e, data) {
                        $scope.defaultSound.isSoundUploading = true;

                        $('.upload_button').fileupload(
                            'option',
                            'dropZone',
                            null
                        );

                        $('#cancel_button').click(function () {
                            data.abort();
                            $scope.$apply(function () {
                                $scope.defaultSound.isSoundUploading = false;
                            });

                            return false;
                        });
                    },
                    progress: function (e, data) {
                        var progress = parseInt(data.loaded / data.total * 100, 10);
                        $('#progress .bar').css(
                            'width',
                            progress + '%'
                        );
                        $scope.$apply(function () {
                            $scope.defaultSound.uploadMsgClass = "text-info";
                            if (progress < 100) {
                                $scope.defaultSound.uploadMsg = '已上传' + progress + '%';
                            } else {
                                $scope.defaultSound.uploadStatus = 'progress-striped active';
                                $scope.defaultSound.uploadMsg = '音频文件处理中，请稍后'
                            }
                        });
                    },
                    send: function (e, data) {
                        $scope.defaultSound.uploadMsgClass = "text-info";
                        $scope.defaultSound.uploadMsg = '已上传0%';
                    },
                    done: function (e, data) {
                        var postData = {};
                        postData.fileName = $scope.defaultSound.fileName;
                        postData.originName = $scope.defaultSound.name;
                        Storage.upload({}, postData, function () {
                            $scope.defaultSound.uploadStatus = 'bar-success';
                            $scope.defaultSound.uploadMsgClass = "text-success";
                            $scope.defaultSound.uploadMsg = '上传完成，请填写信息介绍这段声音。 ';
                            $('#progress .bar').addClass('bar-success');
                            $scope.defaultSound.dataSaved = true;

                            if ($scope.defaultSound.profileSaved) {
                                $.globalMessenger().post({
                                    message: "您的声音" + $scope.defaultSound.name + "上传成功。我们将尽快处理您上传的声音，这可能需要几分钟，请耐心等待。",
                                    hideAfter: 15,
                                    showCloseButton: true
                                });
                                $('#uploadpart').show();
                                $('#progresspart').hide();
                                $('#sound_info').hide();
                                reset();
                            }

                            $('.upload_button').fileupload(
                                'option',
                                'dropZone',
                                $(document)
                            );
                            $scope.defaultSound.isSoundUploading = false;
                            if ($scope.defaultSound.name && $scope.defaultSound.tags.length > 0) {
                                $("#save_button").removeClass("disabled");
                            }
                        });
                    },
                    fail: function (e, data) {
                        $scope.defaultSound.isSoundUploading = false;
                        if (data.errorThrown === 'abort') {
                            $scope.defaultSound.uploadMsgClass = "text-success";
                            $scope.defaultSound.uploadMsg = '声音上传已取消。';
                            $scope.defaultSound.uploadStatus = "hide";
                        }
                        else {
                            $scope.defaultSound.uploadMsgClass = "text-error";
                            $scope.defaultSound.uploadMsg = '上传失败，请稍后再试。';
                        }
                    }
                });

                $scope.imgJqXHR = $('#poster_upload').fileupload({
                    url: $scope.uploadUrl,
                    dataType: 'json',
                    acceptFileTypes: /\.(gif|jpg|jpeg|tiff|png)$/i,
                    dropZone: null,

                    add: function (e, data) {
                        if (!(/\.(gif|jpg|jpeg|tiff|png)$/i).test(data.files[0].name)) {
                            $scope.$apply(function () {
                                $scope.defaultSound.imgUploadMsgClass = "text-error";
                                $scope.defaultSound.imgUploadMsg = '您上传的海报图片可能不正确，请上传以下格式中的一种:gif, jpg, jpeg, tiff, png。';
                            });
                            return;
                        }
                        if (data.files[0].size > 5 * 1000 * 1000) {
                            $scope.$apply(function () {
                                $scope.defaultSound.imgUploadMsgClass = "text-error";
                                $scope.defaultSound.imgUploadMsg = '您上传的文件过大，请上传小于5MB的海报图片。';
                            });
                            return;
                        }
                        if (!$scope.defaultSound.fileName) {
                            $scope.defaultSound.fileName = new Date().getTime() + "_" + UserService.getCurUserAlias();
                        }
                        $scope.posterInfo = Storage.getImageUploadURL({key: $scope.defaultSound.fileName}, function () {
                            data.formData = {key: $scope.defaultSound.fileName, token: $scope.posterInfo.token};
                            data.submit();
                        });
                    },
                    submit: function (e, data) {
                        $scope.defaultSound.uplodingPoster = true;
                        $("#save_button").addClass("disabled");
                        $('#cancel_img_upload').click(function () {
                            data.abort();
                            $scope.$apply(function () {
                                $scope.defaultSound.uplodingPoster = false;
                            });

                            return false;
                        });
                    },
                    progress: function (e, data) {
                        var progress = parseInt(data.loaded / data.total * 100, 10);
                        $scope.$apply(function () {
                            $scope.defaultSound.imgUploadMsg = '已上传' + progress + '%';
                        });
                    },
                    send: function (e, data) {
                        $scope.defaultSound.imgUploadMsgClass = "text-info";
                        $scope.defaultSound.imgUploadMsg = '已上传0%';
                    },
                    done: function (e, data) {
                        $scope.$apply(function () {
                            $scope.defaultSound.imgUploadMsgClass = "text-success";
                            $scope.defaultSound.imgUploadMsg = '声音海报上传成功';
                            $scope.defaultSound.uplodingPoster = false;
                        });

                        $scope.defaultSound.posterId = $scope.defaultSound.fileName;
                        if ($scope.defaultSound.name && $scope.defaultSound.tags.length > 0) {
                            $("#save_button").removeClass("disabled");
                        }
                    },
                    fail: function (e, data) {
                        $scope.defaultSound.uplodingPoster = false;
                        if (data.errorThrown === 'abort') {
                            $scope.defaultSound.imgUploadMsgClass = "text-success";
                            $scope.defaultSound.imgUploadMsg = '海报上传已取消。';
                        }
                        else {
                            $scope.defaultSound.imgUploadMsgClass = "text-error";
                            $scope.defaultSound.imgUploadMsg = '海报图片上传失败，请稍后再试。';
                        }
                    }
                });

                function reset() {
                    $scope.defaultSound = {};
                    $scope.defaultSound.name = null;
                    $scope.defaultSound.fileName = null;
                    $scope.defaultSound.alias = null;
                    $scope.defaultSound.description = null;
                    $scope.defaultSound.status = "public";
                    $scope.defaultSound.tags = [];
                    $scope.defaultSound.profileSaved = false;
                    $scope.defaultSound.dataSaved = false;
                    $scope.defaultSound.posterUrl = "img/voice.jpg";

                    $scope.defaultSound.profileMsgClass = "";
                    $scope.defaultSound.profileMsg = "";

                    $scope.defaultSound.isSoundUploading = false;
                    $scope.defaultSound.uploadMsgClass = "";
                    $scope.defaultSound.uploadMsg = '';

                    $scope.defaultSound.uplodingPoster = false;
                    $scope.defaultSound.imgUploadMsgClass = "";
                    $scope.defaultSound.imgUploadMsg = '';
                }
            }
        ])

}());

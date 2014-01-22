angular.module('playlist.services', ['ngResource'])
    .factory('PlayListService', ['$resource', 'config', function ($resource, config) {

        return $resource(config.service.url + '/sound/playlist', {}, {
            get: {method: 'GET', params: { }, isArray: true},
            add: {method: 'POST', params: { }, isArray: false},
            remove: {method: 'DELETE', params: { }, isArray: false}
        });
    }
    ])
    .factory('PlayList', ['User', 'UserService', 'PlayListService', 'SoundUtilService', 'CurSoundList', 'config',
        function (User, UserService, PlayListService, SoundUtilService, CurSoundList, config) {
            var sounds = [];

            if (!UserService.validateRoleGuest()) {
                var playlist = PlayListService.get({}, function () {
                    $.each(playlist, function (index, oneSound) {
                        var sound = SoundUtilService.buildSound(oneSound);
                        sounds.push(sound);
                    });
                });
            }
            return {
                setup: function () {
                    if (!UserService.validateRoleGuest()) {
                        var playlist = PlayListService.get({}, function () {
                            $.each(playlist, function (index, oneSound) {
                                var sound = SoundUtilService.buildSound(oneSound);
                                sounds.push(sound);
                            });
                        });
                    }
                },
                list: function () {
                    return sounds;
                },
                addSound: function (sound) {
                    for (var i = 0; i < sounds.length; i++) {
                        if (sounds[i].id == sound.id) {
                            var temp = sounds[i];
                            sounds[i] = sound;
                            sounds[i].isPlaying = temp.isPlaying;
                            return;
                        }
                    }
                    sounds.push(sound);
                },
                removeSound: function (sound) {
                    for (var i = 0; i < sounds.length; i++) {
                        if (sounds[i].id == sound.id) {
                            var removeIndex = i;
                            if (!UserService.validateRoleGuest()) {
                                PlayListService.remove({soundId: sound.id}, function () {
                                    sounds.splice(removeIndex, 1);
                                });
                            }
                            else {
                                sounds.splice(removeIndex, 1);
                            }
                        }
                    }
                },
                getSound: function (id) {
                    for (var i = 0; i < sounds.length; i++) {
                        if (sounds[i].id == id) {
                            return  sounds[i];
                        }
                    }
                    return  null;
                },
                getSoundByAlias: function (alias) {
                    for (var i = 0; i < sounds.length; i++) {
                        if (sounds[i].alias == alias) {
                            return  sounds[i];
                        }
                    }
                    return  null;
                },
                getNextSound: function (id) {
                    if (sounds.length == 0) {
                        return null;
                    }
                    var soundIndex = null;
                    for (var i = 0; i < sounds.length; i++) {
                        if (sounds[i].id == id) {
                            soundIndex = i;
                        }
                    }

                    if (soundIndex !== null) {
                        return sounds[(soundIndex >= sounds.length - 1) ? 0 : (soundIndex + 1)];
                    }
                    else {
                        return sounds[0];
                    }
                },
                getPreSound: function (id) {
                    if (sounds.length == 0) {
                        return null;
                    }
                    var soundIndex = null;
                    for (var i = 0; i < sounds.length; i++) {
                        if (sounds[i].id == id) {
                            soundIndex = i;
                            break;
                        }
                    }

                    if (soundIndex !== null) {
                        return sounds[(soundIndex == 0) ? (sounds.length - 1) : (soundIndex - 1)];
                    }
                    else {
                        return sounds[0];
                    }
                },
                getFirstSound: function () {
                    if (sounds.length) {
                        return sounds[0];
                    }
                    else {
                        return null;
                    }
                },
                getRandomSound: function () {
                    var random = Math.floor(Math.random() * sounds.length);
                    return sounds[random];
                }
            };
        }])

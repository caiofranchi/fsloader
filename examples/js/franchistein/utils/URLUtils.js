/**
 * Created with JetBrains WebStorm.
 * User: caio.franchi
 * Date: 20/09/12
 * Time: 18:25
 */
var URLUtils = {
    getBaseURL: function () {
        return location.protocol + "//" + location.hostname + (location.port && ":" + location.port) + "/";
    },
    getFullURL: function () {
        return document.URL;
    },
    getCurrentDomain: function () {
        return document.domain;
    },
    getCurrentHash: function () {
        return location.hash;
    }
};
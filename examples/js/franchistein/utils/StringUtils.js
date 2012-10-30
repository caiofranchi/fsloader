//BASIC OBJECT ENCAPSULATION
var StringUtils = {
    getFileExtension: function (pStrPath) {
        "use strict";
        return pStrPath.split('.').pop();
    }
};

/*
StringUtils.prototype.bar = function() {
    alert('sim');
};
*/

/*
//MODULE PATTERN (singleton by doug crockford)
 var myInstance = (function() {
 var privateVar = '';

 function privateMethod () {
 // ...
 }

 return { // public interface
 publicMethod1: function () {
 // all private members are accesible here
 },
 publicMethod2: function () {
 }
 };
 })();
 */

/*
//SINGLETON
"use strict";
var StringUtils = function() {

    if (StringUtils.prototype._singletonInstance ) {
        return StringUtils.prototype._singletonInstance;
    }
    StringUtils.prototype._singletonInstance = this;

    this.message = function( pMessage ) {
       alert( pMessage );
    };
};

var a = new StringUtils();
var b = StringUtils();
global.result = a === b;
*/
//(function(global) {



//}(window));
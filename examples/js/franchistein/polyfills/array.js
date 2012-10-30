/**
 * Created with JetBrains WebStorm.
 * User: caio.franchi
 * Date: 19/09/12
 * Time: 16:23
 */
if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (searchElement /*, fromIndex */ ) {
        "use strict";
        if (this === null) {
            throw new TypeError();
        }
        var t = Object(this);
        var len = t.length >>> 0;
        if (len === 0) {
            return -1;
        }
        var n = 0;
        if (arguments.length > 0) {
            n = Number(arguments[1]);
            if (n !== n) { // shortcut for verifying if it's NaN
                n = 0;
            } else if (n !== 0 && n !== Infinity && n !== -Infinity) {
                n = (n > 0 || -1) * Math.floor(Math.abs(n));
            }
        }
        if (n >= len) {
            return -1;
        }
        var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
        for (; k < len; k++) {
            if (k in t && t[k] === searchElement) {
                return k;
            }
        }
        return -1;
    }
}

if (!Array.prototype.indexByObjectValue) {
    Array.prototype.indexByObjectValue = function (pName, pValue) {
        var total = this.length;
        for (var i=0; i<total; i++) {
            if (this[i][pName] === pValue) {
                return i;
            }
        }
        return -1;
    }
}

if(!Array.prototype.shuffle){
    Array.prototype.shuffle = function() {
        var s = [];
        while (this.length) s.push(this.splice(Math.random() * this.length, 1)[0]);
        while (s.length) this.push(s.pop());
        return this;
    }
}

if(!Array.prototype.remove) {
    Array.prototype.remove = function(member) {
        var index = this.indexOf(member);
        if (index > -1) {
            this.splice(index, 1);
        }
        return this;
    }
}

/**
 * Created with JetBrains WebStorm.
 * Author: caio.franchi
 * Date: 25/09/12
 * Time: 15:11
 */
var logDiv,
    logDetailsDiv;

function log( text ) {
    logDiv.innerHTML = text;
}

function dump(obj) {
    if (typeof obj === "undefined") {
        return "undefined";
    }
    var _props = [];

    for ( var i in obj ) {
        _props.push( i + " : " + obj[i] );
    }
    return " {" + _props.join( ",<br>" ) + "} ";
}
/*
 Copyright (c) 2012 Caio Franchi http://caiofranchi.com.br

 Permission is hereby granted, free of charge, to any person obtaining a copy of
 this software and associated documentation files (the "Software"), to deal in
 the Software without restriction, including without limitation the rights to
 use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 of the Software, and to permit persons to whom the Software is furnished to do
 so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NON INFRINGEMENT. IN NO EVENT SHALL
 THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.
 */

// SET NAMESPACE
var F_NAMESPACE;
if (this.fs) {
    //if FS framework is defined, we change the namespace/scope
    F_NAMESPACE = this.fs;
} else {
    //if not, set window as a namespace/scope
    F_NAMESPACE = window;
}

window.URL = window.URL || window.webkitURL;

(function(pNamespace) {
    "use strict";

    var NS = pNamespace;


    /**
     * Helper class for manipulate data on FSLoader. (Do not instantiate)
     * @static
     * @class
     * @constructor
     * @throws {SyntaxError} Do not instantiate a static class
     */
    NS.FSLoaderHelpers = function () {
        throw new Error("Do not instantiate a static class");
    }


    //LOADING TYPES

    /**
     * @property LOAD_AS_TAGS
     * @protected
     * @static
     * @type {String}
     */
    NS.FSLoaderHelpers.LOAD_AS_TAGS = "tag";

    /**
     * @property LOAD_AS_XHR
     * @protected
     * @static
     * @type {String}
     */
    NS.FSLoaderHelpers.LOAD_AS_XHR = "xhr";

    /**
     * @property LOAD_AS_BLOB
     * @protected
     * @static
     * @type {String}
     */
    NS.FSLoaderHelpers.LOAD_AS_BLOB = "blob";

    /**
     * @property LOAD_AS_BLOB
     * @protected
     * @static
     * @type {String}
     */
    NS.FSLoaderHelpers.LOAD_AS_ARRAY_BUFFER = "arraybuffer";
    NS.FSLoaderHelpers.DEFAULT_LOAD_TYPE = "tag";

    //LOAD METHODS
    NS.FSLoaderHelpers.METHOD_GET = "GET";
    NS.FSLoaderHelpers.METHOD_POST = "POST";

    //LOADER TYPES (read-only)
    NS.FSLoaderHelpers.TYPE_JAVASCRIPT = "script";
    NS.FSLoaderHelpers.TYPE_CSS = "css";
    NS.FSLoaderHelpers.TYPE_IMAGE = "image";
    NS.FSLoaderHelpers.TYPE_SOUND = "sound";
    NS.FSLoaderHelpers.TYPE_JSON = "json";
    NS.FSLoaderHelpers.TYPE_XML = "xml";
    NS.FSLoaderHelpers.TYPE_SVG = "svg";
    NS.FSLoaderHelpers.TYPE_TEXT = "text";

    NS.FSLoaderHelpers.FILE_TYPE_TEXT = "text";
    NS.FSLoaderHelpers.FILE_TYPE_BINARY = "binary";

    //LOADING STATES (read-only)
    NS.FSLoaderHelpers.STATE_UNLOADED = "unloaded";
    NS.FSLoaderHelpers.STATE_STARTED = "started";
    NS.FSLoaderHelpers.STATE_LOADING = "loading";
    NS.FSLoaderHelpers.STATE_FINISHED = "complete";
    NS.FSLoaderHelpers.STATE_ERROR = "error";

    //OPTIONS
    NS.FSLoaderHelpers.REGISTERED_LOADER_OPTIONS = ["id", "preventCache", "container"];
    NS.FSLoaderHelpers.REGISTERED_QUEUE_OPTIONS = ["id", "preventCache", "container", "ignoreErrors", "onitemerror", "onitemerrorparams", "onitemcomplete", "onitemcompleteparams", "onitemstart", "onitemstartparams", "onqueueerror", "onqueueerrorparams", "onqueuecomplete", "onqueuecompleteparams", "onqueueprogress", "onqueueprogressparams"];
    NS.FSLoaderHelpers.REGISTERED_ITEM_OPTIONS = ["id", "preventCache", "method", "type", "onstart", "onstartparams", "onerror", "onerrorparams", "oncomplete", "oncompleteparams"];
    NS.FSLoaderHelpers.MERGE_OPTIONS = ["preventCache"];

    /**

     @method isBinary
     @description Verify by the file type if its binary or not

     @param {String} pStrType The file type

     @returns {Boolean} returns true if binary and false if not

     */
    NS.FSLoaderHelpers.isBinary = function (pStrType) {
        "use strict";
        switch (pStrType) {
            case FSLoaderHelpers.TYPE_IMAGE:
            case FSLoaderHelpers.TYPE_SOUND:
                return true;
            default:
                return false;
        };
    };

    /**

     @method getFileExtension
     @description Returns a String with the file extension of a given URL

     @param {String} pStrPath The URL path

     @returns {String} returns the file extension

     */
    NS.FSLoaderHelpers.getFileExtension = function (pStrPath) {
        "use strict";
        return pStrPath.split('.').pop();
    };

    NS.FSLoaderHelpers.identifyTagType = function (pHTMLElement) {
        "use strict";
        switch (pHTMLElement.tagName.toUpperCase()) {
            case "IMG":
                return {tag:pHTMLElement, path:pHTMLElement.src, type:FSLoaderHelpers.TYPE_IMAGE};
                break;
            case "LINK":
                return {tag:pHTMLElement, path:pHTMLElement.href, type:FSLoaderHelpers.TYPE_CSS};
                break;
            case "SCRIPT":
                return {tag:pHTMLElement, path:pHTMLElement.src, type:FSLoaderHelpers.TYPE_JAVASCRIPT};
                break;
        };
    };

    /**

     @method findRule
     @description Helper method for search and get a specific cssRule on a CSSRuleList

     @param {CSSRuleList} pCssRuleList The rule list
     @param {String} pRule the rule name

     @returns {Array} returns a array of founded values for the specific rule

     */
    NS.FSLoaderHelpers.findRule = function (pCssRuleList, pRule) {
        if (pCssRuleList === null) return [];
        var i,
            total= pCssRuleList.length,
            difValue = "initial",
            strStyle,
            arrFound = [];

        for (i=0; i < total; i++) {

            if ( pCssRuleList[i].style !== undefined ) {
                strStyle = pCssRuleList[i].style[pRule];
                if (strStyle !== difValue && strStyle !== "" && strStyle !== undefined && strStyle !== "none") {
                    //remove the URL( ) from the item
                    strStyle = strStyle.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
                    arrFound.push(strStyle);
                }
            }

        }

        return arrFound;
    };

    /**

     @method isBinary
     @description Verify by the file type if its binary or not

     @param {String} pStrType The file type

     @returns {Boolean} returns true if binary and false if not

     */
    NS.FSLoaderHelpers.isData = function(pStrType) {
        "use strict";
        switch (pStrType) {
            case FSLoaderHelpers.TYPE_JSON:
            case FSLoaderHelpers.TYPE_TEXT:
            case FSLoaderHelpers.TYPE_XML:
                return true;
            default:
                return false;
        };
    };

    /**

     @method getURLByBlob
     @description shortcut method to convert a BLOB into a loadable URL

     @param {String} pObjBlob The Blob

     @returns {Boolean} returns the Blob URL

     */
    NS.FSLoaderHelpers.getURLByBlob = function (pObjBlob) {
        "use strict";
        return window.URL.createObjectURL(pObjBlob);
    };

    /**

     @method isXHR2Supported
     @description Verify if the current browser supports XHR2

     @returns {Boolean} returns true if supports and false if not

     */
    NS.FSLoaderHelpers.isXHR2Supported = function () {
        var xhr = new XMLHttpRequest;

        return (

            typeof xhr.upload !== "undefined" && (
                // Web worker
                typeof window.postMessage !== "undefined" ||
                    // window
                    (typeof window.FormData !== "undefined" && typeof window.File !== "undefined" && typeof window.Blob !== "undefined")
                )

            );
    };

} (F_NAMESPACE));
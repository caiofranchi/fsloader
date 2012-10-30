/**
 * Created with JetBrains WebStorm.
 * Author: Caio Franchi
 * Date: 02/10/12
 * Time: 11:51
 */

/**

 @author <a href="http://caiofranchi.com.br">Caio Franchi</a>

 @namespace window

 @class FSLoaderHelpers

 */
window.URL = window.URL || window.webkitURL;
window.FSLoaderHelpers = {

    //LOADING TYPES
    LOAD_AS_TAGS : "tag",
    LOAD_AS_XHR : "xhr",
    LOAD_AS_BLOB : "blob",
    LOAD_AS_ARRAY_BUFFER : "arraybuffer",
    DEFAULT_LOAD_TYPE : "tag",

    //LOAD METHODS
    METHOD_GET : "GET",
    METHOD_POST : "POST",

    //LOADER TYPES (read-only)
    TYPE_JAVASCRIPT : "script",
    TYPE_CSS : "css",
    TYPE_IMAGE : "image",
    TYPE_SOUND : "sound",
    TYPE_JSON : "json",
    TYPE_XML : "xml",
    TYPE_SVG : "svg",
    TYPE_TEXT : "text",

    FILE_TYPE_TEXT : "text",
    FILE_TYPE_BINARY : "binary",

    //LOADING STATES (read-only)
    STATE_UNLOADED : "unloaded",
    STATE_STARTED : "started",
    STATE_LOADING : "loading",
    STATE_FINISHED : "complete",
    STATE_ERROR : "error",

    //OPTIONS
    REGISTERED_LOADER_OPTIONS : ["id", "preventCache", "container"],
    REGISTERED_QUEUE_OPTIONS : ["id", "preventCache", "container", "ignoreErrors", "onitemerror", "onitemerrorparams", "onitemcomplete", "onitemcompleteparams", "onitemstart", "onitemstartparams", "onqueueerror", "onqueueerrorparams", "onqueuecomplete", "onqueuecompleteparams", "onqueueprogress", "onqueueprogressparams"],
    REGISTERED_ITEM_OPTIONS : ["id", "preventCache", "method", "type", "onstart", "onstartparams", "onerror", "onerrorparams", "oncomplete", "oncompleteparams"],
    MERGE_OPTIONS : ["preventCache"],

    //Registered internal modules
    MODULE_BASE : "js/franchistein/",

    /**

     @method isBinary
     @description Verify by the file type if its binary or not

     @param {String} pStrType The file type

     @returns {Boolean} returns true if binary and false if not

     */
    isBinary: function (pStrType) {
        "use strict";
        switch (pStrType) {
            case FSLoaderHelpers.TYPE_IMAGE:
            case FSLoaderHelpers.TYPE_SOUND:
                return true;
            default:
                return false;
        };
    },

    getFileExtension: function (pStrPath) {
        "use strict";
        return pStrPath.split('.').pop();
    },

    identifyTagType: function (pHTMLElement) {
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
    },

    /**

     @method findRule
     @description Helper method for search and get a specific cssRule on a CSSRuleList

     @param {CSSRuleList} pCssRuleList The rule list
     @param {String} pRule the rule name

     @returns {Array} returns a array of founded values for the specific rule

     */
    findRule: function (pCssRuleList, pRule) {
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
    },

    /**

     @method isBinary
     @description Verify by the file type if its binary or not

     @param {String} pStrType The file type

     @returns {Boolean} returns true if binary and false if not

     */
    isData: function(pStrType) {
        "use strict";
        switch (pStrType) {
            case FSLoaderHelpers.TYPE_JSON:
            case FSLoaderHelpers.TYPE_TEXT:
            case FSLoaderHelpers.TYPE_XML:
                return true;
            default:
                return false;
        };
    },

    /**

     @method getURLByBlob
     @description shortcut method to convert a BLOB into a loadable URL

     @param {String} pObjBlob The Blob

     @returns {Boolean} returns the Blob URL

     */
    getURLByBlob: function (pObjBlob) {
        "use strict";
        return window.URL.createObjectURL(pObjBlob);
    },

    /**

     @method isXHR2Supported
     @description Verify if the current browser supports XHR2

     @returns {Boolean} returns true if supports and false if not

     */
    isXHR2Supported: function () {
        var xhr = new XMLHttpRequest;

        return (

            typeof xhr.upload !== "undefined" && (
                // Web worker
                typeof window.postMessage !== "undefined" ||
                    // window
                    (typeof window.FormData !== "undefined" && typeof window.File !== "undefined" && typeof window.Blob !== "undefined")
                )

            );
    }
};
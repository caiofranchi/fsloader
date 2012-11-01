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

    /**

     @method getFileExtension
     @description Returns a String with the file extension of a given URL

     @param {String} pStrPath The URL path

     @returns {String} returns the file extension

     */
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
};/**
 * Created with JetBrains WebStorm.
 * Author: caio.franchi
 * Date: 03/10/12
 * Time: 16:17
 */

/**

 @author <a href="http://caiofranchi.com.br">Caio Franchi</a>

 @description Single LoaderItem for registering data of each loadable element
 @namespace window
 @constructor
 @class FSLoaderItem
 @param {FSLoader} pRef The FSLoader owner of this item
 @param {String} pStrPath The path for loading
 @param {Object} pObjOptions Options for this individual loading
 */
window.FSLoaderItem = function (pRef, pStrPath, pObjOptions) {
    "use strict";
    //setup
    this.id = "loader-item-" + pRef.items.length; //it the id was not set, generate automatically
    this.path = pStrPath;
    this.options = {};
    this.reference = pRef;
    this.data = undefined;
    this.type = undefined;
    this.params = {};
    this.method = FSLoaderHelpers.METHOD_GET;
    this.retries = 0;
    this.retriesLeft = 0;
    this.loadingType = undefined;

    //preventCache?
    this.preventCache = false;

    //defined by system
    this.element = undefined;
    this.state = FSLoaderHelpers.STATE_UNLOADED;
    this.queue = undefined;
    this.data = undefined;
    this.bytesTotal = 0;
    this.bytesLoaded = 0;
    this.progress = 0;

    if (pObjOptions !== undefined) {
        this.options = pObjOptions;
        //id
        if (pObjOptions.id !== undefined) {
            this.id = pObjOptions.id;
        }
        //type of file
        if (pObjOptions.type === undefined) {
            this.type = pRef.getFileType(pStrPath);
        } else {
            this.type = pObjOptions.type;
        }

        //method for loading
        if (pObjOptions.method !== undefined) {
            this.method = pObjOptions.method;
        }

        //prevent cache
        if (pObjOptions.preventCache !== undefined) {
            this.preventCache = pObjOptions.preventCache;
        }

        //retries?
        if (pObjOptions.retries !== undefined) {
            this.retries = this.retriesLeft = pObjOptions.retries;
        }
    } else {
        //type of file
        this.type = pRef.getFileType(pStrPath);
    }
};/**
 * FSLoader - A simple and user-friendly script for lazy loading assets on the fly and also for preloading then.
 * Author: Caio Franchi
 * Date: 20/09/12
 * Last Update: 24/09/2012
 * Time: 12:45
 * Version:  0.1b
 * Dependencies: utils/StringUtils, polyfills/function.js
 * Usage:
 * //generic loading
 * //javascript loading
 * //css loading
 * //image loading
 *
 * //queue loading
 *
 * //using for preloading assets for your sites
 *
 *
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
/*jslint browser: true*/
/*global document,console,StringUtils*/

//TODO: Transform class into MODULE pattern
/**

 @author <a href="http://caiofranchi.com.br">Caio Franchi</a>

 @namespace window

 @class FSLoader
 @param {Object} pObjDefaultOptions The option for the loader.
 */
window.FSLoader = function (pObjDefaultOptions) { //pObjOptions = {container,onstart,onerror,oncomplete,type:swf|img|js|css,preventCache:true|false,onstartparams}
    "use strict";
    // VARS
    this.currentLoading = false;
    this.items = [ ];
    this.options = { };
    this.currentRequest = undefined;

    //SET DEFAULTS

    if (pObjDefaultOptions !== undefined) {
        this.options = pObjDefaultOptions;
    }

    // set the default container
    if (this.options !== undefined && this.options.container !== undefined) {
        this.containerElement = this.options.container;
    } else {
        this.containerElement = document.createElement("div");
        this.containerElement.id = "divContainerFSLoader";
        this.containerElement.style.display = "none";
        document.body.appendChild(this.containerElement);
    }
};

window.FSLoader.prototype = {

    //PUBLIC METHODS

    //load a single element
    load: function (pStrPath, pObjOptions, pAutoLoad) {
        "use strict";
        var strType;

        //create a FS Loader for the request
        var currentItem = this.generateLoaderItem(pStrPath, pObjOptions);

        this.items.push(currentItem);

        if (pAutoLoad === undefined || pAutoLoad === true) {
           this.executeLoad(currentItem);
        }

        return currentItem;
    },

    //get element by id
    get: function (pValue) {
        "use strict";
        return this.getElementByAttribute("id", pValue);
    },

    //get element by attribute
    getElementByAttribute: function (pAttribute, pValue) {
        "use strict";
        return this.items[this.items.indexByObjectValue(pAttribute, pValue)];
    },

    //PRIVATE METHODS
    /*
     @private
     @param {String} pStrURL The current URL
     @param {Boolean} pPreventCache If the URL must be prevented from cache
     @return {String} Evaluated URL
     */
    evaluateURL: function (pStrURL, pPreventCache) {
        "use strict";
        if (pPreventCache === true) {
            var newUrl;
            if (pStrURL.indexOf("?") === -1) {
                newUrl = pStrURL + "?cache=" + new Date().getDate();
            } else {
                newUrl = pStrURL + "&cache=" + new Date().getDate();
            }
            return newUrl;
        } else {
            return pStrURL;
        }
    },

    /**
     * Method for detecting the best method for loading an element
     * @private
     * @param pStrType The string containing the file type
     * @return {String} Returns the suggested loading type
     */
    identifyLoadingType: function (pStrType) {
        "use strict";
        //if the file is a binary
        if (FSLoaderHelpers.isBinary(pStrType) === true) {
            if (FSLoaderHelpers.isXHR2Supported()) {
                //verify if its possible to load as XHR2 and return the BLOB
                //return FSLoaderHelpers.LOAD_AS_XHR2;
                return FSLoaderHelpers.LOAD_AS_TAGS;
            } else {
                //if its not possible, load as tag
                return FSLoaderHelpers.LOAD_AS_TAGS;
            }
        } else {
            //if it text content
            if (FSLoaderHelpers.isData(pStrType)) {
                return FSLoaderHelpers.LOAD_AS_XHR;
            } else {
                //if its TAG (js, css, svg)
                return FSLoaderHelpers.LOAD_AS_TAGS;
            }
        }
    },

    /**
     * Generate the element TAG based on file type
     * @private
     * @param pStrType The string containing the file type
     * @param pStrPath Path for loading
     * @return {Element} The created element
     */
    generateTagByType: function (pStrType, pStrPath) {
        "use strict";
        switch (pStrType) {
        case FSLoaderHelpers.TYPE_CSS:
            return this.createCssTag(pStrPath);
        case FSLoaderHelpers.TYPE_JAVASCRIPT:
            return this.createJavascriptTag(pStrPath);
        case FSLoaderHelpers.TYPE_IMAGE:
            return this.createImageTag(pStrPath);
        case FSLoaderHelpers.TYPE_SVG:
            return this.createSVGTag(pStrPath);
        case FSLoaderHelpers.TYPE_SOUND:
            return this.createSoundTag(pStrPath);
        }
    },

    /**
     * Get file type based on his extension's path
     * @private
     * @param pStrPath The URL path
     * @return {String} The file type for loading, based on file extension and recognized file types for loading
     */
    getFileType: function (pStrPath) {
        "use strict";
        var strExtension = FSLoaderHelpers.getFileExtension(pStrPath);

        switch (strExtension) {
        case "ogg":
        case "mp3":
        case "wav":
            return FSLoaderHelpers.TYPE_SOUND;
        case "jpeg":
        case "jpg":
        case "gif":
        case "png":
            return FSLoaderHelpers.TYPE_IMAGE;
        case "json":
            return FSLoaderHelpers.TYPE_JSON;
        case "xml":
            return FSLoaderHelpers.TYPE_XML;
        case "css":
            return FSLoaderHelpers.TYPE_CSS;
        case "js":
            return FSLoaderHelpers.TYPE_JAVASCRIPT;
        case 'svg':
            return FSLoaderHelpers.TYPE_SVG;
        default:
            return FSLoaderHelpers.TYPE_TEXT;
        }
    },

    createJavascriptTag: function (pStrPath) {
        "use strict";
        var elScript = document.createElement("script");

        //setup element
        elScript.setAttribute("type", "text/javascript");
        elScript.setAttribute("src", pStrPath);

        return elScript;
    },

    createSVGTag: function (pStrPath) {
        "use strict";
        var elScript = document.createElement("object");

        //setup element
        elScript.setAttribute("type", "image/svg+xml");
        elScript.setAttribute("src", pStrPath);

        return elScript;
    },

    createSoundTag: function (pStrPath) {
        "use strict";
        var elScript = document.createElement("audio");

        //setup element
        elScript.setAttribute("type", "audio/ogg");
        elScript.setAttribute("src", pStrPath);

        return elScript;
    },

    createCssTag: function (pStrPath) {
        "use strict";
        var elScript = document.createElement("link");
        //setup element
        elScript.setAttribute("rel", "stylesheet");
        elScript.setAttribute("type", "text/css");
        elScript.setAttribute("href", pStrPath);

        return elScript;
    },

    createImageTag: function (pStrPath) {
        "use strict";
        var elScript = document.createElement("img");

        //setup element
        elScript.setAttribute("src", pStrPath);

        return elScript;
    },

    executeLoad: function (pFSLoaderItem) {
        "use strict";

        //refresh FSLoaderItem
        pFSLoaderItem.state = pFSLoaderItem.STATE_STARTED;

        //assign on start
        var onStartCallback;
        if (pFSLoaderItem.options["onstart"] !== undefined) {
            onStartCallback = pFSLoaderItem.options.onstart;
        }

        //trigger event callback
        if (onStartCallback !== undefined) {
            if (pFSLoaderItem.options.onstartparams !== undefined) {
                onStartCallback.apply(pFSLoaderItem, pFSLoaderItem.options.onstartparams);
            } else {
                onStartCallback.apply(pFSLoaderItem);
            }
        }

        //loading
        pFSLoaderItem.state = pFSLoaderItem.STATE_LOADING;


        //if the item belongs to a queue, exec the callback
        if (pFSLoaderItem.queue !== undefined) {
            pFSLoaderItem.queue.onQueueItemStart(this);
        };


        //LOAD ASSET AS TAG
        if (pFSLoaderItem.loadingType === FSLoaderHelpers.LOAD_AS_TAGS) {

            //load as tags
            var elScript = this.generateTagByType(pFSLoaderItem.type, this.evaluateURL(pFSLoaderItem.path, pFSLoaderItem.preventCache));

            pFSLoaderItem.element = elScript;


            //console.log(elScript.readyState+"rdyStateFora");
            /*if (elScript.readyState !== undefined) {  //IE7+
                elScript.onreadystatechange = function () {
                   //console.log(elScript.readyState+"rdyState");
                   if (elScript.readyState === "loaded" || elScript.readyState === "complete") {
                       elScript.onreadystatechange = null;
                       //if(onCompleteCallback) onCompleteCallback();
                       //console.log(elScript.readyState+"rdyState");
                       this.onItemLoadComplete.apply(pFSLoaderItem);
                   } else if (elScript.readyState === "loaded") {
                       this.onItemLoadError.apply(pFSLoaderItem);
                   }
                };
            } else {
                elScript.addEventListener("load", this.onItemLoadComplete.bind(pFSLoaderItem), false);
                elScript.addEventListener("error", this.onItemLoadError.bind(pFSLoaderItem), false);
            }*/

            //setup event
            elScript.addEventListener("load", this.onItemLoadComplete.bind(pFSLoaderItem), false);
            elScript.addEventListener("error", this.onItemLoadError.bind(pFSLoaderItem), false);

            try {
                if (pFSLoaderItem.options.container === undefined) {
                    this.containerElement.appendChild(elScript);
                } else{
                    pFSLoaderItem.options.container.appendChild(elScript);
                }
            } catch (e) {
                throw new Error("Cannot appendChild script on the given container element.");
            };

        } else if (pFSLoaderItem.loadingType === FSLoaderHelpers.LOAD_AS_XHR || (pFSLoaderItem.loadingType === FSLoaderHelpers.LOAD_AS_BLOB || pFSLoaderItem.loadingType === FSLoaderHelpers.LOAD_AS_ARRAY_BUFFER)) {

            //console.log(pFSLoaderItem);
            // Old IE versions use a different approach
            if (window.XMLHttpRequest) {
                this.currentRequest = new XMLHttpRequest();
            } else {
                try {
                    this.currentRequest = new ActiveXObject("MSXML2.XMLHTTP.3.0");
                } catch (ex) {
                    return null;
                }
            }

            //IE9 doesn't support .overrideMimeType(), so we need to check for it.
            if (pFSLoaderItem.type === FSLoaderHelpers.TYPE_TEXT &&  this.currentRequest.overrideMimeType) {
                this.currentRequest.overrideMimeType('text/plain; charset=x-user-defined');
            }

            //load the XHR
            this.currentRequest.open(pFSLoaderItem.method, this.evaluateURL(pFSLoaderItem.path, pFSLoaderItem.preventCache), true);
            this.currentRequest.send();

            //if xhr2 is supported and the file is binary
            if (FSLoaderHelpers.isBinary(pFSLoaderItem.type) && FSLoaderHelpers.isXHR2Supported()) {
                if (pFSLoaderItem.loadingType === FSLoaderHelpers.LOAD_AS_BLOB) {
                    //if is Blob
                    this.currentRequest.responseType = 'blob';
                } else if (pFSLoaderItem.loadingType === FSLoaderHelpers.LOAD_AS_ARRAY_BUFFER) {
                    //If is a array buffer
                    this.currentRequest.responseType = 'arraybuffer';
                }
            }

            this.currentRequest.addEventListener("progress", this.onItemLoadProgress.bind(pFSLoaderItem), false);
            this.currentRequest.addEventListener("load", this.onItemLoadComplete.bind(pFSLoaderItem), false);
            this.currentRequest.addEventListener("error", this.onItemLoadError.bind(pFSLoaderItem), false);

            pFSLoaderItem.element = this.currentRequest;

            return true;
        }

        return false;
    },

    //returns a FSLoaderItem configured
    generateLoaderItem: function (pStrPath, pObjOptions) {
        "use strict";
        var objLoaderItem = new FSLoaderItem(this, pStrPath, pObjOptions);

        //assign loading type
        if (pObjOptions !== undefined) {
            if (pObjOptions.loadingType !== undefined) {
                objLoaderItem.loadingType = pObjOptions.loadingType;
            } else {
                objLoaderItem.loadingType = this.identifyLoadingType(objLoaderItem.type);
            }
        } else {
            objLoaderItem.loadingType = this.identifyLoadingType(objLoaderItem.type);
        }


        return objLoaderItem;
    },

    //function to remove listeners from the current element
    removeEventsFromElement: function (pEl) {
        "use strict";
        pEl.removeEventListener('load', this.onItemLoadComplete);
        pEl.removeEventListener('error', this.onItemLoadError);
        pEl.removeEventListener('progress', this.onItemLoadProgress);
    },

    //INTERNAL EVENTS

    //internal event on complete
    onItemLoadComplete: function (event) {
        "use strict";
        this.state = FSLoaderHelpers.STATE_FINISHED;
        this.progress = 100;
        if (this.reference.loadingType === FSLoaderHelpers.LOAD_AS_BLOB || this.reference.loadingType === FSLoaderHelpers.LOAD_AS_XHR) {
            //this.data =
            this.element = event.currentTarget;
        }

        //assign return data by type
        if (this.loadingType === FSLoaderHelpers.LOAD_AS_TAGS) {
            this.data = this.element;
        } else if (this.loadingType === FSLoaderHelpers.LOAD_AS_XHR) {
            this.data = event.currentTarget.response;
        } else if (this.loadingType === FSLoaderHelpers.LOAD_AS_BLOB || this.loadingType === FSLoaderHelpers.LOAD_AS_ARRAY_BUFFER) {
            this.data = event.currentTarget.response;
        }

        //if the item belongs to a queue, exec the callback
        if (this.queue !== undefined) {
            this.queue.onQueueItemComplete(this);
        };

        if (this.options.oncomplete !== undefined) {
            if (this.options.oncompleteparams !== undefined) {
                this.options.oncomplete.apply(this, this.options.oncompleteparams);
            } else {
                this.options.oncomplete.apply(this);
            }
        }
        //removing events from the element
        this.reference.removeEventsFromElement(this.element);
    },

    //internal event on error
    onItemLoadProgress: function (event) {
        "use strict";
        //prevent blank
        if (event.loaded > 0 && event.total === 0) {
            return;
        }
        //assign
        this.state = FSLoaderHelpers.STATE_LOADING;
        this.bytesLoaded = event.loaded;
        this.bytesTotal =  event.total;
        this.progress = Math.round((100 * this.bytesLoaded) / this.bytesTotal);

        //if the item belongs to a queue, exec the callback
        if (this.queue !== undefined) {
            this.queue.onQueueItemProgress(this);
        }

        if (this.options.onprogress !== undefined) {
            if (this.options.onprogressparams !== undefined) {
                this.options.onprogress.apply(this, this.options.onprogressparams);
            } else {
                this.options.onprogress.apply(this);
            }
        }
    },

    //internal event on error
    onItemLoadError: function (event) {
        "use strict";

        //removing events from the element
        this.reference.removeEventsFromElement(this.element);

        //if the item still retrying to load (with timeout)
        if (this.retriesLeft > 0) {
            //try again
            this.retriesLeft--;
            var ref = this;
            setTimeout(function () {
                ref.reference.executeLoad(ref);
            }, 100);

        } else {
            //retries has ended, consider the error

            //assign
            this.state = FSLoaderHelpers.STATE_ERROR;

            //if the item belongs to a queue, exec the callback
            if (this.queue !== undefined) {
                this.queue.onQueueItemError(this);
            }

            if (this.options.onerror !== undefined) {
                if (this.options.onerrorparams !== undefined) {
                    this.options.onerror.apply(this, this.options.onerrorparams);
                } else {
                    this.options.onerror.apply(this);
                }
            }
        }
    }
};/**
 * Created with JetBrains WebStorm.
 * Author: Caio Franchi
 * Date: 01/10/12
 * Time: 17:32
 */

/**

 @author <a href="http://caiofranchi.com.br">Caio Franchi</a>

 @namespace window

 @class FSLoaderQueue
 @param {Object} pObjDefaultOptions The option for the queue.
 */
window.FSLoaderQueue = function (pObjDefaultOptions) {
    "use strict";

    this.reference = new window.FSLoader(pObjDefaultOptions);

    this.currentIndex = 0;
    this.currentItem = undefined;
    this.ignoreErrors = true;
    this.isPaused = false;
    this.firstStart = true;
    //
    this.total = 0;
    this.totalLoaded = 0;
    this.progress = 0;
    //
    this.options = {};

    if (pObjDefaultOptions !== undefined) this.options = pObjDefaultOptions;

    if (this.options !== undefined) {
        if (this.options.ignoreErrors !== undefined) {
            this.ignoreErrors = this.options.ignoreErrors;
        };

        if (this.options.ignoreErrors !== undefined) {
            this.ignoreErrors = this.options.ignoreErrors;
        };
    }

    FSLoader.call(this, pObjDefaultOptions);
};

//Inherits
if (window.FSLoader !== undefined) {
    FSLoaderQueue.prototype = new window.FSLoader;
    FSLoaderQueue.prototype.constructor = window.FSLoaderQueue;
} else {
    window.FSLoaderQueue = undefined;
    throw new Error("FSLoaderQueue needs FSLoader for work.");
}

FSLoaderQueue.prototype.add = function (pPaths, pObjOptions) { //onqueueerror,onqueuecomplete,onqueueprogress
    "use strict";

    var filteredPath = [],
        totalPaths,
        i,
        currentItem = undefined;
    if (Object.prototype.toString.call(pPaths) === '[object Array]') {
        filteredPath = pPaths;
    } else {
        filteredPath.push(pPaths);
    }

    totalPaths = filteredPath.length;

    for (i = 0; i < totalPaths; i++) {
        currentItem = this.load(filteredPath[i], pObjOptions, false);
        currentItem.queue = this;
        currentItem.reference = this.reference;

        //this.items.push(currentItem); //already execs on inherited method LOAD
        this.total = this.items.length;
    }
};

FSLoaderQueue.prototype.start = function () {
    "use strict";
    if (this.items.length === 0)
        return;
    if (this.firstStart === true) {
        this.triggerCallbackEvent("onqueuestart");

        //trigger the single item event
        this.updateQueueProgress();
    }
    this.currentItem = this.items[this.currentIndex];
    this.executeLoad(this.currentItem);

    this.firstStart = false;
};

FSLoaderQueue.prototype.pause = function () {
    "use strict";
    this.isPaused = true;
    //this.currentItem.stop();
};

FSLoaderQueue.prototype.next = function () {
    this.currentIndex++;
    this.start();
}

FSLoaderQueue.prototype.previous = function () {
    this.currentIndex--;
    this.start();
}

FSLoaderQueue.prototype.verifyQueueEnd = function () {
    if (this.currentIndex < (this.total - 1)) {
        return true;
    } else {
        return false;
    }
}

FSLoaderQueue.prototype.onQueueItemComplete = function (pItem) {

    this.totalLoaded++;

    //trigger the single item event
    this.triggerCallbackEvent("onitemcomplete");
    //
    this.updateQueueProgress();

    if(this.verifyQueueEnd()) {
        this.next();
    } else {
        //queue complete
        this.triggerCallbackEvent("onqueuecomplete");
    }
};

FSLoaderQueue.prototype.onQueueItemError = function (pItem) {

    //trigger the single item event
    this.triggerCallbackEvent("onitemerror");

    if (this.ignoreErrors === true) {
        //to not distort current queue progress we set the progress of this item with 100
        pItem.progress = 100;

        //trigger the single item event
        this.updateQueueProgress();

        if(this.verifyQueueEnd()) {
            this.next();
        } else {
            //queue complete
            this.triggerCallbackEvent("onqueuecomplete");
        }
    } else {
        //trigger on queue error
        this.triggerCallbackEvent("onqueueerror");
    }
};

FSLoaderQueue.prototype.onQueueItemProgress = function (pItem) {
    //trigger the single item event
    this.updateQueueProgress();
};

FSLoaderQueue.prototype.onQueueItemStart = function (pItem) {
    this.triggerCallbackEvent("onitemstart", pItem);
};

FSLoaderQueue.prototype.updateQueueProgress = function () {
    var numTotalProgress = 0;

    for (var i = 0; i < this.items.length; i++) {
        numTotalProgress += this.items[i].progress;
    }

    this.progress = Math.round((numTotalProgress*100) / (100*this.items.length)); //calculate progress based on loaded items progress
    //item and queue both progress on the same time
    this.triggerCallbackEvent("onitemprogress");
    this.triggerCallbackEvent("onqueueprogress");
};

FSLoaderQueue.prototype.triggerCallbackEvent = function (pStrEventID, pDefinedSource) {
    var ref = this;
    if (pDefinedSource !== undefined) {
        //exec on base of other reference
        ref = pDefinedSource
    }

    if (ref.options === undefined) return;
    if (ref.options[pStrEventID] !== undefined) {
        if (ref.options[pStrEventID + "params"] !== undefined) {
            ref.options[pStrEventID].apply(ref, ref.options[pStrEventID + "params"]);
        } else {
            ref.options[pStrEventID].apply(ref);
        }
    };
};/**
 * Created with JetBrains WebStorm.
 * Author: Caio Franchi
 * Date: 01/10/12
 * Time: 17:32
 */
/*

WARNINGS:
    - Set FSPreloader tag after the tags that you want do load with data-preload="true" when not using DOM ready event
    - Cross-domain stylesheets cssRules being null
*/

//Inherits
window.FSPreloader = function (pObjDefaultOptions) {
    this.container = document;
    this.elements = [];
    this.cssElements = [];

    FSLoaderQueue.call(this, pObjDefaultOptions);
};

if (window.FSLoaderQueue !== undefined) {
    FSPreloader.prototype = new window.FSLoaderQueue;
    FSPreloader.prototype.constructor = window.FSLoaderQueue;
} else {
    window.FSPreloader = undefined;
    throw new Error("FSPreloader needs FSLoaderQueue to work.");
}

FSPreloader.prototype.parseCss = function (pCssElements) {
    "use strict";
    if (pCssElements !== undefined) {

        //DOM stylesheets are available
        var list = [],
            foundedPaths = [],
            totalStylesheets = pCssElements.length,
            i;

        //parse stylesheets to search for images and other loadable items
        for (i = 0; i < totalStylesheets; i++) {

            //prevent
            if (pCssElements[i] !== null && pCssElements[i] !== undefined) {
                if (pCssElements[i].cssRules !== null || pCssElements[i].rules !== null) {
                    if (typeof pCssElements[i].cssRules !== "undefined") {
                        list = pCssElements[i].cssRules;
                    } else if (typeof pCssElements[i].rules !== "undefined") {
                        list = pCssElements[i].rules;
                    }
                } else {
                    console.log("WARNING: cssRules/rules is null for the element: " + pCssElements[i].href);
                }

                //add the founded background images
                this.add(FSLoaderHelpers.findRule(list, "backgroundImage"));
            }
        }
    }
}

FSPreloader.prototype.parseDocument = function (pObjOptions) { //css:true|false

    //IMGS
    //var imageList = document.getElementsByTagName("img");

    //Parse elements to be preloaded
    this.elements = document.querySelectorAll('[data-preload="true"]');
    var total = this.elements.length;
    var currentEl,
        i;

    //add loadable identified elements
    for (i = 0; i < total; i++) {
        currentEl = FSLoaderHelpers.identifyTagType(this.elements[i]);

        if (currentEl.type === FSLoaderHelpers.TYPE_CSS) {
            //if it is a CSS, put on CSS parse list to load embeded images
            this.cssElements.push(currentEl.tag.sheet);
        } else if (currentEl.type === FSLoaderHelpers.TYPE_IMAGE) {
            //if is a IMG element, add to load queue
            this.add(currentEl.path);
        }
    }


    if (pObjOptions !== undefined) {
        //parse elements inside css
        if (pObjOptions.cssDependencies === "true" || pObjOptions.cssDependencies === true) {
            this.parseCss(this.cssElements);
        }
    }

}
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

    /**
     * @property DEFAULT_LOAD_TYPE
     * @protected
     * @static
     * @type {String}
     */
    NS.FSLoaderHelpers.DEFAULT_LOAD_TYPE = "tag";

    //LOAD METHODS

    /**
     * @property METHOD_GET
     * @protected
     * @static
     * @type {String}
     */
    NS.FSLoaderHelpers.METHOD_GET = "GET";

    /**
     * @property METHOD_POST
     * @protected
     * @static
     * @type {String}
     */
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
     * Verify by the file type if its binary or not
     * @param {String} pStrType The file type
     * @return {Boolean}
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
     * Returns a String with the file extension of a given URL
     * @param  {String} pStrPath The URL path
     * @return {String} The file extension
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
     * Helper method for search and get a specific cssRule on a CSSRuleList
     * @param {CSSRuleList} pCssRuleList The rule list
     * @return {Array} returns a array of founded values for the specific rule
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
     * Verify by the file type if is a text data type or not
     * @param {String} pStrType The file type
     * @return {Boolean}
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
     * Shortcut method to convert a BLOB into a loadable URL
     * @param {String} pObjBlob The Blob
     * @return {Boolean} returns the Blob URL
     */
    NS.FSLoaderHelpers.getURLByBlob = function (pObjBlob) {
        "use strict";
        return window.URL.createObjectURL(pObjBlob);
    };

    /**
     * Verify if the current browser supports XHR2
     * @return {Boolean} true if supports and false if not
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

} (F_NAMESPACE));/*
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

(function(pNamespace) {
    "use strict";

    var NS = pNamespace;

    /**
     * Single LoaderItem for registering data of each loadable element
     * @author <a href="http://caiofranchi.com.br">Caio Franchi</a>
     * @protected
     * @class FSLoaderItem
     * @constructor
     * @param {FSLoader} pRef The FSLoader owner of this item
     * @param {String} pStrPath The path for loading
     * @param {Object} pObjOptions Options for this individual loading
     */
    NS.FSLoaderItem = function (pRef, pStrPath, pObjOptions) {
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
    };

} (F_NAMESPACE));
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

/*jslint browser: true*/
/*global document,console,StringUtils*/

// SET NAMESPACE
var F_NAMESPACE;
if (this.fs) {
    //if FS framework is defined, we change the namespace/scope
    F_NAMESPACE = this.fs;
} else {
    //if not, set window as a namespace/scope
    F_NAMESPACE = window;
}

(function(pNamespace) {
    "use strict";

    var NS = pNamespace;

    /**
     * FSLoader - A simple and user-friendly script for lazy loading assets on the fly and also for preloading then.
     * @author <a href="http://caiofranchi.com.br">Caio Franchi</a>
     * @class FSLoader
     * @param {Object} [pObjDefaultOptions] The option for the loader.
     * @param {DOMElement} [pObjDefaultOptions.container]
     * @param {Boolean} [pObjDefaultOptions.preventCache]
     * @param {String} [pObjDefaultOptions.id]
     * @constructor
     */
    NS.FSLoader = function (pObjDefaultOptions) {
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
            if(document) {
                this.containerElement = document.createElement("div");
                this.containerElement.id = "divContainerFSLoader";
                this.containerElement.style.display = "none";
                document.body.appendChild(this.containerElement);
            } else {
                throw new Error("Document is not available. Please pass a valid containerElement.");
            }
        }
    };

    var proto = NS.FSLoader.prototype;

    //PUBLIC PROPERTIES

    /**
     * @property currentLoading
     * @type {Boolean}
     * @default false
     */
    proto.currentLoading = false;

    /**
     * @property items
     * @type {Array[FSLoaderItem]}
     * @default
     */
    proto.items = [];

    /**
     * @property options
     * @type {Object}
     * @default null
     */
    proto.options = null;


    //PRIVATE PROPERTIES

    /**
     * @property currentRequest
     * @private
     * @type {XMLHttpRequest}
     * @default null
     */
    proto.currentRequest = null;

    /**
     * @property containerElement
     * @type {HTMLElement}
     * @default undefined
     */
    proto.containerElement = undefined;

    //PUBLIC METHODS

    /**
     * Load a single element
     * @function
     * @public
     * @param pStrPath
     * @param {Object} [pObjOptions]
     * @param {String} [pObjOptions.id] An ID for easy get the current item
     * @param {Boolean} [pObjOptions.preventCache = false]
     * @param {String} [pObjOptions.type = "auto"]  FSLoaderHelpers.TYPE_JAVASCRIPT, FSLoaderHelpers.TYPE_CSS, FSLoaderHelpers.TYPE_IMAGE, FSLoaderHelpers.TYPE_SOUND, FSLoaderHelpers.TYPE_JSON, FSLoaderHelpers.TYPE_XML, FSLoaderHelpers.TYPE_SVG, FSLoaderHelpers.TYPE_TEXT
     * @param {String} [pObjOptions.loadingType = "tag"] FSLoaderHelpers.LOAD_AS_TAGS, LOAD_AS_XHR, FSLoaderHelpers.LOAD_AS_BLOB and LOAD_AS_ARRAY_BUFFER
     * @param {String} [pObjOptions.method] POST OR GET
     * @param {Function} [pObjOptions.onstart]
     * @param {Array} [pObjOptions.onstartparams]
     * @param {Function} [pObjOptions.onerror]
     * @param {Array} [pObjOptions.onerrorparams]
     * @param {Function} [pObjOptions.oncomplete]
     * @param {Array} [pObjOptions.oncompleteparams]
     * @param {Boolean} [pAutoLoad=true]
     * @return {FSLoaderItem}
     */
    proto.load = function (pStrPath, pObjOptions, pAutoLoad) {
        "use strict";
        var strType;

        //create a FS Loader for the request
        var currentItem = this.generateLoaderItem(pStrPath, pObjOptions);

        this.items.push(currentItem);

        if (pAutoLoad === undefined || pAutoLoad === true) {
            this.executeLoad(currentItem);
        }

        return currentItem;
    };

    /**
     * Get loaded element by ID
     * @function
     * @public
     * @param {String} pValue
     * @return {FSLoaderItem}
     */
    proto.get = function (pValue) {
        "use strict";
        return this.getElementByAttribute("id", pValue);
    };

    //get element by attribute
    /**
     * Get loaded element by specified attribute
     * @function
     * @public
     * @param {String} pAttribute
     * @param {String} pValue
     * @return {FSLoaderItem}
     */
    proto.getElementByAttribute = function (pAttribute, pValue) {
        "use strict";
        return this.items[this.items.indexByObjectValue(pAttribute, pValue)];
    };

    //PRIVATE METHODS
    /*
     @private
     @param {String} pStrURL The current URL
     @param {Boolean} pPreventCache If the URL must be prevented from cache
     @return {String} Evaluated URL
     */
    proto.evaluateURL = function (pStrURL, pPreventCache) {
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
    };

    /**
     * Method for detecting the best method for loading an element
     * @private
     * @param pStrType The string containing the file type
     * @return {String} Returns the suggested loading type
     */
    proto.identifyLoadingType = function (pStrType) {
        "use strict";
        //if the file is a binary
        if (NS.FSLoaderHelpers.isBinary(pStrType) === true) {
            if (NS.FSLoaderHelpers.isXHR2Supported()) {
                //verify if its possible to load as XHR2 and return the BLOB
                //return NS.FSLoaderHelpers.LOAD_AS_XHR2;
                return NS.FSLoaderHelpers.LOAD_AS_TAGS;
            } else {
                //if its not possible, load as tag
                return NS.FSLoaderHelpers.LOAD_AS_TAGS;
            }
        } else {
            //if it text content
            if (NS.FSLoaderHelpers.isData(pStrType)) {
                return NS.FSLoaderHelpers.LOAD_AS_XHR;
            } else {
                //if its TAG (js, css, svg)
                return NS.FSLoaderHelpers.LOAD_AS_TAGS;
            }
        }
    };

    /**
     * Generate the element TAG based on file type
     * @private
     * @param pStrType The string containing the file type
     * @param pStrPath Path for loading
     * @return {Element} The created element
     */
    proto.generateTagByType = function (pStrType, pStrPath) {
        "use strict";
        switch (pStrType) {
            case NS.FSLoaderHelpers.TYPE_CSS:
                return this.createCssTag(pStrPath);
            case NS.FSLoaderHelpers.TYPE_JAVASCRIPT:
                return this.createJavascriptTag(pStrPath);
            case NS.FSLoaderHelpers.TYPE_IMAGE:
                return this.createImageTag(pStrPath);
            case NS.FSLoaderHelpers.TYPE_SVG:
                return this.createSVGTag(pStrPath);
            case NS.FSLoaderHelpers.TYPE_SOUND:
                return this.createSoundTag(pStrPath);
        }
    };

    /**
     * Get file type based on his extension's path
     * @private
     * @param pStrPath The URL path
     * @return {String} The file type for loading, based on file extension and recognized file types for loading
     */
    proto.getFileType = function (pStrPath) {
        "use strict";
        var strExtension = NS.FSLoaderHelpers.getFileExtension(pStrPath);

        switch (strExtension) {
            case "ogg":
            case "mp3":
            case "wav":
                return NS.FSLoaderHelpers.TYPE_SOUND;
            case "jpeg":
            case "jpg":
            case "gif":
            case "png":
                return NS.FSLoaderHelpers.TYPE_IMAGE;
            case "json":
                return NS.FSLoaderHelpers.TYPE_JSON;
            case "xml":
                return NS.FSLoaderHelpers.TYPE_XML;
            case "css":
                return NS.FSLoaderHelpers.TYPE_CSS;
            case "js":
                return NS.FSLoaderHelpers.TYPE_JAVASCRIPT;
            case 'svg':
                return NS.FSLoaderHelpers.TYPE_SVG;
            default:
                return NS.FSLoaderHelpers.TYPE_TEXT;
        }
    };

    /**
     * Helper method for creating a script tag
     * @param {String} pStrPath
     * @return {Element}
     */
    proto.createJavascriptTag = function (pStrPath) {
        "use strict";
        var elScript = document.createElement("script");

        //setup element
        elScript.setAttribute("type", "text/javascript");
        elScript.setAttribute("src", pStrPath);

        return elScript;
    };

    /**
     * Helper method for creating a SVG object tag
     * @param pStrPath
     * @return {Element}
     */
    proto.createSVGTag = function (pStrPath) {
        "use strict";
        var elScript = document.createElement("object");

        //setup element
        elScript.setAttribute("type", "image/svg+xml");
        elScript.setAttribute("src", pStrPath);

        return elScript;
    };

    proto.createSoundTag = function (pStrPath) {
        "use strict";
        var elScript = document.createElement("audio");

        //setup element
        elScript.setAttribute("type", "audio/ogg");
        elScript.setAttribute("src", pStrPath);

        return elScript;
    };

    proto.createCssTag = function (pStrPath) {
        "use strict";
        var elScript = document.createElement("link");
        //setup element
        elScript.setAttribute("rel", "stylesheet");
        elScript.setAttribute("type", "text/css");
        elScript.setAttribute("href", pStrPath);

        return elScript;
    };

    proto.createImageTag = function (pStrPath) {
        "use strict";
        var elScript = document.createElement("img");

        //setup element
        elScript.setAttribute("src", pStrPath);

        return elScript;
    };

    proto.executeLoad = function (pFSLoaderItem) {
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
        if (pFSLoaderItem.loadingType === NS.FSLoaderHelpers.LOAD_AS_TAGS) {

            //load as tags
            var elScript = this.generateTagByType(pFSLoaderItem.type, this.evaluateURL(pFSLoaderItem.path, pFSLoaderItem.preventCache));

            pFSLoaderItem.element = elScript;

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

        } else if (pFSLoaderItem.loadingType === NS.FSLoaderHelpers.LOAD_AS_XHR || (pFSLoaderItem.loadingType === NS.FSLoaderHelpers.LOAD_AS_BLOB || pFSLoaderItem.loadingType === NS.FSLoaderHelpers.LOAD_AS_ARRAY_BUFFER)) {

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
            if (pFSLoaderItem.type === NS.FSLoaderHelpers.TYPE_TEXT &&  this.currentRequest.overrideMimeType) {
                this.currentRequest.overrideMimeType('text/plain; charset=x-user-defined');
            }

            //load the XHR
            this.currentRequest.open(pFSLoaderItem.method, this.evaluateURL(pFSLoaderItem.path, pFSLoaderItem.preventCache), true);
            this.currentRequest.send();

            //if xhr2 is supported and the file is binary
            if (NS.FSLoaderHelpers.isBinary(pFSLoaderItem.type) && NS.FSLoaderHelpers.isXHR2Supported()) {
                if (pFSLoaderItem.loadingType === NS.FSLoaderHelpers.LOAD_AS_BLOB) {
                    //if is Blob
                    this.currentRequest.responseType = 'blob';
                } else if (pFSLoaderItem.loadingType === NS.FSLoaderHelpers.LOAD_AS_ARRAY_BUFFER) {
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
    };

    //returns a FSLoaderItem configured
    proto.generateLoaderItem = function (pStrPath, pObjOptions) {
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
    };

    //function to remove listeners from the current element
    proto.removeEventsFromElement = function (pEl) {
        "use strict";
        pEl.removeEventListener('load', this.onItemLoadComplete);
        pEl.removeEventListener('error', this.onItemLoadError);
        pEl.removeEventListener('progress', this.onItemLoadProgress);
    };

    //INTERNAL EVENTS

    //internal event on complete
    proto.onItemLoadComplete = function (event) {
        "use strict";
        this.state = NS.FSLoaderHelpers.STATE_FINISHED;
        this.progress = 100;
        if (this.reference.loadingType === NS.FSLoaderHelpers.LOAD_AS_BLOB || this.reference.loadingType === NS.FSLoaderHelpers.LOAD_AS_XHR) {
            //this.data =
            this.element = event.currentTarget;
        }

        //assign return data by type
        if (this.loadingType === NS.FSLoaderHelpers.LOAD_AS_TAGS) {
            this.data = this.element;
        } else if (this.loadingType === NS.FSLoaderHelpers.LOAD_AS_XHR) {
            this.data = event.currentTarget.response;
        } else if (this.loadingType === NS.FSLoaderHelpers.LOAD_AS_BLOB || this.loadingType === NS.FSLoaderHelpers.LOAD_AS_ARRAY_BUFFER) {
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
    };

    //internal event on error
    proto.onItemLoadProgress = function (event) {
        "use strict";
        //prevent blank
        if (event.loaded > 0 && event.total === 0) {
            return;
        }
        //assign
        this.state = NS.FSLoaderHelpers.STATE_LOADING;
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
    };

    //internal event on error
    proto.onItemLoadError = function (event) {
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
            this.state = NS.FSLoaderHelpers.STATE_ERROR;

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
    };

} (F_NAMESPACE));
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

(function(pNamespace) {
    "use strict";

    var NS = pNamespace;

    /**
     * Manage and load a queue of loadable items
     * @class FSLoaderQueue
     * @extends FSLoader
     * @constructor
     * @param {Object} [pObjDefaultOptions]
     * @param {String} [pObjDefaultOptions.id] An ID for the QUEUE
     * @param {Boolean} [pObjDefaultOptions.preventCache]
     * @param {DOMElement} [pObjDefaultOptions.container]
     * @param {Boolean} [pObjDefaultOptions.ignoreErrors=true]
     * @param {Function} [pObjDefaultOptions.onitemstart]
     * @param {Array} [pObjDefaultOptions.onitemstartparams]
     * @param {Function} [pObjDefaultOptions.onitemerror]
     * @param {Array} [pObjDefaultOptions.onitemerrorparams]
     * @param {Function} [pObjDefaultOptions.onitemcomplete]
     * @param {Array} [pObjDefaultOptions.onitemcompleteparams]
     * @param {Function} [pObjDefaultOptions.onqueueerror]
     * @param {Array} [pObjDefaultOptions.onqueueerrorparams]
     * @param {Function} [pObjDefaultOptions.onqueuecomplete]
     * @param {Array} [pObjDefaultOptions.onqueuecompleteparams]
     * @param {Function} [pObjDefaultOptions.onqueueprogress]
     * @param {Array} [pObjDefaultOptions.onqueueprogressparams]
     */
    NS.FSLoaderQueue = function (pObjDefaultOptions) {
        "use strict";

        this.reference = new NS.FSLoader(pObjDefaultOptions);

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

        NS.FSLoader.call(this, pObjDefaultOptions);
    };

    //Inherits
    if (NS.FSLoader !== undefined) {
        NS.FSLoaderQueue.prototype = new NS.FSLoader;
        NS.FSLoaderQueue.constructor = NS.FSLoaderQueue;
    } else {
        NS.FSLoaderQueue = undefined;
        throw new Error("FSLoaderQueue needs FSLoader for work.");
    }

    var proto = NS.FSLoaderQueue.prototype;

    /**
     * Add an element to the queue
     * @param {String} pPaths
     * @param {Object} [pObjOptions]
     * @param {Object} [pObjOptions]
     * @param {String} [pObjOptions.id] An ID for easy get the current item
     * @param {Boolean} [pObjOptions.preventCache = false]
     * @param {String} [pObjOptions.type = "auto"]  FSLoaderHelpers.TYPE_JAVASCRIPT, FSLoaderHelpers.TYPE_CSS, FSLoaderHelpers.TYPE_IMAGE, FSLoaderHelpers.TYPE_SOUND, FSLoaderHelpers.TYPE_JSON, FSLoaderHelpers.TYPE_XML, FSLoaderHelpers.TYPE_SVG, FSLoaderHelpers.TYPE_TEXT
     * @param {String} [pObjOptions.loadingType = "tag"] FSLoaderHelpers.LOAD_AS_TAGS, LOAD_AS_XHR, FSLoaderHelpers.LOAD_AS_BLOB and LOAD_AS_ARRAY_BUFFER
     * @param {String} [pObjOptions.method] POST OR GET
     * @param {Function} [pObjOptions.onstart]
     * @param {Array} [pObjOptions.onstartparams]
     * @param {Function} [pObjOptions.onerror]
     * @param {Array} [pObjOptions.onerrorparams]
     * @param {Function} [pObjOptions.oncomplete]
     * @param {Array} [pObjOptions.oncompleteparams]
     */
    proto.add = function (pPaths, pObjOptions) { //onqueueerror,onqueuecomplete,onqueueprogress
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

    /**
     * Start loading the queue
     */
    proto.start = function () {
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

    /**
     * Pauses the queue
     * //TODO:Develop
     */
    proto.pause = function () {
        "use strict";
        this.isPaused = true;
        //this.currentItem.stop();
    };

    /**
     * Go to next item
     * @private
     */
    proto.next = function () {
        this.currentIndex++;
        this.start();
    };

    /**
     * Goto previous item
     * @private
     */
    proto.previous = function () {
        this.currentIndex--;
        this.start();
    };

    /**
     * Verify if the queue index has reached the end
     * @protected
     * @private
     * @return {Boolean}
     */
    proto.verifyQueueEnd = function () {
        if (this.currentIndex < (this.total - 1)) {
            return true;
        } else {
            return false;
        }
    };

    /**
     * Internal event for queue load complete
     * @event
     * @private
     * @protected
     * @param pItem
     */
    proto.onQueueItemComplete = function (pItem) {

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

    /**
     * Internal event for queue load error
     * @event
     * @private
     * @protected
     * @param pItem
     */
    proto.onQueueItemError = function (pItem) {

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

    /**
     * Internal event for queue load progress
     * @event
     * @private
     * @protected
     * @param pItem
     */
    proto.onQueueItemProgress = function (pItem) {
        //trigger the single item event
        this.updateQueueProgress();
    };

    /**
     * Internal event for queue load start
     * @event
     * @private
     * @protected
     * @param pItem
     */
    proto.onQueueItemStart = function (pItem) {
        this.triggerCallbackEvent("onitemstart", pItem);
    };

    /**
     * Verifies and count the current queue progress
     * @private
     * @protected
     */
    proto.updateQueueProgress = function () {
        var numTotalProgress = 0;

        for (var i = 0; i < this.items.length; i++) {
            numTotalProgress += this.items[i].progress;
        }

        this.progress = Math.round((numTotalProgress*100) / (100*this.items.length)); //calculate progress based on loaded items progress
        //item and queue both progress on the same time
        this.triggerCallbackEvent("onitemprogress");
        this.triggerCallbackEvent("onqueueprogress");
    };

    /**
     * Helper method for trigger the user's binded events
     * @protected
     * @private
     * @param pStrEventID
     * @param pDefinedSource
     */
    proto.triggerCallbackEvent = function (pStrEventID, pDefinedSource) {
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
    };

} (F_NAMESPACE));/*
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

/*
WARNINGS:
    - Set FSPreloader tag after the tags that you want do load with data-preload="true" when not using DOM ready event
    - Cross-domain stylesheets cssRules being null
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

(function(pNamespace) {
    "use strict";

    var NS = pNamespace;

    /**
     * Set a parsed queue for preloading page elements
     * @class FSPreloader
     * @extends FSLoaderQueue
     * @constructor
     * @param {Object} [pObjDefaultOptions]
     * @param {String} [pObjDefaultOptions.id] An ID for the QUEUE
     * @param {Boolean} [pObjDefaultOptions.preventCache]
     * @param {DOMElement} [pObjDefaultOptions.container]
     * @param {Boolean} [pObjDefaultOptions.ignoreErrors=true]
     * @param {Function} [pObjDefaultOptions.onitemstart]
     * @param {Array} [pObjDefaultOptions.onitemstartparams]
     * @param {Function} [pObjDefaultOptions.onitemerror]
     * @param {Array} [pObjDefaultOptions.onitemerrorparams]
     * @param {Function} [pObjDefaultOptions.onitemcomplete]
     * @param {Array} [pObjDefaultOptions.onitemcompleteparams]
     * @param {Function} [pObjDefaultOptions.onqueueerror]
     * @param {Array} [pObjDefaultOptions.onqueueerrorparams]
     * @param {Function} [pObjDefaultOptions.onqueuecomplete]
     * @param {Array} [pObjDefaultOptions.onqueuecompleteparams]
     * @param {Function} [pObjDefaultOptions.onqueueprogress]
     * @param {Array} [pObjDefaultOptions.onqueueprogressparams]
     */
    NS.FSPreloader = function (pObjDefaultOptions) {
        this.container = document;
        this.elements = [];
        this.cssElements = [];

        NS.FSLoaderQueue.call(this, pObjDefaultOptions);
    };

    //Inherits
    if (NS.FSLoaderQueue !== undefined) {
        NS.FSPreloader.prototype = new NS.FSLoaderQueue;
        NS.FSPreloader.prototype.constructor = NS.FSLoaderQueue;
    } else {
        NS.FSPreloader = undefined;
        throw new Error("FSPreloader needs FSLoaderQueue to work.");
    }

    var proto = NS.FSPreloader.prototype;

    /**
     * The addition
     * @param pCssElements
     */
    proto.parseCss = function (pCssElements) {
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
                    this.add(NS.FSLoaderHelpers.findRule(list, "backgroundImage"));
                }
            }
        }
    };

    /**
     * Method for FSPreloader parse the current document and load elements
     * @param {Object} [pObjOptions]
     * @param {Boolean} [pObjOptions.cssDependencies] If you want the preloader parse the images on Css to load
     */
    proto.parseDocument = function (pObjOptions) { //css:true|false

        //IMGS
        //var imageList = document.getElementsByTagName("img");

        //Parse elements to be preloaded
        this.elements = document.querySelectorAll('[data-preload="true"]');
        var total = this.elements.length;
        var currentEl,
            i;

        //add loadable identified elements
        for (i = 0; i < total; i++) {
            currentEl = NS.FSLoaderHelpers.identifyTagType(this.elements[i]);

            if (currentEl.type === NS.FSLoaderHelpers.TYPE_CSS) {
                //if it is a CSS, put on CSS parse list to load embeded images
                this.cssElements.push(currentEl.tag.sheet);
            } else if (currentEl.type === NS.FSLoaderHelpers.TYPE_IMAGE) {
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

    };

} (F_NAMESPACE));

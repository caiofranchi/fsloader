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

    //get element by id
    proto.get = function (pValue) {
        "use strict";
        return this.getElementByAttribute("id", pValue);
    };

    //get element by attribute
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

    proto.createJavascriptTag = function (pStrPath) {
        "use strict";
        var elScript = document.createElement("script");

        //setup element
        elScript.setAttribute("type", "text/javascript");
        elScript.setAttribute("src", pStrPath);

        return elScript;
    };

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

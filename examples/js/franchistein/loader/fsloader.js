/**
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

    //returns the file type for loading, based on file extension and recognized file types for loading
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
};
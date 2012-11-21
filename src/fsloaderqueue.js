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

} (F_NAMESPACE));
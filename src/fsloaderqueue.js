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

    proto.pause = function () {
        "use strict";
        this.isPaused = true;
        //this.currentItem.stop();
    };

    proto.next = function () {
        this.currentIndex++;
        this.start();
    }

    proto.previous = function () {
        this.currentIndex--;
        this.start();
    }

    proto.verifyQueueEnd = function () {
        if (this.currentIndex < (this.total - 1)) {
            return true;
        } else {
            return false;
        }
    }

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

    proto.onQueueItemProgress = function (pItem) {
        //trigger the single item event
        this.updateQueueProgress();
    };

    proto.onQueueItemStart = function (pItem) {
        this.triggerCallbackEvent("onitemstart", pItem);
    };

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
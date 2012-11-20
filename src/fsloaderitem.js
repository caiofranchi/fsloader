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
     * Single LoaderItem for registering data of each loadable element
     * @author <a href="http://caiofranchi.com.br">Caio Franchi</a>
     * @protected
     * @class FSLoaderItem
     * @constructor
     * @param {FSLoader} pRef The FSLoader owner of this item
     * @param {String} pStrPath The path for loading
     * @param {Object} pObjOptions Options for this individual loading
     * @constructor
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

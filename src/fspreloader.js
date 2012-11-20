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

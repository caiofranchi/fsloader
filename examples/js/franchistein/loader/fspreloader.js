/**
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
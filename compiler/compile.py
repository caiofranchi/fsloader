#!/usr/bin/env python

# THIS IS A SIMPLE SCRIPT FOR COMPILING THE FSLOADER LIB #
# FEEL FREE TO CUSTOMIZE AS YOU NEED #

import http.client
from urllib.parse import urlencode
import sys
import subprocess

# Define the parameters for the POST request and encode them in
# a URL-safe format.


# FIRST ARG VALUE #
#complete
#single-loader
#queue-loader
#preloader


# SECOND ARG VALUE #
#with-docs

if len(sys.argv) < 2:
    sys.exit('Usage: %s [complete, single-loader, queue-loader, preloader] with-docs' % sys.argv[0])
else:
    optModules = sys.argv[1]

    filteredModules = []

    #list the archives by type of compilation
    if optModules == 'complete':
        filteredModules = ['fsloaderhelpers.js', 'fsloaderitem.js' , 'fsloader.js', 'fsloaderqueue.js', 'fspreloader.js']
    elif optModules == 'single-loader':
        filteredModules = ['fsloaderhelpers.js', 'fsloaderitem.js' , 'fsloader.js']
    elif optModules == 'queue-loader':
        filteredModules = ['fsloaderhelpers.js', 'fsloaderitem.js' , 'fsloader.js', 'fsloaderqueue.js']
    elif optModules == 'preloader':
        filteredModules = ['fsloaderhelpers.js', 'fsloaderitem.js' , 'fsloader.js', 'fsloaderqueue.js', 'fspreloader.js']


# RE-GEN JS DOCS
    if len(sys.argv)  == 3 :
        if sys.argv[2] == 'with-docs':
            subprocess.call('cd jsdocs/ & jsdoc ../../src/ -d ../../docs/ --recurse --verbose', shell=True);

#reading the .js archives
archives = []
for w in filteredModules:
    response = open("../src/" + w, "r")
    archives.append(response.read());

params = urlencode([
    ('js_code', ''.join(archives)),
    ('compilation_level', 'SIMPLE_OPTIMIZATIONS'),
    ('output_format', 'text'),
    ('output_info', 'compiled_code'),
])


#params = urlencode([
#    ('code_url', 'https://raw.github.com/caiofranchi/FranchisteinJS/master/js/franchistein/loader/fsloaderhelpers.js'),
#    ('code_url', 'https://raw.github.com/caiofranchi/FranchisteinJS/master/js/franchistein/loader/fsloader.js'),
#    ('code_url', 'https://raw.github.com/caiofranchi/FranchisteinJS/master/js/franchistein/loader/fsloaderitem.js'),
#    ('code_url', 'https://raw.github.com/caiofranchi/FranchisteinJS/master/js/franchistein/loader/fsloaderqueue.js'),
#    ('code_url', 'https://raw.github.com/caiofranchi/FranchisteinJS/master/js/franchistein/loader/fspreloader.js'),
#    ('compilation_level', 'SIMPLE_OPTIMIZATIONS'),
#    ('output_format', 'text'),
#    ('output_info', 'compiled_code'),
#  ])

# Send to Google Closure Compiler
headers = { "Content-type": "application/x-www-form-urlencoded" }
conn = http.client.HTTPConnection('closure-compiler.appspot.com')
conn.request('POST', '/compile', params, headers)
response = conn.getresponse()
data = response.read()

#minimified
text_file = open("../build/fsloader-0.1.min.js", "w")
text_file.write(data.decode("utf-8"))
text_file.close()

#
text_file_complete = open("../build/fsloader-0.1.js", "w")
text_file_complete.write(''.join(archives))
text_file_complete.close()
conn.close





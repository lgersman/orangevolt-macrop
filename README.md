[![Build status](https://travis-ci.org/lgersman/orangevolt-docp.png?branch=master)](https://travis-ci.org/lgersman/orangevolt-macrop) 
[![Dependency status](https://gemnasium.com/lgersman/orangevolt-docp.png)](https://gemnasium.com/lgersman/orangevolt-macrop)
[![NPM version](https://badge.fury.io/js/orangevolt-macrop.png)]

**[orangevolt-macrop]** provides a [NPM] module **and** browser script suitable for parsing extended [Creole Wiki generic extension elements](http://wikicreole.org/wiki/GenericExtensionElementProposal) (the *"Double-less-than-greater-than"* notation to be concrete). 

**[orangevolt-macrop]** is more or less a fully configurable macro processor ... thats why it's named **macrop** :-)

# What is it good for ?

When generating HTML (or even text) you can utilize **[orangevolt-macrop]** to inject *something* using macros, no matter what kind of source text you use ([Markdown], [gfm] or just HTML).

The package provides an [API](#api) to parse text and a higher level method to encapsulate the parser and your macros.

# [Creole Wiki generic extension element syntax](http://wikicreole.org/wiki/GenericExtensionElementProposal)

**[orangevolt-macrop]** recognizes [Creole Wiki generic extension element syntax](http://wikicreole.org/wiki/GenericExtensionElementProposal) including a few extras. [Creole Wiki generic extension element](http://wikicreole.org/wiki/GenericExtensionElementProposal) is basically a bit like html but with doubled **<<** and **>>** characters:

An example:
````
hello,
<<mymacro foo bar="mee" john=doe/>>

One more (abstruse) example : 
<<ext-tool:jsdoc foo:sourcemy:foo foo-bar="mee" data-john=doe>>
<</ext-tool:jsdoc>>

That's it !
````

**[orangevolt-macrop]** [API](#api) method ``parse( input)`` will split the input into strings and parsed macro objects :

````javascript
[ 
	"hello,\n", 
	{ 
		name : "mymacro", 
		namespace : "",
		attributes : { 
			foo : true, 
			bar :"mee",
			john : "doe"
		},
		source : "<<mymacro foo bar=\"mee\" john=doe/>>"
		contents : ""
	},
	"\n\nThat's it !\n"
]
````
You can apply macros by simply iterating over the returned array and process the array contents.

a more complex example incorporating macro namespaces : 

````
sadsadsaa

<<ns1-ns2:ns3:too 
  co-al-foo 
  ns1-ns2:ns3:bar="JOHN DOE" 
  content="
    take it from a 
    multiline attribute
  "
>>
  before
  <<source foo='bar' />>
  between
  <<rendered target="html"/>>
  after
<</ns1-ns2:ns3:too>>
        
whats up ?

````

will be parsed into 

````javascript
[
  "sadsadsaa\n\n",
  {
    "source": "<<ns1-ns2:ns3:too \n  co-al-foo \n  ns1-ns2:ns3:bar=\"JOHN DOE\" \n  content=\"\n    take it from a \n    multiline attribute\n  \"\n>>\n  before\n  <<source foo='bar' />>\n  between\n  <<rendered target=\"html\"/>>\n  after\n<</ns1-ns2:ns3:too>>",
    "namespace": "ns1-ns2:ns3:",
    "name": "too",
    "attributes": {
      "co-al-foo": true,
      "ns1-ns2:ns3:bar": "JOHN DOE",
      "content": "    take it from a \n    multiline attribute"
    },
    "content": "  before\n  <<source foo='bar' />>\n  between\n  <<rendered target=\"html\"/>>\n  after"
  },
  "\n        \nwhats up ?\n    "
]

````

Macros with namespace will be split into **namespace** and **name** where as attributes will no be split off (-> it's up to you).

They can be nested (when using different names for the nested macros) by recursively call the ``parse( input)`` method on ``node.content`` 

# Requirements

**[orangevolt-macrop]** has no dependencies.

# Installation

* [NodeJS]

	``$ npm install orangevolt-macrop``

* Browser

	Link ``orangevolt-macrop.js`` source file via **SCRIPT** tag into your browser.

# Features

* Macros can be nested (when using different names for the nested macros) by recursively call the ``parse( input)`` method on ``macro.content`` 
* Attributes names may contain ``:`` and ``-`` (execpt at start and end)
* Attributes without a value (like *foo* in the example) are intepreted as flags and will have value ``true`` applied
* Attributes values may be wrapped in ``'``, ``"`` or simply provided as a token 
* Macro names can be namespaced using ``:`` and/or ``-``. The namespace is just informative and will not be taken into account for evaluating the right macro.
* Attribute values are allowed to be multiline
* Empty attribute values ( those only containing \r\n or \s) will be ''
* [API](#api) method ``orangevolt.macrop( {})()`` A **catch all** macro can be applied using the macro name __*__ 

# API

## [NodeJs]

Assuming that you've already installed the **[orangevolt-macrop]** package you can access the API using 

````
var macrop = require( './orangevolt-macrop.js').orangevolt.macrop;
````

## Browser

Include **[orangevolt-macrop]** in your web page :

````
<script type="text/javascript" src="orangevolt-macrop.js"></script>
````

Now you can access the API using 

``var macrop = window.orangevolt.macrop;``

## orangevolt.macrop

The package provides 3 functions : 

* ``orangevolt.macrop.parse( input)``

	Parses the input and returns an mixed array of strings and **objects** (-> macros)

* ``orangevolt.macrop.process( /*parse output*/ nodes, /*macros*/ { ... }, /*optional options*/ { ... })``
	
	Processes the output of ``orangevolt.macrop.parse( input)`` using macros and return the resulting array.

	* input   : the input string to parse
	* macros  : an object providing macros
	* options : an optional **object** transporting options to your macros

	Example :

	````javascript
	var macros = {
		mymacro : function( node, i) {
			/* 
				node = {
					name : ..., 
					namespace : ..., 
					attributes : { ...}, 
					content : ...,
					...
				) -> the node parsed by macrop

				i = the index of the node in the nodes argument of process(...)

				this = {
					result : [],	// the resulting array
					nodes  : [],	// the nodes argument of process()
					macros : {},	// the macros argument
					options: {}}	// the options argument
				}
			*/

			// do something here with the node data
			// and return what you want to see in the array returned by process( ... )
		}
	}
	orangevolt.macrop.process( nodes, macros)
	````
	Fallback macro : If you provide a macro with key '__*__' it will be called when ever no macro with ``node.name`` was found.

* ``orangevolt.macrop( /*macros*/ { ... }, /*optional options*/ { ... })``

	Can be used to create a function encapsulating the parse/process call utilizing macros and options

	Example : 
	````javascript
	var macros = {
		...
	};

		// generate a pre configured macrop processor 
	var processor = orangevolt.macrop( macros, {});

		// processor will parse and process the input using the given macros and options
	processor( input);
	````

# Development

Clone the package from [orangevolt-macrop] 

````
git clone git@github.com:lgersman/orangevolt-macrop.git
````

Start hacking, your help is appreciated. :-)

You can execute 
````
grunt dev
````
to see the tests running utilizing [gruntjs live-reload feature](https://github.com/gruntjs/grunt-contrib-watch#optionslivereload) in your browser.

## Caveats

When ``grunt dev`` aborts with **Fatal error: watch ENOSPC** message you're system is getting out of 
inotify watche handles. 

Go to the terminal and enter 

````
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p
````
to increase inotify watche handles (See http://stackoverflow.com/questions/16748737/grunt-watch-error-waiting-fatal-error-watch-enospc).

# Testing

* [NodeJS] 
	
``$ npm test`` or ``$ grunt test``

* Browser

``$ grunt dev`` 

Navigate in the opened browser window to folder ``spec`` (``http://localhost:9090/spec/``)

# License

**[orangevolt-macrop]** is dual licensed under

* [MIT](http://www.opensource.org/licenses/MIT)
* [GPL2](http://www.opensource.org/licenses/GPL-2.0)

[NPM]: 			https://npmjs.org/ 
[NodeJs]:		http://nodejs.org/
[gfm]: 			http://github.github.com/github-flavored-markdown/ "Github Flavored Markdown"
[Markdown]:	 	http://daringfireball.net/projects/markdown/syntax
[LiveReload]: 	http://livereload.com/
[Grunt]: 		http://gruntjs.com/ "GruntJS"
[orangevolt-macrop]:		https://github.com/lgersman/orangevolt-macrop "Orangevolt Macrop"
[orangevolt-docp]:			https://github.com/lgersman/orangevolt-docp "Orangevolt Docp"
[GitHub]:		https://github.com/

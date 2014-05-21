/*
 * Orangevolt Macrop processor implementing creole style extension parsing
 *
 * http://github.com/lgersman
 * http://www.orangevolt.com
 *
 * Copyright 2013, Lars Gersmann <lars.gersmann@gmail.com>
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */

;(function( ov, context) {

	var TAG_REGEXP = /<<(\/?)((\w+[\:\-])*(\w+))((\s+((\w|\!|\:|\-|\w[\w-]*\w)+)(\s*=\s*(?:\"[^\"]*?\"|'[^\']*?'|[^'\">\s]+))?)+\s*|\s*)(\/?)>>/i,
		ATTR_REGEX = /(\!?(\w|\:|\-|\w[\w-]*\w)+)(\s*=\s*(?:\"([^\"]*?)\"|'([^\']*?)'|([^'\">\s]+)))?/i
	;

		/**
		 * parse the attribute string
		 *
		 * @param  {string} input the attribute string
		 * @return {object} Object representing the string
		 */
	function parseAttributes( input) {
		var attrs = {},
			match
		;
		debugger
		while( match = input.match( ATTR_REGEX)) {
				// adjust import
			input = input.substring( match.index + match[0].length);
			var negotiate 	= match[ 1][0]=='!',
				name		= match[ 1].substr( negotiate ? 1 : 0),
				val			= match[ 4]!=null || match[ 5]!=null || match[ 6]!=null ?
					(match[ 4] || match[ 5] || match[ 6] || "").replace(/^[\r\n]+|\s+$/g, '')
					: (negotiate ? false : true)
			;

			if( name in attrs) {
				attrs[ name] = (Array.isArray( attrs[ name]) ? attrs[ name] : [ attrs[ name]]);
				attrs[ name].push( val);
			} else {
				attrs[ name] = val;
			}
		}

		return attrs;
	}

		/**
		 * parse a string into an ast
		 *
		 * @param  {string} the string to parse
		 * @return {array}  Array of strings (non macro text) and objects representing the parsed macros
		 */
	function parse( input) {
		var nodes = [],
			match
		;

		input = input || '';

		while( match = input.match( TAG_REGEXP)) {
			var node = {
				source		: match[0],
				namespace   : match[2] || '',
				name		: match[4],
				attributes	: parseAttributes( match[5]),
				content		: ''
			};

				// strip name from namespace
			if( node.namespace.length) {
				node.namespace = node.namespace.substring( 0, node.namespace.length - node.name.length);
			}

				// push text before macro
			nodes.push( input.substring( 0, match.index));
				// adjust input
			input = input.substring( match.index + match[0].length);

				// if macro has end tag
			if( !match[10]) {
					// scan for end tag
				match = input.match( new RegExp( '<<\/' + (node.namespace + node.name).replace( /\:/g, '\\:').replace( /\-/g, '\\-') + '>>'));
				if( match) {
					var content = input.substr( 0, match.index);
					node.source += content;

						// strip leading / trailing \r\n
					node.content = content.replace(/^[\r\n]+|\s+$/g, '');
						// adjust input
					input = input.substr( match.index + match[ 0].length);
				} else {
					node.content = input;
					input='';
				}

				node.source += (match && match[0] || '');
			}

			nodes.push( node);
		}

		input && nodes.push( input);

		return nodes;
	}

		/**
		 * process the nodes provided as argument and return the processed output.
		 * if an macro with no matching pendant in macros was found, the fallback macro handler get called.
		 *
		 * @param  {array} nodes array of string and objects returned by the parse function
		 * @param  {object} macros object with keys naming the supported macros and functions handling the macros processing
		 * if macros has a property '*' the function value will be taken as fallback for unknown macros.
		 * if no fallback macro handle was provided the default macro handler will be be called (which will throw an exeption)
		 * @param {object} options additional prosessing options
		 *
		 * @return {array} the processing result
		 *
		 * @see parse
		 */
	function process( nodes, macros, options) {
		if( !macros['*']) {
			macros['*'] = function( node, index) {
				throw new Error( 'No macro "' + node.name + '" found');
			};
		}

		options = options || {};

		var result	= [],
			context = {
				result : result,
				nodes  : nodes,
				macros : macros,
				options: options
			}
		;

		for( var i=0; i<nodes.length; i++) {
			var node = nodes[i];

			if( typeof( node)=='string') {
				result.push( node);
			} else {
				var macroFn = macros[ node.name] || macros[ '*'];
				result.push( macroFn.call( context, node, i));
			}
		}

		return result;
	}

		/**
		 * creates a reusable function encapsuulating the given macros and the parse/process chain
		 *
		 * @param  {object} macros object with keys naming the supported macros and functions handling the macros processing
		 * if macros has a property '*' the function value will be taken as fallback for unknown macros.
		 * if no fallback macro handle was provided the default macro handler will be be called (which will throw an exeption)
		 * @param {object} options additional prosessing options
		 *
		 * @return {array}
		 *
		 * @see process
		 */
	ov.macrop = function( macros, options) {
		return function( input) {
			return process( parse( input), macros, options);
		};
	};
	ov.macrop.parse = parse;
	ov.macrop.process = process;

	context.orangevolt = ov;
})(
	((typeof( require)=='function' && {}) || (typeof( window)=='object' && window.orangevolt)) || {},
	(typeof( require)=='function' && module.exports) || (typeof( window)=='object' && window)
);
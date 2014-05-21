###
Orangevolt Ampere Framework

http://github.com/lgersman
http://www.orangevolt.com

Copyright 2013, Lars Gersmann <lars.gersmann@gmail.com>
Dual licensed under the MIT or GPL Version 2 licenses.
###
 
(( ov) ->
	describe "orangevolt-macrop", ->
		describe "orangevolt.macrop.parse()", ->
			it "start/end tag", ->
				s = """
					before html
					<<tag attr1="val1" attr2=val2_1 attr2="val2_2" attr3 !attr4>>
					inside
					content
					<</tag>>
					after html
				"""
				r = ov.macrop.parse s

				expect( r).toBeDefined
				expect( r.length).toEqual 3

				expect( r[0]).toEqual 'before html\n'

				expect( typeof r[1]).toEqual 'object'
				expect( r[1].content).toEqual 'inside\ncontent'
				expect( r[1].name).toEqual 'tag'
				
				expect( Object.keys r[1].attributes).toEqual ['attr1', 'attr2', 'attr3', 'attr4']
				expect( r[1].attributes.attr1).toEqual 'val1'
				expect( r[1].attributes.attr2).toEqual [ 'val2_1', 'val2_2']
				expect( r[1].attributes.attr3).toEqual true
				expect( r[1].attributes.attr4).toEqual false

				expect( r[2]).toEqual '\nafter html'

			it "single tag", ->
				s = """
					before html
					<<tag attr1="val1" attr2=val2_1 attr2="val2_2" attr3/>>
					after html
				"""
				r = ov.macrop.parse s

				expect( r).toBeDefined
				expect( r.length).toEqual 3
				expect( r[0]).toEqual 'before html\n'
				expect( typeof r[1]).toEqual 'object'
				expect( r[2]).toEqual '\nafter html'

			it "multiple tags", ->
				r = ov.macrop.parse """
					before
					<<tag 
						attr1="val1" 
						attr2=val2_1 
						attr2="val2_2" 
						attr3
					>>
					inside
					content
					<</tag>>
					after
					<<othertag 
						attr1 ="

						multi
						line
						value
						" 
						attr2 = val2_1 
						attr2= 'val2_2'
						attr3/>>
					end
				"""

				expect( r).toBeDefined
				expect( r.length).toEqual 5
				
				expect( r[0]).toEqual 'before\n'
				expect( typeof r[1]).toEqual 'object'
				expect( r[2]).toEqual '\nafter\n'
				expect( typeof r[3]).toEqual 'object'
				expect( r[3].attributes.attr1).toEqual '\tmulti\n\tline\n\tvalue'

				expect( r[4]).toEqual '\nend'

		describe "orangevolt.macrop.process()", ->
			it "process() single tag", ->
				attr1_val = 'val1';
				s = """
					before html
					<<simple attr1="#{attr1_val}"/>>
					after html
				"""

				hits = []
				r = ov.macrop.process ov.macrop.parse( s), 
					simple : (node, index)->
						hits.push node

					# assert that simple was executed once
				expect( hits.length).toEqual 1
				expect( hits[0].attributes.attr1).toEqual 'val1'

			it "process() multiple tags", ->
				attr1_val = 'val1';
				s = """
					before html
					<<simple attr1="#{attr1_val}"/>>
					after html
					<<simple attr1="#{attr1_val}_2">>
					<</simple>>
				"""

				hits = []
				r = ov.macrop.process ov.macrop.parse( s), 
					simple : (node, index)->
						hits.push node

					# assert that simple was executed twice
				expect( hits.length).toEqual 2
				expect( hits[0].attributes.attr1).toEqual 'val1'
				expect( hits[1].attributes.attr1).toEqual 'val1_2'

			it "process() with unhandled tag", ->
				attr1_val = 'val1';
				s = """
					before html
					<<simple attr1="#{attr1_val}"/>>
					after html
					<<mee attr1="#{attr1_val}_2">>
					<</mee>>
				"""

				hits = []

				expect( ->
					r = ov.macrop.process ov.macrop.parse( s), 
						simple : (node, index)->
							hits.push node
				).toThrow() 

			it "process() with wildcard handler", ->
				s = """
					before html
					<<simple/>>
					after html
					<<mee>>
					<</mee>>
				"""

				hits = []
				wildcardHits = []
				r = ov.macrop.process ov.macrop.parse( s), 
					simple	: (node, index)->
						hits.push node
					'*'		: (node, index)->
						wildcardHits.push node	

				expect( hits.length).toEqual 1
				expect( wildcardHits.length).toEqual 1
				expect( wildcardHits[0].name).toEqual 'mee'

			it "process() with only wildcard handler", ->
				s = """
					before html
					<<simple/>>
					after html
					<<mee>>
					<</mee>>
				"""

				wildcardHits = []
				r = ov.macrop.process ov.macrop.parse( s), 
					'*'		: (node, index)->
						wildcardHits.push node	

				expect( wildcardHits.length).toEqual 2
				expect( wildcardHits[1].name).toEqual 'mee'

			it "chain process() results", ->
				s = """
					before html
					<<simple/>>
					after html
					<<mee>>
					<</mee>>
				"""

				r = ov.macrop.process ov.macrop.parse( s), 
					'*'		: (node, index)->
						node.name = node.name.toUpperCase()

				r = ov.macrop.process r, 
					'*'		: (node, index)->
						@nodes[ index] = node.name

				expect( r[1]).toEqual 'SIMPLE'
				expect( r[3]).toEqual 'MEE'

		describe "orangevolt.macrop()", ->
			it "reuse processor", ->
				proc = ov.macrop
					simple 	: (node, index) ->
						@nodes[index] = node.name
					'*'		: (node, index) ->
						@nodes[index] = node.name.toUpperCase()

				r = proc """
					before html
					<<simple/>>
					after html
					<<mee>>
					<</mee>>
				"""

				expect( r[1]).toEqual 'simple'
				expect( r[3]).toEqual 'MEE'

				r = proc """
					before html
					<<rumpel/>>
					after html
					<<dumpel>>
					<</mee>>
				"""

				expect( r[1]).toEqual 'RUMPEL'
				expect( r[3]).toEqual 'DUMPEL'
) ((typeof( require)=='function' && require( './../orangevolt-macrop.js') || window && window).orangevolt)
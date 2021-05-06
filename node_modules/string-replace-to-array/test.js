var chai = require('chai')

var should = chai.should()

var replace = require('./')

describe('string-replace-to-array', function () {
	describe('string pattern', function () {
		it ('should accept a string at the end', function () {
			replace('Hello world', 'world', 'k42f/(.123').should.eql(['Hello ', 'k42f/(.123'])
		})

		it ('should accept a string in the front', function () {
			replace('Hello world', 'Hello', 'k42f/(.123').should.eql(['k42f/(.123', ' world'])
		})

		it ('should accept a string in the middle', function () {
			replace('Hello', 'll', 4).should.eql(['He', 4, 'o'])
			replace('Hello there world', 'there', 'k42f/(.123').should.eql(['Hello ', 'k42f/(.123', ' world'])
		})

		it ('should use the replace function', function () {
			var newValue = {}

			function replacer (match, offset, string) {
				match.should.equal('Hello')
				offset.should.equal(0)
				string.should.equal('Hello world')
				return newValue
			}

			replace('Hello world', 'Hello', replacer).should.eql([newValue, ' world'])
		})
	})
	describe('regex pattern', function () {
		it ('should replace all occurences of a global regex pattern', function () {
			replace('Hello there world there world Hello', /Hello/g, 'replaced')
				.should.eql(['replaced', ' there world there world ', 'replaced'])
		})

		it ('should work with non-global regexps', function () {
			replace('Hello', /ll/, 4).should.eql(['He', 4, 'o'])
		})

		it ('should use the replace function', function () {
			var newValue = {}

			function replacer (match, a, offset, string) {
				match.should.include('He')
				a.should.include('ll')
				string.should.equal('Hello there world there world Hellllo')
				offset.should.be.a.number
				return { inside: a }
			}

			replace('Hello there world there world Hellllo', /He(l+)o/g , replacer)
				.should.eql([{ inside: 'll' }, ' there world there world ', { inside: 'llll' }])
		})

		describe('String.replace equivalence', function () {
			it ('should handle an empty regexp', function () {
				'Some string'.replace(new RegExp(''), 'New string').should.equal('New stringSome string')
				replace('Some string', new RegExp(''), 'New string')
					.should.eql(['New string', 'Some string'])
			})

			// Source: https://github.com/oztune/string-replace-to-array/issues/2
			it ('should handle an empty regexp with the g flag', function () {
				'1234'.replace(new RegExp('', 'g'), '|').should.equal('|1|2|3|4|')
				replace('1234', new RegExp('', 'g'), '|')
					.should.eql(['|', '1','|', '2', '|', '3', '|', '4', '|'])
			})

			it ('should handle an empty regexp with the g flag and an empty string input', function () {
				''.replace(new RegExp('', 'g'), '|').should.equal('|')
				replace('', new RegExp('', 'g'), '|')
					.should.eql(['|'])
			})
		})
	})
	describe('flattening', function () {
		it ('should accept an array, and only replace the strings', function () {
			replace([{}, 'some string', {}], 'some', 'a')
				.should.eql([{}, 'a', ' string', {}])
		})
	})
})
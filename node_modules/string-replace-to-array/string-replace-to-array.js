// Inspiration: https://github.com/facebook/react/issues/3386

var invariant = require('invariant'),
	isString = require('lodash.isstring'),
	flatten = require('lodash.flatten')

function replace (string, regexpOrSubstr, newValueOrFn) {
	invariant(typeof string === 'string', 'First param must be a string')
	invariant(typeof regexpOrSubstr === 'string' || regexpOrSubstr instanceof RegExp, 'Second param must be a string pattern or a regular expression')

	var fn = (typeof regexpOrSubstr === 'string') ? replaceUsingString : replaceUsingRegexp

	return fn(string, regexpOrSubstr, newValueOrFn)
}

function replaceUsingString (string, patternString, newValueOrFn) {
	var index = string.indexOf(patternString)

	if (index >= 0) {
		var arr = []
		var endIndex = index + patternString.length

		if (index > 0) {
			arr.push(string.substring(0, index))
		}

		arr.push(
			(typeof newValueOrFn === 'function') ?
				newValueOrFn(
					string.substring(index, endIndex),
					index,
					string
				) :
				newValueOrFn
		)

		if (endIndex < string.length) {
			arr.push(string.substring(endIndex))
		}

		return arr
	} else {
		return [string]
	}
}

function replaceUsingRegexp (string, regexp, newValueOrFn) {
	var output = []

	var replacerIsFn = (typeof newValueOrFn === 'function')

	var storedLastIndex = regexp.lastIndex
	regexp.lastIndex = 0

	var result
	var lastIndex = 0
	while (result = regexp.exec(string)) {
		var index = result.index

		if (result[0] === '') {
			// When the regexp is an empty string
			// we still want to advance our cursor to the next item.
			// This is the behavior of String.replace.
			regexp.lastIndex++
		}

		if (index !== lastIndex) {
			output.push(string.substring(lastIndex, index))
		}

		var match = result[0]
		lastIndex = index + match.length
		
		var out = replacerIsFn ?
			newValueOrFn.apply(this, result.concat(index, result.input)) :
			newValueOrFn
		output.push(out)

		if (!regexp.global) {
			break
		}
	}

	if (lastIndex < string.length) {
		output.push(string.substring(lastIndex))
	}

	regexp.lastIndex = storedLastIndex
	return output
}

module.exports = function stringReplaceToArray (string, regexpOrSubstr, newSubStrOrFn) {
	if (isString(string)) {
		return replace(string, regexpOrSubstr, newSubStrOrFn)
	} else if (!Array.isArray(string) || !string[0]) {
		throw new TypeError('First argument must be an array or non-empty string');
	} else {
		return flatten(string.map(function (string) {
			if (!isString(string)) return string
			return replace(string, regexpOrSubstr, newSubStrOrFn)
		}))
	}
}
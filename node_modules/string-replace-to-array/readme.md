# String replace to array

[![string-replace-to-array on NPM](https://img.shields.io/npm/v/string-replace-to-array.svg)](https://www.npmjs.com/package/string-replace-to-array)
[![Build Status](https://img.shields.io/circleci/project/oztune/string-replace-to-array.svg)](https://circleci.com/gh/oztune/string-replace-to-array)

Works just like `String.prototype.replace` but outputs an array instead of a string.

## Why?

We built this for use with React, but it's very generic and doesn't depend on any environment. Consider the following scenario.

Given this string:

```
var content = 'Hello\nworld'
```

and this React markup:

```
<span>{ content }</span>
```

We'll get this output:
```
Hello world
```
_The newline character is ignored when the browser renders the resulting html._

The solution is to replace `\n` with `<br>`:

```
<span>{ replace(content, '\n', <br>) }</span>
```

and the output will be:

```
<span>Hello</br>world</span>
```
When rendered:
```
Hello
world
```

Now the newline will be rendered properly. Yay!

## Example usage

### Simple example

```
var replace = require('string-replace-to-array')
replace('Hello Amy', 'Amy', { name: 'Amy' })
// output: ['Hello ', { name: 'Amy' }]
```

### Full example

```
replace(
  'Hello Hermione Granger...',
  /(Hermione) (Granger)/g,
  function (fullName, firstName, lastName, offset, string) {
    return <Person firstName={ firstName } lastName={ lastName } />
  }
)

// output: ['Hello ', <Person firstName="Hermione" lastName="Granger" />, ...]
```

For a real-life example check out [react-easy-emoji](https://github.com/appfigures/react-easy-emoji), where this this is used to replace emoji unicode characters with `<img>` tags.

## Installation

```
npm install --save string-replace-to-array
```

## API

```
(string, regexp|substr, newValue|function) => array
```

The API mimics [String.prototype.replace](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace). The only differences are:

- The replacer (third parameter) doesn't have to be a string
- Returns an array instead of a string

## Inspiration

Mainly inspired by this conversation: https://github.com/facebook/react/issues/3386

### Why not use [react-replace-string](https://github.com/iansinnott/react-string-replace)?

Because we needed the full API of `String.replace`, especially the regex match parameters which get passed to the replace function.


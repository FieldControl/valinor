## ts-deferred
Very simple implementation of Deferred for TypeScript.

### Install
```
$ npm install --save ts-deferred
```

### Usage
#### in TypeScript
```
import {Deferred} from "ts-deferred";

let d: Deferred<string> = new Deferred<string>();
let p: Promise<string> = d.promise;

p.then(text => console.log(text));

d.resolve("Hello World!!");
```

#### in JavaScript
```
let Deferred = require("ts-deferred").Deferred;

let d = new Deferred();
let p = d.promise;

p.then(function (text) {
  console.log(text);
});

d.resolve("Hello World!!");
```


### API
#### `promise: Promise<T>`
The promise.

#### `resolve(value?: T | PromiseLike<T>): void`
Resolves the promise with the given value.

#### `reject(reason?: any): void`
Rejects the promise with the given reason.


### Dependency
This library has no implementation of `Promise<T>`.
If the target is es5 or less, it's depends
to [es6-promise](https://www.npmjs.com/package/es6-promise)
or [es6-shim](https://www.npmjs.com/package/es6-shim).


### How to build and test
1. Clone this repository.
2. Run `npm install` to install dependencies.
3. Run `npm run build` or `npm test`.


### License
MIT

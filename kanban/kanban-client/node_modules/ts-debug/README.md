# Typescript Debugger
## Console Wrappper
This tiny lib written in Typescript allows you to leave your debugging logs inside your project without worries of removing them for production environment.

### Installation
```
npm install --save ts-debug
```

### Usage
`Debugger`'s instance has the exactly same methods as standard `console`. Its constructor takes 3 parameters: 
  + `console: Console` - object implementing Console interface, e.g. `console` or its wrapper
  + `isEnabled: boolean = true` - determines if Debugger should be enabled (you shoud pass here `false` to prevent displaying console output in production environment)
  + `prefix: string = ''` - specifies prefix for console outputs, e.g. `"[DEBUG] "`

#### Example:
```
import { Debugger } from 'ts-debug';
const Config = { isProd: false }; // example config in your application

const debug = new Debugger(console, !Config.isProd, '[DEBUG] ');
debug.log('Debugger is enabled!');
debug.warn('An error occured while processing: ', { example: 'object' });
```

You can see real-life usage of this lib in [ngx-store](https://github.com/zoomsphere/ngx-store).


### Additional methods
- `throw(error: Error)` - throws usual (sync) error in debug mode and non-blocking (async) otherwise


### Compatibility
For TypeScript 3+ use v1.3+
For older versions use v1.2
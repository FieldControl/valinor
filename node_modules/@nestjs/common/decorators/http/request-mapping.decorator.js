"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Unlock = exports.Lock = exports.Move = exports.Copy = exports.Mkcol = exports.Proppatch = exports.Propfind = exports.Search = exports.All = exports.Head = exports.Options = exports.Patch = exports.Put = exports.Delete = exports.Get = exports.Post = exports.RequestMapping = void 0;
const constants_1 = require("../../constants");
const request_method_enum_1 = require("../../enums/request-method.enum");
const defaultMetadata = {
    [constants_1.PATH_METADATA]: '/',
    [constants_1.METHOD_METADATA]: request_method_enum_1.RequestMethod.GET,
};
const RequestMapping = (metadata = defaultMetadata) => {
    const pathMetadata = metadata[constants_1.PATH_METADATA];
    const path = pathMetadata && pathMetadata.length ? pathMetadata : '/';
    const requestMethod = metadata[constants_1.METHOD_METADATA] || request_method_enum_1.RequestMethod.GET;
    return (target, key, descriptor) => {
        Reflect.defineMetadata(constants_1.PATH_METADATA, path, descriptor.value);
        Reflect.defineMetadata(constants_1.METHOD_METADATA, requestMethod, descriptor.value);
        return descriptor;
    };
};
exports.RequestMapping = RequestMapping;
const createMappingDecorator = (method) => (path) => {
    return (0, exports.RequestMapping)({
        [constants_1.PATH_METADATA]: path,
        [constants_1.METHOD_METADATA]: method,
    });
};
/**
 * Route handler (method) Decorator. Routes HTTP POST requests to the specified path.
 *
 * @see [Routing](https://docs.nestjs.com/controllers#routing)
 *
 * @publicApi
 */
exports.Post = createMappingDecorator(request_method_enum_1.RequestMethod.POST);
/**
 * Route handler (method) Decorator. Routes HTTP GET requests to the specified path.
 *
 * @see [Routing](https://docs.nestjs.com/controllers#routing)
 *
 * @publicApi
 */
exports.Get = createMappingDecorator(request_method_enum_1.RequestMethod.GET);
/**
 * Route handler (method) Decorator. Routes HTTP DELETE requests to the specified path.
 *
 * @see [Routing](https://docs.nestjs.com/controllers#routing)
 *
 * @publicApi
 */
exports.Delete = createMappingDecorator(request_method_enum_1.RequestMethod.DELETE);
/**
 * Route handler (method) Decorator. Routes HTTP PUT requests to the specified path.
 *
 * @see [Routing](https://docs.nestjs.com/controllers#routing)
 *
 * @publicApi
 */
exports.Put = createMappingDecorator(request_method_enum_1.RequestMethod.PUT);
/**
 * Route handler (method) Decorator. Routes HTTP PATCH requests to the specified path.
 *
 * @see [Routing](https://docs.nestjs.com/controllers#routing)
 *
 * @publicApi
 */
exports.Patch = createMappingDecorator(request_method_enum_1.RequestMethod.PATCH);
/**
 * Route handler (method) Decorator. Routes HTTP OPTIONS requests to the specified path.
 *
 * @see [Routing](https://docs.nestjs.com/controllers#routing)
 *
 * @publicApi
 */
exports.Options = createMappingDecorator(request_method_enum_1.RequestMethod.OPTIONS);
/**
 * Route handler (method) Decorator. Routes HTTP HEAD requests to the specified path.
 *
 * @see [Routing](https://docs.nestjs.com/controllers#routing)
 *
 * @publicApi
 */
exports.Head = createMappingDecorator(request_method_enum_1.RequestMethod.HEAD);
/**
 * Route handler (method) Decorator. Routes all HTTP requests to the specified path.
 *
 * @see [Routing](https://docs.nestjs.com/controllers#routing)
 *
 * @publicApi
 */
exports.All = createMappingDecorator(request_method_enum_1.RequestMethod.ALL);
/**
 * Route handler (method) Decorator. Routes HTTP SEARCH requests to the specified path.
 *
 * @see [Routing](https://docs.nestjs.com/controllers#routing)
 *
 * @publicApi
 */
exports.Search = createMappingDecorator(request_method_enum_1.RequestMethod.SEARCH);
/**
 * Route handler (method) Decorator. Routes Webdav PROPFIND requests to the specified path.
 *
 * @see [Routing](https://docs.nestjs.com/controllers#routing)
 *
 * @publicApi
 */
exports.Propfind = createMappingDecorator(request_method_enum_1.RequestMethod.PROPFIND);
/**
 * Route handler (method) Decorator. Routes Webdav PROPPATCH requests to the specified path.
 *
 * @see [Routing](https://docs.nestjs.com/controllers#routing)
 *
 * @publicApi
 */
exports.Proppatch = createMappingDecorator(request_method_enum_1.RequestMethod.PROPPATCH);
/**
 * Route handler (method) Decorator. Routes Webdav MKCOL requests to the specified path.
 *
 * @see [Routing](https://docs.nestjs.com/controllers#routing)
 *
 * @publicApi
 */
exports.Mkcol = createMappingDecorator(request_method_enum_1.RequestMethod.MKCOL);
/**
 * Route handler (method) Decorator. Routes Webdav COPY requests to the specified path.
 *
 * @see [Routing](https://docs.nestjs.com/controllers#routing)
 *
 * @publicApi
 */
exports.Copy = createMappingDecorator(request_method_enum_1.RequestMethod.COPY);
/**
 * Route handler (method) Decorator. Routes Webdav MOVE requests to the specified path.
 *
 * @see [Routing](https://docs.nestjs.com/controllers#routing)
 *
 * @publicApi
 */
exports.Move = createMappingDecorator(request_method_enum_1.RequestMethod.MOVE);
/**
 * Route handler (method) Decorator. Routes Webdav LOCK requests to the specified path.
 *
 * @see [Routing](https://docs.nestjs.com/controllers#routing)
 *
 * @publicApi
 */
exports.Lock = createMappingDecorator(request_method_enum_1.RequestMethod.LOCK);
/**
 * Route handler (method) Decorator. Routes Webdav UNLOCK requests to the specified path.
 *
 * @see [Routing](https://docs.nestjs.com/controllers#routing)
 *
 * @publicApi
 */
exports.Unlock = createMappingDecorator(request_method_enum_1.RequestMethod.UNLOCK);

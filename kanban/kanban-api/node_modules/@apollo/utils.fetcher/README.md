# Fetcher interface

This package defines TypeScript typings for a subset of the [web `fetch` API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API).

The goal is for software that wants to be able to make HTTP requests in a configurable fashion to be able to declare an option of this type; users can pass in any valid `fetch` implementation such as `node-fetch`, `make-fetch-happen`, or `undici`.

The actual `fetch` API is very flexible. You can specify requests either as JSON-style objects or as objects of the `Request` and `Headers` classes. However, some `fetch` implementations distinguish between these cases by using (for example) `instanceof Headers`, where `Headers` is the particular class defined by that implementation. So if you want to write portable code that should work with any `fetch` implementation, you need to use JSON-style objects rather than a particular implementation's classes. (For example, a `Headers` object created with `node-fetch` v2 will not be properly recognized by `make-fetch-happen` v10.)

Additionally, some `fetch` implementations accept various types for their request `body`; for example, `node-fetch` supports the use of `FormData` objects specifically from the `form-data` package. You may choose to use different types for your request `body`, so long as those types are supported by the `fetch` implementation of your choice. You will likely need to use a type assertion to convince TypeScript that your `body` is valid. Unfortunately, because different `fetch` implementations access different `FormData` classes, we weren't excited about the outcome of this [relevant PR](https://github.com/apollographql/apollo-utils/pull/225) and decided to undo it, but might be open to a simpler approach that solves the problem without the need for type assertions.

Specifically, the `Fetcher` interface only declares options that are currently required by the software that uses it, such as Apollo Server and Apollo Gateway. If more options are required (and they are implemented with the same types in all `fetch` implementations), we can add them as needed.

This package is validated to be compatible with the typings of `node-fetch` v2, `make-fetch-happen` v10, and `undici` v5.

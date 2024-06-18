"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.featurePath = exports.group = exports.pluralize = exports.capitalize = exports.underscore = exports.classify = exports.camelize = exports.dasherize = exports.decamelize = void 0;
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var STRING_DASHERIZE_REGEXP = /[ _]/g;
var STRING_DECAMELIZE_REGEXP = /([a-z\d])([A-Z])/g;
var STRING_CAMELIZE_REGEXP = /(-|_|\.|\s)+(.)?/g;
var STRING_UNDERSCORE_REGEXP_1 = /([a-z\d])([A-Z]+)/g;
var STRING_UNDERSCORE_REGEXP_2 = /-|\s+/g;
/**
 * Converts a camelized string into all lower case separated by underscores.
 *
 ```javascript
 decamelize('innerHTML');         // 'inner_html'
 decamelize('action_name');       // 'action_name'
 decamelize('css-class-name');    // 'css-class-name'
 decamelize('my favorite items'); // 'my favorite items'
 ```
 */
function decamelize(str) {
    return str.replace(STRING_DECAMELIZE_REGEXP, '$1_$2').toLowerCase();
}
exports.decamelize = decamelize;
/**
 Replaces underscores, spaces, or camelCase with dashes.

 ```javascript
 dasherize('innerHTML');         // 'inner-html'
 dasherize('action_name');       // 'action-name'
 dasherize('css-class-name');    // 'css-class-name'
 dasherize('my favorite items'); // 'my-favorite-items'
 ```
 */
function dasherize(str) {
    return decamelize(str || '').replace(STRING_DASHERIZE_REGEXP, '-');
}
exports.dasherize = dasherize;
/**
 Returns the lowerCamelCase form of a string.

 ```javascript
 camelize('innerHTML');          // 'innerHTML'
 camelize('action_name');        // 'actionName'
 camelize('css-class-name');     // 'cssClassName'
 camelize('my favorite items');  // 'myFavoriteItems'
 camelize('My Favorite Items');  // 'myFavoriteItems'
 ```
 */
function camelize(str) {
    return str
        .replace(STRING_CAMELIZE_REGEXP, function (_match, _separator, chr) {
        return chr ? chr.toUpperCase() : '';
    })
        .replace(/^([A-Z])/, function (match) { return match.toLowerCase(); });
}
exports.camelize = camelize;
/**
 Returns the UpperCamelCase form of a string.

 ```javascript
 'innerHTML'.classify();          // 'InnerHTML'
 'action_name'.classify();        // 'ActionName'
 'css-class-name'.classify();     // 'CssClassName'
 'my favorite items'.classify();  // 'MyFavoriteItems'
 ```
 */
function classify(str) {
    return str
        .split('.')
        .map(function (part) { return capitalize(camelize(part)); })
        .join('.');
}
exports.classify = classify;
/**
 More general than decamelize. Returns the lower\_case\_and\_underscored
 form of a string.

 ```javascript
 'innerHTML'.underscore();          // 'inner_html'
 'action_name'.underscore();        // 'action_name'
 'css-class-name'.underscore();     // 'css_class_name'
 'my favorite items'.underscore();  // 'my_favorite_items'
 ```
 */
function underscore(str) {
    return str
        .replace(STRING_UNDERSCORE_REGEXP_1, '$1_$2')
        .replace(STRING_UNDERSCORE_REGEXP_2, '_')
        .toLowerCase();
}
exports.underscore = underscore;
/**
 Returns the Capitalized form of a string

 ```javascript
 'innerHTML'.capitalize()         // 'InnerHTML'
 'action_name'.capitalize()       // 'Action_name'
 'css-class-name'.capitalize()    // 'Css-class-name'
 'my favorite items'.capitalize() // 'My favorite items'
 ```
 */
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.substring(1);
}
exports.capitalize = capitalize;
/**
 Returns the plural form of a string

 ```javascript
 'innerHTML'.pluralize()         // 'innerHTMLs'
 'action_name'.pluralize()       // 'actionNames'
 'css-class-name'.pluralize()    // 'cssClassNames'
 'regex'.pluralize()            // 'regexes'
 'user'.pluralize()             // 'users'
 ```
 */
function pluralize(str) {
    return camelize([/([^aeiou])y$/, /()fe?$/, /([^aeiou]o|[sxz]|[cs]h)$/].map(function (c, i) { return (str = str.replace(c, "$1".concat('iv'[i] || '', "e"))); }) && str + 's');
}
exports.pluralize = pluralize;
function group(name, group) {
    return group ? "".concat(group, "/").concat(name) : name;
}
exports.group = group;
function featurePath(group, flat, path, name) {
    if (group && !flat) {
        return "../../".concat(path, "/").concat(name, "/");
    }
    return group ? "../".concat(path, "/") : './';
}
exports.featurePath = featurePath;
//# sourceMappingURL=strings.js.map
/* marvel-character.ts  */

// Créditos a quem merece, feito via "https://app.quicktype.io/"

// To parse this data:
//
//   import { Convert, MarvelCharacter } from "./file";
//
//   const marvelCharacter = Convert.toMarvelCharacter(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export interface MarvelCharacter {
    code:            number;
    status:          string;
    copyright:       string;
    attributionText: string;
    attributionHTML: string;
    etag:            string;
    data:            DataCharacter;
}

export interface DataCharacter {
    offset:  number;
    limit:   number;
    total:   number;
    count:   number;
    results: ResultCharacter[];
}

export interface ResultCharacter {
    id:          number;
    name:        string;
    description: string;
    modified:    string;
    thumbnail:   ThumbnailCharacter;
    resourceURI: string;
    comics:      ComicsCharacter;
    series:      ComicsCharacter;
    stories:     StoriesCharacter;
    events:      ComicsCharacter;
    urls:        URL[];
}

export interface ComicsCharacter {
    available:     number;
    collectionURI: string;
    items:         ComicsItemCharacter[];
    returned:      number;
}

export interface ComicsItemCharacter {
    resourceURI: string;
    name:        string;
}

export interface StoriesCharacter {
    available:     number;
    collectionURI: string;
    items:         StoriesItemCharacter[];
    returned:      number;
}

export interface StoriesItemCharacter {
    resourceURI: string;
    name:        string;
    type:        ItemType;
}

export enum ItemType {
    Cover = "cover",
    Empty = "",
    InteriorStory = "interiorStory",
}

export interface ThumbnailCharacter {
    path:      string;
    extension: Extension;
}

export enum Extension {
    GIF = "gif",
    Jpg = "jpg",
}

export interface URLCharacter {
    type: URLType;
    url:  string;
}

export enum URLType {
    Comiclink = "comiclink",
    Detail = "detail",
    Wiki = "wiki",
}

// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
export class Convert {
    public static toMarvelCharacter(json: string): MarvelCharacter {
        return cast(JSON.parse(json), r("MarvelCharacter"));
    }

    public static marvelToJsonCharacter(value: MarvelCharacter): string {
        return JSON.stringify(uncast(value, r("MarvelCharacter")), null, 2);
    }
}

function invalidValue(typ: any, val: any, key: any, parent: any = ''): never {
    const prettyTyp = prettyTypeName(typ);
    const parentText = parent ? ` on ${parent}` : '';
    const keyText = key ? ` for key "${key}"` : '';
    throw Error(`Invalid value${keyText}${parentText}. Expected ${prettyTyp} but got ${JSON.stringify(val)}`);
}

function prettyTypeName(typ: any): string {
    if (Array.isArray(typ)) {
        if (typ.length === 2 && typ[0] === undefined) {
            return `an optional ${prettyTypeName(typ[1])}`;
        } else {
            return `one of [${typ.map(a => { return prettyTypeName(a); }).join(", ")}]`;
        }
    } else if (typeof typ === "object" && typ.literal !== undefined) {
        return typ.literal;
    } else {
        return typeof typ;
    }
}

function jsonToJSProps(typ: any): any {
    if (typ.jsonToJS === undefined) {
        const map: any = {};
        typ.props.forEach((p: any) => map[p.json] = { key: p.js, typ: p.typ });
        typ.jsonToJS = map;
    }
    return typ.jsonToJS;
}

function jsToJSONProps(typ: any): any {
    if (typ.jsToJSON === undefined) {
        const map: any = {};
        typ.props.forEach((p: any) => map[p.js] = { key: p.json, typ: p.typ });
        typ.jsToJSON = map;
    }
    return typ.jsToJSON;
}

function transform(val: any, typ: any, getProps: any, key: any = '', parent: any = ''): any {
    function transformPrimitive(typ: string, val: any): any {
        if (typeof typ === typeof val) return val;
        return invalidValue(typ, val, key, parent);
    }

    function transformUnion(typs: any[], val: any): any {
        // val must validate against one typ in typs
        const l = typs.length;
        for (let i = 0; i < l; i++) {
            const typ = typs[i];
            try {
                return transform(val, typ, getProps);
            } catch (_) {}
        }
        return invalidValue(typs, val, key, parent);
    }

    function transformEnum(cases: string[], val: any): any {
        if (cases.indexOf(val) !== -1) return val;
        return invalidValue(cases.map(a => { return l(a); }), val, key, parent);
    }

    function transformArray(typ: any, val: any): any {
        // val must be an array with no invalid elements
        if (!Array.isArray(val)) return invalidValue(l("array"), val, key, parent);
        return val.map(el => transform(el, typ, getProps));
    }

    function transformDate(val: any): any {
        if (val === null) {
            return null;
        }
        const d = new Date(val);
        if (isNaN(d.valueOf())) {
            return invalidValue(l("Date"), val, key, parent);
        }
        return d;
    }

    function transformObject(props: { [k: string]: any }, additional: any, val: any): any {
        if (val === null || typeof val !== "object" || Array.isArray(val)) {
            return invalidValue(l(ref || "object"), val, key, parent);
        }
        const result: any = {};
        Object.getOwnPropertyNames(props).forEach(key => {
            const prop = props[key];
            const v = Object.prototype.hasOwnProperty.call(val, key) ? val[key] : undefined;
            result[prop.key] = transform(v, prop.typ, getProps, key, ref);
        });
        Object.getOwnPropertyNames(val).forEach(key => {
            if (!Object.prototype.hasOwnProperty.call(props, key)) {
                result[key] = transform(val[key], additional, getProps, key, ref);
            }
        });
        return result;
    }

    if (typ === "any") return val;
    if (typ === null) {
        if (val === null) return val;
        return invalidValue(typ, val, key, parent);
    }
    if (typ === false) return invalidValue(typ, val, key, parent);
    let ref: any = undefined;
    while (typeof typ === "object" && typ.ref !== undefined) {
        ref = typ.ref;
        typ = typeMap[typ.ref];
    }
    if (Array.isArray(typ)) return transformEnum(typ, val);
    if (typeof typ === "object") {
        return typ.hasOwnProperty("unionMembers") ? transformUnion(typ.unionMembers, val)
            : typ.hasOwnProperty("arrayItems")    ? transformArray(typ.arrayItems, val)
            : typ.hasOwnProperty("props")         ? transformObject(getProps(typ), typ.additional, val)
            : invalidValue(typ, val, key, parent);
    }
    // Numbers can be parsed by Date but shouldn't be.
    if (typ === Date && typeof val !== "number") return transformDate(val);
    return transformPrimitive(typ, val);
}

function cast<T>(val: any, typ: any): T {
    return transform(val, typ, jsonToJSProps);
}

function uncast<T>(val: T, typ: any): any {
    return transform(val, typ, jsToJSONProps);
}

function l(typ: any) {
    return { literal: typ };
}

function a(typ: any) {
    return { arrayItems: typ };
}

function u(...typs: any[]) {
    return { unionMembers: typs };
}

function o(props: any[], additional: any) {
    return { props, additional };
}

function m(additional: any) {
    return { props: [], additional };
}

function r(name: string) {
    return { ref: name };
}

const typeMap: any = {
    "MarvelCharacter": o([
        { json: "code", js: "code", typ: 0 },
        { json: "status", js: "status", typ: "" },
        { json: "copyright", js: "copyright", typ: "" },
        { json: "attributionText", js: "attributionText", typ: "" },
        { json: "attributionHTML", js: "attributionHTML", typ: "" },
        { json: "etag", js: "etag", typ: "" },
        { json: "data", js: "data", typ: r("DataCharacter") },
    ], false),
    "DataCharacter": o([
        { json: "offset", js: "offset", typ: 0 },
        { json: "limit", js: "limit", typ: 0 },
        { json: "total", js: "total", typ: 0 },
        { json: "count", js: "count", typ: 0 },
        { json: "results", js: "results", typ: a(r("ResultCharacter")) },
    ], false),
    "ResultCharacter": o([
        { json: "id", js: "id", typ: 0 },
        { json: "name", js: "name", typ: "" },
        { json: "description", js: "description", typ: "" },
        { json: "modified", js: "modified", typ: "" },
        { json: "thumbnail", js: "thumbnail", typ: r("ThumbnailCharacter") },
        { json: "resourceURI", js: "resourceURI", typ: "" },
        { json: "comics", js: "comics", typ: r("ComicsCharacter") },
        { json: "series", js: "series", typ: r("ComicsCharacter") },
        { json: "stories", js: "stories", typ: r("StoriesCharacter") },
        { json: "events", js: "events", typ: r("ComicsCharacter") },
        { json: "urls", js: "urls", typ: a(r("URLCharacter")) },
    ], false),
    "ComicsCharacter": o([
        { json: "available", js: "available", typ: 0 },
        { json: "collectionURI", js: "collectionURI", typ: "" },
        { json: "items", js: "items", typ: a(r("ComicsItemCharacter")) },
        { json: "returned", js: "returned", typ: 0 },
    ], false),
    "ComicsItemCharacter": o([
        { json: "resourceURI", js: "resourceURI", typ: "" },
        { json: "name", js: "name", typ: "" },
    ], false),
    "StoriesCharacter": o([
        { json: "available", js: "available", typ: 0 },
        { json: "collectionURI", js: "collectionURI", typ: "" },
        { json: "items", js: "items", typ: a(r("StoriesItemCharacter")) },
        { json: "returned", js: "returned", typ: 0 },
    ], false),
    "StoriesItemCharacter": o([
        { json: "resourceURI", js: "resourceURI", typ: "" },
        { json: "name", js: "name", typ: "" },
        { json: "type", js: "type", typ: r("ItemType") },
    ], false),
    "ThumbnailCharacter": o([
        { json: "path", js: "path", typ: "" },
        { json: "extension", js: "extension", typ: r("Extension") },
    ], false),
    "URLCharacter": o([
        { json: "type", js: "type", typ: r("URLType") },
        { json: "url", js: "url", typ: "" },
    ], false),
    "ItemType": [
        "cover",
        "",
        "interiorStory",
    ],
    "Extension": [
        "gif",
        "jpg",
    ],
    "URLType": [
        "comiclink",
        "detail",
        "wiki",
    ],
};

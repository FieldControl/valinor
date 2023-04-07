// To parse this data:
//
//   import { Convert, MarvelStoriesStories } from "./file";
//
//   const marvelStoriesStories = Convert.toMarvelStoriesStories(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export interface MarvelStoriesStories {
    code:            number;
    status:          string;
    copyright:       string;
    attributionText: string;
    attributionHTML: string;
    etag:            string;
    data:            DataStories;
}

export interface DataStories {
    offset:  number;
    limit:   number;
    total:   number;
    count:   number;
    results: ResultStories[];
}

export interface ResultStories {
    id:            number;
    title:         string;
    description:   string;
    resourceURI:   string;
    type:          Type;
    modified:      Modified;
    thumbnail:     null;
    creators:      CharactersStories;
    characters:    CharactersStories;
    series:        CharactersStories;
    comics:        CharactersStories;
    events:        CharactersStories;
    originalIssue: OriginalIssueStories;
}

export interface CharactersStories {
    available:     number;
    collectionURI: string;
    items:         ItemStories[];
    returned:      number;
}

export interface ItemStories {
    resourceURI: string;
    name:        string;
    role?:       string;
}

export enum Modified {
    The19691231T1900000500 = "1969-12-31T19:00:00-0500",
    The20140127T0000000500 = "2014-01-27T00:00:00-0500",
}

export interface OriginalIssueStories {
    resourceURI: string;
    name:        string;
}

export enum Type {
    Story = "story",
}

// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
export class Convert {
    public static toMarvelStoriesStories(json: string): MarvelStoriesStories {
        return cast(JSON.parse(json), r("MarvelStoriesStories"));
    }

    public static marvelStoriesStoriesToJson(value: MarvelStoriesStories): string {
        return JSON.stringify(uncast(value, r("MarvelStoriesStories")), null, 2);
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
            : typ.hasOwnProperty("arrayItemStoriess")    ? transformArray(typ.arrayItemStoriess, val)
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
    return { arrayItemStoriess: typ };
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
    "MarvelStoriesStories": o([
        { json: "code", js: "code", typ: 0 },
        { json: "status", js: "status", typ: "" },
        { json: "copyright", js: "copyright", typ: "" },
        { json: "attributionText", js: "attributionText", typ: "" },
        { json: "attributionHTML", js: "attributionHTML", typ: "" },
        { json: "etag", js: "etag", typ: "" },
        { json: "data", js: "data", typ: r("DataStories") },
    ], false),
    "DataStories": o([
        { json: "offset", js: "offset", typ: 0 },
        { json: "limit", js: "limit", typ: 0 },
        { json: "total", js: "total", typ: 0 },
        { json: "count", js: "count", typ: 0 },
        { json: "results", js: "results", typ: a(r("ResultStories")) },
    ], false),
    "ResultStories": o([
        { json: "id", js: "id", typ: 0 },
        { json: "title", js: "title", typ: "" },
        { json: "description", js: "description", typ: "" },
        { json: "resourceURI", js: "resourceURI", typ: "" },
        { json: "type", js: "type", typ: r("Type") },
        { json: "modified", js: "modified", typ: r("Modified") },
        { json: "thumbnail", js: "thumbnail", typ: null },
        { json: "creators", js: "creators", typ: r("CharactersStories") },
        { json: "characters", js: "characters", typ: r("CharactersStories") },
        { json: "series", js: "series", typ: r("CharactersStories") },
        { json: "comics", js: "comics", typ: r("CharactersStories") },
        { json: "events", js: "events", typ: r("CharactersStories") },
        { json: "originalIssue", js: "originalIssue", typ: r("OriginalIssueStories") },
    ], false),
    "CharactersStories": o([
        { json: "available", js: "available", typ: 0 },
        { json: "collectionURI", js: "collectionURI", typ: "" },
        { json: "items", js: "items", typ: a(r("ItemStories")) },
        { json: "returned", js: "returned", typ: 0 },
    ], false),
    "ItemStories": o([
        { json: "resourceURI", js: "resourceURI", typ: "" },
        { json: "name", js: "name", typ: "" },
        { json: "role", js: "role", typ: u(undefined, "") },
    ], false),
    "OriginalIssueStories": o([
        { json: "resourceURI", js: "resourceURI", typ: "" },
        { json: "name", js: "name", typ: "" },
    ], false),
    "Modified": [
        "1969-12-31T19:00:00-0500",
        "2014-01-27T00:00:00-0500",
    ],
    "Type": [
        "story",
    ],
};

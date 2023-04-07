// Créditos a quem merece, feito via "https://app.quicktype.io/"

// To parse this data:
//
//   import { Convert, MarvelComics } from "./file";
//
//   const marvelComics = Convert.toMarvelComics(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export interface MarvelComics {
    code:            number;
    status:          string;
    copyright:       string;
    attributionText: string;
    attributionHTML: string;
    etag:            string;
    data:            DataComics;
}

export interface DataComics {
    offset:  number;
    limit:   number;
    total:   number;
    count:   number;
    results: ResultComics[];
}

export interface ResultComics {
    id:                 number;
    digitalId:          number;
    title:              string;
    issueNumber:        number;
    variantDescription: string;
    description:        null | string;
    modified:           string;
    isbn:               string;
    upc:                string;
    diamondCode:        DiamondCode;
    ean:                string;
    issn:               string;
    format:             Format;
    pageCount:          number;
    textObjects:        TextObjectComics[];
    resourceURI:        string;
    urls:               URLComics[];
    series:             SeriesComics;
    variants:           SeriesComics[];
    collections:        any[];
    collectedIssues:    SeriesComics[];
    dates:              DateElementComics[];
    prices:             PriceComics[];
    thumbnail:          ThumbnailComics;
    images:             ThumbnailComics[];
    creators:           CreatorsComics;
    characters:         CharactersComics;
    stories:            StoriesComics;
    events:             CharactersComics;
}

export interface CharactersComics {
    available:     number;
    collectionURI: string;
    items:         SeriesComics[];
    returned:      number;
}

export interface SeriesComics {
    resourceURI: string;
    name:        string;
}

export interface CreatorsComics {
    available:     number;
    collectionURI: string;
    items:         CreatorsComicsItem[];
    returned:      number;
}

export interface CreatorsComicsItem {
    resourceURI: string;
    name:        string;
    role:        Role;
}

export enum Role {
    Colorist = "colorist",
    Editor = "editor",
    Inker = "inker",
    Letterer = "letterer",
    Penciler = "penciler",
    Penciller = "penciller",
    PencillerCover = "penciller (cover)",
    Writer = "writer",
}

export interface DateElementComics {
    type: DateType;
    date: string;
}

export enum DateType {
    DigitalPurchaseDate = "digitalPurchaseDate",
    FocDate = "focDate",
    OnsaleDate = "onsaleDate",
    UnlimitedDate = "unlimitedDate",
}

export enum DiamondCode {
    Empty = "",
    Jul190068 = "JUL190068",
}

export enum Format {
    Comic = "Comic",
    Digest = "Digest",
    Empty = "",
    TradePaperback = "Trade Paperback",
}

export interface ThumbnailComics {
    path:      string;
    extension: Extension;
}

export enum Extension {
    Jpg = "jpg",
}

export interface PriceComics {
    type:  PriceComicsType;
    price: number;
}

export enum PriceComicsType {
    DigitalPurchasePriceComics = "digitalPurchasePriceComics",
    PrintPriceComics = "printPriceComics",
}

export interface StoriesComics {
    available:     number;
    collectionURI: string;
    items:         StoriesComicsItem[];
    returned:      number;
}

export interface StoriesComicsItem {
    resourceURI: string;
    name:        string;
    type:        ItemType;
}

export enum ItemType {
    Cover = "cover",
    InteriorStory = "interiorStory",
    Promo = "promo",
}

export interface TextObjectComics {
    type:     TextObjectComicsType;
    language: Language;
    text:     string;
}

export enum Language {
    EnUs = "en-us",
}

export enum TextObjectComicsType {
    IssueSolicitText = "issue_solicit_text",
}

export interface URLComics {
    type: URLType;
    url:  string;
}

export enum URLType {
    Detail = "detail",
    InAppLink = "inAppLink",
    Purchase = "purchase",
    Reader = "reader",
}

// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
export class Convert {
    public static toMarvelComics(json: string): MarvelComics {
        return cast(JSON.parse(json), r("MarvelComics"));
    }

    public static marvelComicsToJson(value: MarvelComics): string {
        return JSON.stringify(uncast(value, r("MarvelComics")), null, 2);
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
    "MarvelComics": o([
        { json: "code", js: "code", typ: 0 },
        { json: "status", js: "status", typ: "" },
        { json: "copyright", js: "copyright", typ: "" },
        { json: "attributionText", js: "attributionText", typ: "" },
        { json: "attributionHTML", js: "attributionHTML", typ: "" },
        { json: "etag", js: "etag", typ: "" },
        { json: "data", js: "data", typ: r("DataComics") },
    ], false),
    "DataComics": o([
        { json: "offset", js: "offset", typ: 0 },
        { json: "limit", js: "limit", typ: 0 },
        { json: "total", js: "total", typ: 0 },
        { json: "count", js: "count", typ: 0 },
        { json: "results", js: "results", typ: a(r("ResultComics")) },
    ], false),
    "ResultComics": o([
        { json: "id", js: "id", typ: 0 },
        { json: "digitalId", js: "digitalId", typ: 0 },
        { json: "title", js: "title", typ: "" },
        { json: "issueNumber", js: "issueNumber", typ: 0 },
        { json: "variantDescription", js: "variantDescription", typ: "" },
        { json: "description", js: "description", typ: u(null, "") },
        { json: "modified", js: "modified", typ: "" },
        { json: "isbn", js: "isbn", typ: "" },
        { json: "upc", js: "upc", typ: "" },
        { json: "diamondCode", js: "diamondCode", typ: r("DiamondCode") },
        { json: "ean", js: "ean", typ: "" },
        { json: "issn", js: "issn", typ: "" },
        { json: "format", js: "format", typ: r("Format") },
        { json: "pageCount", js: "pageCount", typ: 0 },
        { json: "textObjects", js: "textObjects", typ: a(r("TextObjectComics")) },
        { json: "resourceURI", js: "resourceURI", typ: "" },
        { json: "urls", js: "urls", typ: a(r("URLComics")) },
        { json: "series", js: "series", typ: r("SeriesComics") },
        { json: "variants", js: "variants", typ: a(r("SeriesComics")) },
        { json: "collections", js: "collections", typ: a("any") },
        { json: "collectedIssues", js: "collectedIssues", typ: a(r("SeriesComics")) },
        { json: "dates", js: "dates", typ: a(r("DateElementComics")) },
        { json: "prices", js: "prices", typ: a(r("PriceComics")) },
        { json: "thumbnail", js: "thumbnail", typ: r("ThumbnailComics") },
        { json: "images", js: "images", typ: a(r("ThumbnailComics")) },
        { json: "creators", js: "creators", typ: r("CreatorsComics") },
        { json: "characters", js: "characters", typ: r("CharactersComics") },
        { json: "stories", js: "stories", typ: r("StoriesComics") },
        { json: "events", js: "events", typ: r("CharactersComics") },
    ], false),
    "CharactersComics": o([
        { json: "available", js: "available", typ: 0 },
        { json: "collectionURI", js: "collectionURI", typ: "" },
        { json: "items", js: "items", typ: a(r("SeriesComics")) },
        { json: "returned", js: "returned", typ: 0 },
    ], false),
    "SeriesComics": o([
        { json: "resourceURI", js: "resourceURI", typ: "" },
        { json: "name", js: "name", typ: "" },
    ], false),
    "CreatorsComics": o([
        { json: "available", js: "available", typ: 0 },
        { json: "collectionURI", js: "collectionURI", typ: "" },
        { json: "items", js: "items", typ: a(r("CreatorsComicsItem")) },
        { json: "returned", js: "returned", typ: 0 },
    ], false),
    "CreatorsComicsItem": o([
        { json: "resourceURI", js: "resourceURI", typ: "" },
        { json: "name", js: "name", typ: "" },
        { json: "role", js: "role", typ: r("Role") },
    ], false),
    "DateElementComics": o([
        { json: "type", js: "type", typ: r("DateType") },
        { json: "date", js: "date", typ: "" },
    ], false),
    "ThumbnailComics": o([
        { json: "path", js: "path", typ: "" },
        { json: "extension", js: "extension", typ: r("Extension") },
    ], false),
    "PriceComics": o([
        { json: "type", js: "type", typ: r("PriceComicsType") },
        { json: "price", js: "price", typ: 3.14 },
    ], false),
    "StoriesComics": o([
        { json: "available", js: "available", typ: 0 },
        { json: "collectionURI", js: "collectionURI", typ: "" },
        { json: "items", js: "items", typ: a(r("StoriesComicsItem")) },
        { json: "returned", js: "returned", typ: 0 },
    ], false),
    "StoriesComicsItem": o([
        { json: "resourceURI", js: "resourceURI", typ: "" },
        { json: "name", js: "name", typ: "" },
        { json: "type", js: "type", typ: r("ItemType") },
    ], false),
    "TextObjectComics": o([
        { json: "type", js: "type", typ: r("TextObjectComicsType") },
        { json: "language", js: "language", typ: r("Language") },
        { json: "text", js: "text", typ: "" },
    ], false),
    "URLComics": o([
        { json: "type", js: "type", typ: r("URLType") },
        { json: "url", js: "url", typ: "" },
    ], false),
    "Role": [
        "colorist",
        "editor",
        "inker",
        "letterer",
        "penciler",
        "penciller",
        "penciller (cover)",
        "writer",
    ],
    "DateType": [
        "digitalPurchaseDate",
        "focDate",
        "onsaleDate",
        "unlimitedDate",
    ],
    "DiamondCode": [
        "",
        "JUL190068",
    ],
    "Format": [
        "Comic",
        "Digest",
        "",
        "Trade Paperback",
    ],
    "Extension": [
        "jpg",
    ],
    "PriceComicsType": [
        "digitalPurchasePriceComics",
        "printPriceComics",
    ],
    "ItemType": [
        "cover",
        "interiorStory",
        "promo",
    ],
    "Language": [
        "en-us",
    ],
    "TextObjectComicsType": [
        "issue_solicit_text",
    ],
    "URLType": [
        "detail",
        "inAppLink",
        "purchase",
        "reader",
    ],
};

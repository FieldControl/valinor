import { attest, bench } from "@ark/attest";
import { expectTypeOf } from "expect-type";
import { setup } from "@ark/attest";
setup({
    updateSnapshots: !process.env.CI,
});
function test(name, fn) {
    fn(name + ": ");
}
test("unmasks deeply nested fragments", function (prefix) {
    bench(prefix + "instantiations", function () {
        return {};
    }).types([5, "instantiations"]);
    bench(prefix + "functionality", function () {
        expectTypeOf().toEqualTypeOf();
    });
});
test("unmasks deeply nested fragments", function (prefix) {
    bench(prefix + "instantiations", function () {
        return {};
    }).types([5, "instantiations"]);
    bench(prefix + "functionality", function () {
        expectTypeOf().toEqualTypeOf();
    });
});
test("unmasks deeply nested nullable fragments", function (prefix) {
    bench(prefix + "instantiations", function () {
        return {};
    }).types([5, "instantiations"]);
    bench(prefix + "functionality", function () {
        expectTypeOf().toEqualTypeOf();
    });
});
test("unmasks DeepPartial types", function (prefix) {
    bench(prefix + "instantiations", function () {
        return {};
    }).types([5, "instantiations"]);
    bench(prefix + "functionality", function () {
        expectTypeOf().toEqualTypeOf();
    });
});
test("Unmasked handles odd types", function (prefix) {
    bench(prefix + "empty type instantiations", function () {
        attest();
    }).types([111, "instantiations"]);
    bench(prefix + "empty type functionality", function () {
        expectTypeOf().toEqualTypeOf();
    });
    bench(prefix + "generic record type instantiations", function () {
        attest();
    }).types([115, "instantiations"]);
    bench(prefix + "generic record type functionality", function () {
        expectTypeOf().toEqualTypeOf();
    });
    bench(prefix + "unknown instantiations", function () {
        attest();
    }).types([47, "instantiations"]);
    bench(prefix + "unknown functionality", function () {
        expectTypeOf().toBeUnknown();
    });
    bench(prefix + "any instantiations", function () {
        attest();
    }).types([48, "instantiations"]);
    bench(prefix + "any functionality", function () {
        expectTypeOf().toBeAny();
    });
});
test("MaybeMasked handles odd types", function (prefix) {
    bench(prefix + "empty type instantiations", function () {
        attest();
    }).types([41, "instantiations"]);
    bench(prefix + "empty type functionality", function () {
        expectTypeOf().toEqualTypeOf();
    });
    bench(prefix + "generic record type instantiations", function () {
        attest();
    }).types([46, "instantiations"]);
    bench(prefix + "generic record type functionality", function () {
        expectTypeOf().toEqualTypeOf();
    });
    bench(prefix + "unknown instantiations", function () {
        attest();
    }).types([41, "instantiations"]);
    bench(prefix + "unknown functionality", function () {
        expectTypeOf().toBeUnknown();
    });
    bench(prefix + "any instantiations", function () {
        attest();
    }).types([43, "instantiations"]);
    bench(prefix + "any functionality", function () {
        expectTypeOf().toBeAny();
    });
});
test("distributed members on MaybeMasked", function (prefix) {
    (function unresolvedGeneric() {
        bench(prefix + "one unresolved generic mixed with null|undefined", function () {
            attest();
        }).types([49, "instantiations"]);
    })();
    (function unresolvedGenerics() {
        bench(prefix + "two unresolved generics distribute", function () {
            attest();
        }).types([50, "instantiations"]);
    })();
});
test("deals with overlapping array from parent fragment", function (prefix) {
    bench(prefix + "instantiations", function () {
        return {};
    }).types([5, "instantiations"]);
    bench(prefix + "functionality", function () {
        var _a, _b, _c, _d, _e, _f;
        var x = {};
        // some fields for hovering
        x.id;
        x.artists;
        (_b = (_a = x.artists) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.id;
        (_d = (_c = x.artists) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.birthdate;
        (_f = (_e = x.artists) === null || _e === void 0 ? void 0 : _e[0]) === null || _f === void 0 ? void 0 : _f.lastname;
        expectTypeOf(x).branded.toEqualTypeOf();
    });
});
test("base type, multiple fragments on sub-types", function (prefix) {
    bench(prefix + "instantiations", function () {
        return {};
    }).types([5, "instantiations"]);
    bench(prefix + "functionality", function () {
        var x = {};
        expectTypeOf(x).branded.toEqualTypeOf();
    });
});
test("does not detect `$fragmentRefs` if type contains `any`", function (prefix) {
    bench(prefix + "instantiations", function () {
        return {};
    }).types([1, "instantiations"]);
    bench(prefix + "functionality", function () {
        var x = {};
        expectTypeOf(x).branded.toEqualTypeOf();
    });
});
test("leaves tuples alone", function (prefix) {
    bench(prefix + "instantiations", function () {
        return {};
    }).types([5, "instantiations"]);
    bench(prefix + "functionality", function () {
        var x = {};
        expectTypeOf(x).branded.toEqualTypeOf();
    });
});
test("does not detect `$fragmentRefs` if type is a record type", function (prefix) {
    bench(prefix + "instantiations", function () {
        return {};
    }).types([1, "instantiations"]);
    bench(prefix + "functionality", function () {
        var x = {};
        expectTypeOf(x).branded.toEqualTypeOf();
    });
});
test("does not detect `$fragmentRefs` on types with index signatures", function (prefix) {
    bench(prefix + "instantiations", function () {
        return {};
    }).types([1, "instantiations"]);
    bench(prefix + "functionality", function () {
        var x = {};
        expectTypeOf(x).branded.toEqualTypeOf();
    });
});
test("detects `$fragmentRefs` on types with index signatures", function (prefix) {
    bench(prefix + "instantiations", function () {
        return {};
    }).types([1, "instantiations"]);
    bench(prefix + "functionality", function () {
        var x = {};
        var y = {};
        expectTypeOf(x).branded.toEqualTypeOf();
        expectTypeOf(y).toEqualTypeOf();
    });
});
test("recursive types: no error 'Type instantiation is excessively deep and possibly infinite.'", function (prefix) {
    bench(prefix + "instantiations", function () {
        return {};
    }).types([1, "instantiations"]);
    bench(prefix + "functionality", function () {
        var x = {};
        expectTypeOf(x).branded.toEqualTypeOf();
    });
});
test("MaybeMasked can be called with a generic if `mode` is not set to `unmask`", function (prefix) {
    function withGenericResult(arg) {
        bench(prefix + "Result generic - instantiations", function () {
            var maybeMasked = arg;
            return maybeMasked;
        }).types([1, "instantiations"]);
        bench(prefix + "Result generic - functionality", function () {
            var maybeMasked = arg;
            expectTypeOf(maybeMasked).toEqualTypeOf(arg);
        });
    }
    function withGenericDocument(arg) {
        bench(prefix + "Result generic - instantiations", function () {
            var maybeMasked = arg;
            return maybeMasked;
        }).types([1, "instantiations"]);
        bench(prefix + "Result generic - functionality", function () {
            var maybeMasked = arg;
            // cannot use unresolved generic with `expectTypeOf` here so we just try an assignment the other way round
            var test = maybeMasked;
            return test;
        });
    }
    withGenericResult({});
    withGenericDocument({});
});
test("Unmasked handles branded primitive types", function (prefix) {
    bench(prefix + "instantiations", function () {
        return {};
    }).types([5, "instantiations"]);
    bench(prefix + "functionality", function () {
        var x = {};
        expectTypeOf(x).branded.toEqualTypeOf();
    });
});
//# sourceMappingURL=types.bench.js.map
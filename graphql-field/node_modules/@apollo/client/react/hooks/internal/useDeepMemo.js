import * as React from "rehackt";
import { equal } from "@wry/equality";
export function useDeepMemo(memoFn, deps) {
    var ref = React.useRef(void 0);
    if (!ref.current || !equal(ref.current.deps, deps)) {
        // eslint-disable-next-line react-compiler/react-compiler
        ref.current = { value: memoFn(), deps: deps };
    }
    return ref.current.value;
}
//# sourceMappingURL=useDeepMemo.js.map
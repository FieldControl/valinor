import { httpsCallable as httpsCallable$1 } from 'firebase/functions';
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function httpsCallable(functions, name, options) {
    var callable = httpsCallable$1(functions, name, options);
    return function (data) {
        return from(callable(data)).pipe(map(function (r) { return r.data; }));
    };
}

export { httpsCallable };
//# sourceMappingURL=index.esm.js.map

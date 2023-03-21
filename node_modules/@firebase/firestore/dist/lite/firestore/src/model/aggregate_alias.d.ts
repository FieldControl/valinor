/**
 * @license
 * Copyright 2022 Google LLC
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
/**
 * An alias for aggregation results.
 * @internal
 */
export declare class AggregateAlias {
    private alias;
    /**
     * @internal
     * @param alias Un-escaped alias representation
     */
    constructor(alias: string);
    /**
     * Returns true if the string could be used as an alias.
     */
    private static isValidAlias;
    /**
     * Return an escaped and quoted string representation of the alias.
     */
    canonicalString(): string;
}

"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.askQuestion = exports.askConfirmation = void 0;
const tty_1 = require("./tty");
async function askConfirmation(message, defaultResponse, noTTYResponse) {
    if (!(0, tty_1.isTTY)()) {
        return noTTYResponse !== null && noTTYResponse !== void 0 ? noTTYResponse : defaultResponse;
    }
    const question = {
        type: 'confirm',
        name: 'confirmation',
        prefix: '',
        message,
        default: defaultResponse,
    };
    const { prompt } = await Promise.resolve().then(() => __importStar(require('inquirer')));
    const answers = await prompt([question]);
    return answers['confirmation'];
}
exports.askConfirmation = askConfirmation;
async function askQuestion(message, choices, defaultResponseIndex, noTTYResponse) {
    if (!(0, tty_1.isTTY)()) {
        return noTTYResponse;
    }
    const question = {
        type: 'list',
        name: 'answer',
        prefix: '',
        message,
        choices,
        default: defaultResponseIndex,
    };
    const { prompt } = await Promise.resolve().then(() => __importStar(require('inquirer')));
    const answers = await prompt([question]);
    return answers['answer'];
}
exports.askQuestion = askQuestion;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvbXB0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvYW5ndWxhci9jbGkvc3JjL3V0aWxpdGllcy9wcm9tcHQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFHSCwrQkFBOEI7QUFFdkIsS0FBSyxVQUFVLGVBQWUsQ0FDbkMsT0FBZSxFQUNmLGVBQXdCLEVBQ3hCLGFBQXVCO0lBRXZCLElBQUksQ0FBQyxJQUFBLFdBQUssR0FBRSxFQUFFO1FBQ1osT0FBTyxhQUFhLGFBQWIsYUFBYSxjQUFiLGFBQWEsR0FBSSxlQUFlLENBQUM7S0FDekM7SUFDRCxNQUFNLFFBQVEsR0FBYTtRQUN6QixJQUFJLEVBQUUsU0FBUztRQUNmLElBQUksRUFBRSxjQUFjO1FBQ3BCLE1BQU0sRUFBRSxFQUFFO1FBQ1YsT0FBTztRQUNQLE9BQU8sRUFBRSxlQUFlO0tBQ3pCLENBQUM7SUFFRixNQUFNLEVBQUUsTUFBTSxFQUFFLEdBQUcsd0RBQWEsVUFBVSxHQUFDLENBQUM7SUFDNUMsTUFBTSxPQUFPLEdBQUcsTUFBTSxNQUFNLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO0lBRXpDLE9BQU8sT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBQ2pDLENBQUM7QUFwQkQsMENBb0JDO0FBRU0sS0FBSyxVQUFVLFdBQVcsQ0FDL0IsT0FBZSxFQUNmLE9BQTRCLEVBQzVCLG9CQUE0QixFQUM1QixhQUE0QjtJQUU1QixJQUFJLENBQUMsSUFBQSxXQUFLLEdBQUUsRUFBRTtRQUNaLE9BQU8sYUFBYSxDQUFDO0tBQ3RCO0lBQ0QsTUFBTSxRQUFRLEdBQWlCO1FBQzdCLElBQUksRUFBRSxNQUFNO1FBQ1osSUFBSSxFQUFFLFFBQVE7UUFDZCxNQUFNLEVBQUUsRUFBRTtRQUNWLE9BQU87UUFDUCxPQUFPO1FBQ1AsT0FBTyxFQUFFLG9CQUFvQjtLQUM5QixDQUFDO0lBRUYsTUFBTSxFQUFFLE1BQU0sRUFBRSxHQUFHLHdEQUFhLFVBQVUsR0FBQyxDQUFDO0lBQzVDLE1BQU0sT0FBTyxHQUFHLE1BQU0sTUFBTSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztJQUV6QyxPQUFPLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUMzQixDQUFDO0FBdEJELGtDQXNCQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgdHlwZSB7IExpc3RDaG9pY2VPcHRpb25zLCBMaXN0UXVlc3Rpb24sIFF1ZXN0aW9uIH0gZnJvbSAnaW5xdWlyZXInO1xuaW1wb3J0IHsgaXNUVFkgfSBmcm9tICcuL3R0eSc7XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBhc2tDb25maXJtYXRpb24oXG4gIG1lc3NhZ2U6IHN0cmluZyxcbiAgZGVmYXVsdFJlc3BvbnNlOiBib29sZWFuLFxuICBub1RUWVJlc3BvbnNlPzogYm9vbGVhbixcbik6IFByb21pc2U8Ym9vbGVhbj4ge1xuICBpZiAoIWlzVFRZKCkpIHtcbiAgICByZXR1cm4gbm9UVFlSZXNwb25zZSA/PyBkZWZhdWx0UmVzcG9uc2U7XG4gIH1cbiAgY29uc3QgcXVlc3Rpb246IFF1ZXN0aW9uID0ge1xuICAgIHR5cGU6ICdjb25maXJtJyxcbiAgICBuYW1lOiAnY29uZmlybWF0aW9uJyxcbiAgICBwcmVmaXg6ICcnLFxuICAgIG1lc3NhZ2UsXG4gICAgZGVmYXVsdDogZGVmYXVsdFJlc3BvbnNlLFxuICB9O1xuXG4gIGNvbnN0IHsgcHJvbXB0IH0gPSBhd2FpdCBpbXBvcnQoJ2lucXVpcmVyJyk7XG4gIGNvbnN0IGFuc3dlcnMgPSBhd2FpdCBwcm9tcHQoW3F1ZXN0aW9uXSk7XG5cbiAgcmV0dXJuIGFuc3dlcnNbJ2NvbmZpcm1hdGlvbiddO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYXNrUXVlc3Rpb24oXG4gIG1lc3NhZ2U6IHN0cmluZyxcbiAgY2hvaWNlczogTGlzdENob2ljZU9wdGlvbnNbXSxcbiAgZGVmYXVsdFJlc3BvbnNlSW5kZXg6IG51bWJlcixcbiAgbm9UVFlSZXNwb25zZTogbnVsbCB8IHN0cmluZyxcbik6IFByb21pc2U8c3RyaW5nIHwgbnVsbD4ge1xuICBpZiAoIWlzVFRZKCkpIHtcbiAgICByZXR1cm4gbm9UVFlSZXNwb25zZTtcbiAgfVxuICBjb25zdCBxdWVzdGlvbjogTGlzdFF1ZXN0aW9uID0ge1xuICAgIHR5cGU6ICdsaXN0JyxcbiAgICBuYW1lOiAnYW5zd2VyJyxcbiAgICBwcmVmaXg6ICcnLFxuICAgIG1lc3NhZ2UsXG4gICAgY2hvaWNlcyxcbiAgICBkZWZhdWx0OiBkZWZhdWx0UmVzcG9uc2VJbmRleCxcbiAgfTtcblxuICBjb25zdCB7IHByb21wdCB9ID0gYXdhaXQgaW1wb3J0KCdpbnF1aXJlcicpO1xuICBjb25zdCBhbnN3ZXJzID0gYXdhaXQgcHJvbXB0KFtxdWVzdGlvbl0pO1xuXG4gIHJldHVybiBhbnN3ZXJzWydhbnN3ZXInXTtcbn1cbiJdfQ==
"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Spinner = void 0;
const ora = require("ora");
const color_1 = require("./color");
class Spinner {
    constructor(text) {
        /** When false, only fail messages will be displayed. */
        this.enabled = true;
        this.spinner = ora({
            text,
            // The below 2 options are needed because otherwise CTRL+C will be delayed
            // when the underlying process is sync.
            hideCursor: false,
            discardStdin: false,
        });
    }
    set text(text) {
        this.spinner.text = text;
    }
    succeed(text) {
        if (this.enabled) {
            this.spinner.succeed(text);
        }
    }
    info(text) {
        this.spinner.info(text);
    }
    fail(text) {
        this.spinner.fail(text && color_1.colors.redBright(text));
    }
    warn(text) {
        this.spinner.fail(text && color_1.colors.yellowBright(text));
    }
    stop() {
        this.spinner.stop();
    }
    start(text) {
        if (this.enabled) {
            this.spinner.start(text);
        }
    }
}
exports.Spinner = Spinner;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Stopper = void 0;
const https_1 = __importDefault(require("https"));
class Stopper {
    constructor(server) {
        this.server = server;
        this.requestCountPerSocket = new Map();
        this.stopped = false;
        server.on(server instanceof https_1.default.Server ? 'secureConnection' : 'connection', (socket) => {
            this.requestCountPerSocket.set(socket, 0);
            socket.once('close', () => this.requestCountPerSocket.delete(socket));
        });
        server.on('request', (req, res) => {
            this.requestCountPerSocket.set(req.socket, (this.requestCountPerSocket.get(req.socket) ?? 0) + 1);
            res.once('finish', () => {
                const pending = (this.requestCountPerSocket.get(req.socket) ?? 0) - 1;
                this.requestCountPerSocket.set(req.socket, pending);
                if (this.stopped && pending === 0) {
                    req.socket.end();
                }
            });
        });
    }
    async stop(hardDestroyAbortSignal) {
        let gracefully = true;
        await new Promise((resolve) => setImmediate(resolve));
        this.stopped = true;
        const onAbort = () => {
            gracefully = false;
            this.requestCountPerSocket.forEach((_, socket) => socket.end());
            setImmediate(() => {
                this.requestCountPerSocket.forEach((_, socket) => socket.destroy());
            });
        };
        hardDestroyAbortSignal?.addEventListener('abort', onAbort);
        const closePromise = new Promise((resolve) => this.server.close(() => {
            hardDestroyAbortSignal?.removeEventListener('abort', onAbort);
            resolve();
        }));
        this.requestCountPerSocket.forEach((requests, socket) => {
            if (requests === 0)
                socket.end();
        });
        await closePromise;
        return gracefully;
    }
}
exports.Stopper = Stopper;
//# sourceMappingURL=stoppable.js.map
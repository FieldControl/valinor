"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtService = void 0;
const common_1 = require("@nestjs/common");
const jwt = require("jsonwebtoken");
const interfaces_1 = require("./interfaces");
const jwt_constants_1 = require("./jwt.constants");
const jwt_errors_1 = require("./jwt.errors");
let JwtService = class JwtService {
    constructor(options = {}) {
        this.options = options;
        this.logger = new common_1.Logger('JwtService');
    }
    sign(payload, options) {
        const signOptions = this.mergeJwtOptions({ ...options }, 'signOptions');
        const secret = this.getSecretKey(payload, options, 'privateKey', interfaces_1.JwtSecretRequestType.SIGN);
        if (secret instanceof Promise) {
            secret.catch(() => { });
            this.logger.warn('For async version of "secretOrKeyProvider", please use "signAsync".');
            throw new jwt_errors_1.WrongSecretProviderError();
        }
        const allowedSignOptKeys = ['secret', 'privateKey'];
        const signOptKeys = Object.keys(signOptions);
        if (typeof payload === 'string' &&
            signOptKeys.some((k) => !allowedSignOptKeys.includes(k))) {
            throw new Error('Payload as string is not allowed with the following sign options: ' +
                signOptKeys.join(', '));
        }
        return jwt.sign(payload, secret, signOptions);
    }
    signAsync(payload, options) {
        const signOptions = this.mergeJwtOptions({ ...options }, 'signOptions');
        const secret = this.getSecretKey(payload, options, 'privateKey', interfaces_1.JwtSecretRequestType.SIGN);
        const allowedSignOptKeys = ['secret', 'privateKey'];
        const signOptKeys = Object.keys(signOptions);
        if (typeof payload === 'string' &&
            signOptKeys.some((k) => !allowedSignOptKeys.includes(k))) {
            throw new Error('Payload as string is not allowed with the following sign options: ' +
                signOptKeys.join(', '));
        }
        return new Promise((resolve, reject) => Promise.resolve()
            .then(() => secret)
            .then((scrt) => {
            jwt.sign(payload, scrt, signOptions, (err, encoded) => err ? reject(err) : resolve(encoded));
        }));
    }
    verify(token, options) {
        const verifyOptions = this.mergeJwtOptions({ ...options }, 'verifyOptions');
        const secret = this.getSecretKey(token, options, 'publicKey', interfaces_1.JwtSecretRequestType.VERIFY);
        if (secret instanceof Promise) {
            secret.catch(() => { });
            this.logger.warn('For async version of "secretOrKeyProvider", please use "verifyAsync".');
            throw new jwt_errors_1.WrongSecretProviderError();
        }
        return jwt.verify(token, secret, verifyOptions);
    }
    verifyAsync(token, options) {
        const verifyOptions = this.mergeJwtOptions({ ...options }, 'verifyOptions');
        const secret = this.getSecretKey(token, options, 'publicKey', interfaces_1.JwtSecretRequestType.VERIFY);
        return new Promise((resolve, reject) => Promise.resolve()
            .then(() => secret)
            .then((scrt) => {
            jwt.verify(token, scrt, verifyOptions, (err, decoded) => err ? reject(err) : resolve(decoded));
        })
            .catch(reject));
    }
    decode(token, options) {
        return jwt.decode(token, options);
    }
    mergeJwtOptions(options, key) {
        delete options.secret;
        if (key === 'signOptions') {
            delete options.privateKey;
        }
        else {
            delete options.publicKey;
        }
        return options
            ? {
                ...(this.options[key] || {}),
                ...options
            }
            : this.options[key];
    }
    overrideSecretFromOptions(secret) {
        if (this.options.secretOrPrivateKey) {
            this.logger.warn(`"secretOrPrivateKey" has been deprecated, please use the new explicit "secret" or use "secretOrKeyProvider" or "privateKey"/"publicKey" exclusively.`);
            secret = this.options.secretOrPrivateKey;
        }
        return secret;
    }
    getSecretKey(token, options, key, secretRequestType) {
        const secret = this.options.secretOrKeyProvider
            ? this.options.secretOrKeyProvider(secretRequestType, token, options)
            : options?.secret ||
                this.options.secret ||
                (key === 'privateKey'
                    ? options?.privateKey || this.options.privateKey
                    : options?.publicKey ||
                        this.options.publicKey) ||
                this.options[key];
        return secret instanceof Promise
            ? secret.then((sec) => this.overrideSecretFromOptions(sec))
            : this.overrideSecretFromOptions(secret);
    }
};
exports.JwtService = JwtService;
exports.JwtService = JwtService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Optional)()),
    __param(0, (0, common_1.Inject)(jwt_constants_1.JWT_MODULE_OPTIONS)),
    __metadata("design:paramtypes", [Object])
], JwtService);

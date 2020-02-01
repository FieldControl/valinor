import { Injectable } from '@angular/core';

import { Resolve } from '@angular/router';

@Injectable()
export class ResolverService implements Resolve<Promise<any>> {
    constructor() { }

    resolve() {
        return new Promise<any>((resolve, reject) => {
            try {
                setTimeout(() => {
                    resolve(console.log('Resolver example'));
                }, 2000)
            } catch (error) {
                reject(error);
            }
        });
    }
}
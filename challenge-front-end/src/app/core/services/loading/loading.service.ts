import { Injectable } from '@angular/core';

@Injectable()
export class LoadingService {
    isLoading = true;
    constructor() {
    }

    loadingHide() {
        this.isLoading = false;
    }

    loadingShow() {
        this.isLoading = true;
    }
}

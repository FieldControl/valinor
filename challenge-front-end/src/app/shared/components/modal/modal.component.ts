import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DynamicComponentCreatorService } from 'app/core/services';

@Component({
    selector: 'app-modal',
    templateUrl: './modal.component.html',
    styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit {
    constructor(
        private _dcc: DynamicComponentCreatorService
    ) { }

    @Input() title = '';
    @Output() destroy = new EventEmitter();

    ngOnInit(): void { }

    close() {
        this.destroy.emit('destroyed');
        this._dcc.destroy('modal');
    }
}

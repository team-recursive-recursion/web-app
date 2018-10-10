/***
 * Filename: point-dialog.component.ts
 * Author  : Duncan Tilley
 * Class   : PointDialog / <point-dialog>
 ***/

import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Point_t } from '../../../interfaces/enum.interface';

@Component({
    selector: 'point-dialog',
    templateUrl: './point-dialog.component.html'
})
export class PointDialog {

    pointTypes = [
        { "typeName": 'Pin', "ptype": Point_t.P_PIN },
        { "typeName": 'Hole', "ptype": Point_t.P_HOLE },
        { "typeName": 'Tee', "ptype": Point_t.P_TEE }
    ];

    pointType: number = -1;
    info: string = "";

    constructor(public dialogRef: MatDialogRef<PointDialog>,
            @Inject(MAT_DIALOG_DATA) public data: any)
    {}

    onCancelClick(): void {
        this.dialogRef.close({done: false});
    }

    onDoneClick(): void {
        if (this.pointType != -1) {
            // get point info
            var info: string = this.info;
            if (info == "Optional Info" || info === undefined) {
                info = "";
            }
            this.dialogRef.close(
                {
                    done: true,
                    type: this.pointType,
                    info: info
                }
            );
        } else {
            // TODO ?
        }
    }

}

/***
 * Filename: area-dialog.component.ts
 * Author  : Duncan Tilley
 * Class   : AreaDialog / <polygon-dialog>
 ***/

import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { AreaType } from '../class/element';

@Component({
    selector: 'area-dialog',
    templateUrl: './area-dialog.component.html'
})
export class AreaDialog {

    terrainTypes = [
        { "typeName": 'Rough', "ttype": AreaType.ROUGH },
        { "typeName": 'Fairway', "ttype": AreaType.FAIR },
        { "typeName": 'Green', "ttype": AreaType.GREEN },
        { "typeName": 'Bunker', "ttype": AreaType.BUNKER },
        { "typeName": 'Water Hazard', "ttype": AreaType.WATER }
    ];

    public polyType: number = -1;

    constructor(public dialogRef: MatDialogRef<AreaDialog>,
            @Inject(MAT_DIALOG_DATA) public data: any)
    {}

    onCancelClick(): void {
        this.dialogRef.close({done: false});
    }

    onDoneClick(): void {
        if (this.polyType != -1) {
            this.dialogRef.close(
                {
                    done: true,
                    type: this.polyType
                }
            );
        }
    }

}

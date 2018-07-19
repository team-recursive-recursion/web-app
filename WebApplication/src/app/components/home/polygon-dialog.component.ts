/***
 * Filename: home.component.ts
 * Author  : Duncan Tilley
 * Class   : PolygonDialog / <polygon-dialog>
 ***/

import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Polygon_t } from '../../interfaces/enum.interface';

@Component({
    selector: 'polygon-dialog',
    templateUrl: './polygon-dialog.component.html'
})
export class PolygonDialog {

    terrainTypes = [
        { "typeName": 'Rough', "ttype": Polygon_t.P_ROUGH },
        { "typeName": 'Fairway', "ttype": Polygon_t.P_FAIR },
        { "typeName": 'Green', "ttype": Polygon_t.P_GREEN },
        { "typeName": 'Bunker', "ttype": Polygon_t.P_BUNKER },
        { "typeName": 'Water Hazard', "ttype": Polygon_t.P_WATER }
    ];

    public polyType: number = -1;

    constructor(public dialogRef: MatDialogRef<PolygonDialog>,
            @Inject(MAT_DIALOG_DATA) public data: any)
    {}

    onDoneClick(): void {
        if (this.polyType != -1) {
            this.dialogRef.close(true);
        } else {
            // TODO ?
        }
    }

}

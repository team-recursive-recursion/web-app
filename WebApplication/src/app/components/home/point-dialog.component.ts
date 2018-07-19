/***
 * Filename: home.component.ts
 * Author  : Duncan Tilley
 * Class   : PointDialog / <point-dialog>
 ***/

import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
    selector: 'point-dialog',
    templateUrl: './point-dialog.component.html'
})
export class PointDialog {

    constructor(public dialogRef: MatDialogRef<PointDialog>,
            @Inject(MAT_DIALOG_DATA) public data: any)
    {}

}

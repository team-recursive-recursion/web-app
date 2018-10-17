/***
 * Filename: confirm-dialog.component.ts
 * Author  : Duncan Tilley
 * Class   : ConfirmDialog / <confirm-dialog>
 ***/

import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
    selector: 'confirm-dialog',
    templateUrl: './confirm-dialog.component.html'
})
export class ConfirmDialog {

    constructor(public dialogRef: MatDialogRef<ConfirmDialog>,
        @Inject(MAT_DIALOG_DATA) public data: any)
    {}

    onYesClick(): void {
        this.dialogRef.close({choice: true});
    }

    onCancelClick(): void {
        this.dialogRef.close({choice: false})
    }

}

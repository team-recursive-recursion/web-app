/***
 * Filename: hole-dialog.component.ts
 * Author  : Duncan Tilley
 * Class   : HoleDialog / <hole-dialog>
 ***/

import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
    selector: 'hole-dialog',
    templateUrl: './hole-dialog.component.html'
})
export class HoleDialog {

    name: string = "";
    par: number = 3;

    constructor(public dialogRef: MatDialogRef<HoleDialog>,
            @Inject(MAT_DIALOG_DATA) public data: any)
    {}

    onCancelClick(): void {
        this.dialogRef.close({done: false});
    }

    onDoneClick(): void {
        if (this.par != -1 && this.name !== undefined &&
                this.name != "Hole Name") {
            this.dialogRef.close(
                {
                    done: true,
                    name: this.name,
                    par: "" + this.par
                }
            );
        } else {
            // TODO ?
        }
    }

}

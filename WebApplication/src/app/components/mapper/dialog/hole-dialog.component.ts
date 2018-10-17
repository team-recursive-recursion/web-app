/***
 * Filename: hole-dialog.component.ts
 * Author  : Duncan Tilley
 * Class   : HoleDialog / <hole-dialog>
 ***/

import { Component, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Hole } from '../class/hole';
import { InfoDialog, InfoType } from '../../dialog/info-dialog.component';

@Component({
    selector: 'hole-dialog',
    templateUrl: './hole-dialog.component.html'
})
export class HoleDialog {

    name: string = "";
    par: number = 3;
    holes: Array<Hole>;

    oldName: string;
    oldPar: number;
    update: boolean;

    constructor(
            public dialog: MatDialog,
            public dialogRef: MatDialogRef<HoleDialog>,
            @Inject(MAT_DIALOG_DATA) public data: any) {
        this.holes = data.holes;
        this.update = data.update;
        if (data.update) {
            this.name = data.name;
            this.oldName = this.name;
            this.par = +data.par;
            this.oldPar = this.par;
        } else {
            this.name = "Hole " + (this.holes.length + 1);
        }
    }

    onCancelClick(): void {
        this.dialogRef.close({done: false});
    }

    onDoneClick(): void {
        if (this.update) {
            if (this.name != this.oldName && this.isUsed(this.name)) {
                this.dialog.open(InfoDialog, {data: {
                    message: "Name '" + this.name + "' is already used",
                    type: InfoType.ERROR
                }});
            } else if (this.name != this.oldName || this.par != this.oldPar) {
                if (this.par != -1 && this.name !== undefined &&
                    this.name != "Hole Name" && this.name != "") {
                    this.dialogRef.close(
                        {
                            done: true,
                            name: this.name,
                            par: "" + this.par
                        }
                    );
                }
            } else {
                this.dialogRef.close({done: false});
            }
        } else {
            if (this.isUsed(this.name)) {
                this.dialog.open(InfoDialog, {data: {
                    message: "Name '" + this.name + "' is already used",
                    type: InfoType.ERROR
                }});
            } else {
                if (this.par != -1 && this.name !== undefined &&
                    this.name != "Hole Name" && this.name != "") {
                    this.dialogRef.close(
                        {
                            done: true,
                            name: this.name,
                            par: "" + this.par
                        }
                    );
                }
            }
        }
    }

    /***
     * isUsed(string) : boolean
     *
     *     Returns true if the hole name is already in use.
     ***/
    private isUsed(name: string) : boolean {
        name = name.toLowerCase();
        var found = false;
        var i = 0;
        while (!found && i < this.holes.length) {
            if (this.holes[i].getName().toLowerCase() == name) {
                found = true;
            } else {
                ++i;
            }
        }
        return found;
    }

}

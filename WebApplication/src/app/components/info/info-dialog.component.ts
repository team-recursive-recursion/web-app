/***
 * Filename: error-dialog.component.ts
 * Author  : Duncan Tilley
 * Class   : InfoDialog / <info-dialog>
 ***/

import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

export enum InfoType {
    ERROR, INFO, WARNING, SUCCESS
}

@Component({
    selector: 'info-dialog',
    templateUrl: './info-dialog.component.html'
})
export class InfoDialog {

    public message: string;
    public icon: string;
    public color: string;

    constructor(public dialogRef: MatDialogRef<InfoDialog>,
        @Inject(MAT_DIALOG_DATA) public data: any)
    {
        this.icon = "error";
        this.color = "#f14848";
        this.message = "An unexpected error has occured";
        if (data != undefined) {
            if (data.type != undefined) {
                switch (data.type) {
                    case InfoType.INFO:
                        this.icon = "info";
                        this.color = "#4a5bc3";
                        break;
                    case InfoType.WARNING:
                        this.icon = "warning";
                        this.color = "#c3a24a";
                        break;
                    case InfoType.SUCCESS:
                        this.icon = "check_circle";
                        this.color = "#8bc34a";
                        break;
                }
            }
            if (data.message != undefined) {
                this.message = data.message;
            }
        }
    }

    onOkClick(): void {
        this.dialogRef.close();
    }

}

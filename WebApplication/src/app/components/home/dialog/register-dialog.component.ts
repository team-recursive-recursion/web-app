/***
 * Filename: register-dialog.component.ts
 * Author  : Duncan Tilley
 * Class   : RegisterDialog / <register-dialog>
 ***/

import { Component, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ApiService } from 'src/app/services/api/api.service';
import { InfoDialog, InfoType } from '../../dialog/info-dialog.component';

@Component({
    selector: 'register-dialog',
    templateUrl: './register-dialog.component.html'
})
export class RegisterDialog {

    email: string;
    firstname: string;
    lastname: string;
    password: string;
    passwordConf: string;

    constructor(
        public dialogRef: MatDialogRef<RegisterDialog>,
        private api: ApiService,
        public dialog: MatDialog,
        @Inject(MAT_DIALOG_DATA) public data: any)
    {}

    onCancelClick(): void {
        this.dialogRef.close({done: false});
    }

    onDoneClick(): void {
        if (this.verifyDetails()) {
            this.api.usersCreate(this.email, this.firstname, this.lastname,
                    this.password)
                .subscribe(

                    result => {
                        this.dialog.open(InfoDialog, {data: {
                            message: "Registration completed successfully",
                            type: InfoType.SUCCESS
                        }});
                        this.dialogRef.close({done: true});
                    },

                    error => {
                        var body = error.json();
                        if (body.message != undefined) {
                            this.dialog.open(InfoDialog, {data: {
                                message:body.message
                            }});
                        } else {
                            this.dialog.open(InfoDialog);
                        }
                    },

                    () => console.log("Registration successful")

                );
        } else {
            this.dialog.open(InfoDialog, {data: {
                message: "Verification failed"
            }});
        }
    }

    private verifyDetails(): boolean {
        // TODO
        return true;
    }

}


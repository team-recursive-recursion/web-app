/***
 * Filename: login-dialog.component.ts
 * Author  : Duncan Tilley
 * Class   : LoginDialog / <login-dialog>
 ***/

import { Component, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ApiService } from 'src/app/services/api/api.service';
import { GlobalsService } from 'src/app/services/globals/globals.service';
import { InfoDialog, InfoType } from '../../dialog/info-dialog.component';

@Component({
    selector: 'login-dialog',
    templateUrl: './login-dialog.component.html'
})
export class LoginDialog {

    public email: string;
    public password: string;

    constructor(
        private api: ApiService,
        private globals: GlobalsService,
        public dialog: MatDialog,
        public dialogRef: MatDialogRef<LoginDialog>,
        @Inject(MAT_DIALOG_DATA) public data: any)
    {}

    onCancelClick(): void {
        this.dialogRef.close({done: false});
    }

    onDoneClick(): void {
        this.api.usersMatch(this.email, this.password)
            .subscribe(
                result => {
                    var body = result.json();
                    this.globals.setUid(body.userID);
                    this.api.setBearerToken(body.token);
                    this.dialogRef.close({done:true});
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

                () => console.log("Login successful")
            );
    }

}

/***
 * Filename: register-dialog.component.ts
 * Author  : Duncan Tilley
 * Class   : RegisterDialog / <register-dialog>
 ***/

import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ApiService } from 'src/app/services/api/api.service';

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
                        window.alert("Registration completed successfully!");
                        this.dialogRef.close({done: true});
                    },

                    error => {
                        var body = error.json();
                        window.alert(body.message);
                    },

                    () => console.log("Registration successful")

                );
        } else {
            // TODO nice message or something
            window.alert("Verification Failed");
        }
    }

    private verifyDetails(): boolean {
        // TODO
        return true;
    }

}


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
        if (this.validateDetails()) {
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
        }
    }

    /***
     * validateDetails() : boolean
     *
     *     Returns true if all of the user information is valid.
     ***/
    public validateDetails(): boolean {
        return (this.nameValid() && this.emailValid() && this.passwordValid() &&
                this.passwordMatch());
    }

    /***
     * nameValid() : boolean
     *
     *     Returns true if the names are longer
     ***/
    public nameValid(): boolean {
        if (this.firstname.length > 0 && this.lastname.length > 0) {
            return true;
        } else {
            this.dialog.open(InfoDialog, {data: {
                message: "First and last name can not be empty"
            }});
            return false;
        }
    }

    /***
     * emailValid() : boolean
     *
     *     Returns true if the email is in a valid format.
     ***/
    public emailValid(): boolean {
        var at = this.email.indexOf("@");
        var dot = this.email.lastIndexOf(".");
        if (at > 0 && dot > at + 1) {
            return true;
        } else {
            this.dialog.open(InfoDialog, {data: {
                message: "Email must be a valid address"
            }});
            return false;
        }
    }

    /***
     * passwordValid() : boolean
     *
     *     Returns true if the password is at least 8 characters long.
     ***/
    public passwordValid(): boolean {
        if (this.password.length >= 8) {
            return true;
        } else {
            this.dialog.open(InfoDialog, {data: {
                message: "Password must contain at least 8 characters"
            }});
            return false;
        }
    }

    /***
     * passwordMatch() : boolean
     *
     *     Returns true if the confirmed password and password are the same.
     ***/
    public passwordMatch(): boolean {
        if (this.password == this.passwordConf) {
            return true;
        } else {
            this.dialog.open(InfoDialog, {data: {
                message: "Your confirmed password does not match the original"
            }});
            return false;
        }
    }

}


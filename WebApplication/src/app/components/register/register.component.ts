/***
 * Filename: register.component.ts
 * Author  : Duncan Tilley
 * Class   : RegisterComponent / <register>
 *
 *     The registration form of the mapper. User is asked to enter details
 *     and to submit the form on completion.
 ***/

import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api/api.service';

@Component({
    selector: 'register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss']
})
export class RegisterComponent {

    email: string;
    firstname: string;
    lastname: string;
    password: string;

    constructor(private router: Router, private api: ApiService) {
        this.email = "";
        this.firstname = "";
        this.lastname = "";
        this.password = "";
    }

    onCancel() {
        this.router.navigateByUrl("/login");
    }

    onSubmit() {
        if (this.verifyDetails()) {
            // TODO hash and possibly salt password
            this.api.usersCreate(this.email, this.firstname, this.lastname,
                    this.password)
                .subscribe(
                    result => this.onRequestReceive(result.headers,
                            result.json()),
                    error => this.onRequestFail(error.status, error.headers,
                            error.text()),
                    () => console.log("Registration completed successfully.")
                );
        }
    }

    onRequestReceive(headers: any, body: any) {
        // TODO nice message
        window.alert("Registration completed successfully!");
        this.router.navigateByUrl("/login");
    }

    onRequestFail(status: number, headers: any, body: any) {
        // TODO nice message
        window.alert(status + ": " + body);
    }

    private verifyDetails(): boolean {
        // TODO
        return true;
    }

}

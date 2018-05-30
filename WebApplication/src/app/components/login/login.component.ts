/***
 * Filename: login.component.ts
 * Author  : Duncan Tilley
 * Class   : LoginComponent / <login>
 * 
 *     The login form of the mapper. Simply asks for the username and password.
 ***/

import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
    selector: 'login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    providers: [ApiService]
})
export class LoginComponent {

    email: string;
    password: string;

    constructor(private router: Router, private api: ApiService) {
        this.email = "";
        this.password = "";
    }

    onRegister() {
        this.router.navigateByUrl("/register");
    }

    onSubmit() {
        // verify the user login details
        // TODO hash and possibly salt password
        this.api.userMatch(this.email, this.password)
            .subscribe(
                result => this.onRequestReceive(result.headers, result.json()),
                error => this.onRequestFail(error.status, error.headers,
                        error.text()),
                () => console.log("Login request passed successfully.")
            );
    }

    onRequestReceive(headers: any, body: any) {
        this.router.navigateByUrl("/mapper");
    }

    onRequestFail(status: number, headers: any, body: any) {
        // TODO nice message
        window.alert(body);
    }

}

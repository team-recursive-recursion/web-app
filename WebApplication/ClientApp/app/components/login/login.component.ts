/***
 * Filename: login.component.ts
 * Author  : Duncan Tilley
 * Class   : LoginComponent / <login>
 * 
 *     The login form of the mapper. Simply asks for the username and password.
 ***/

import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent {

    email: string;
    password: string;

    constructor(private router: Router) {
        this.email = "";
        this.password = "";
    }

    onSubmit() {
        window.alert("Submitted");
        // TODO verify login
        this.router.navigateByUrl("/mapper");
    }

}

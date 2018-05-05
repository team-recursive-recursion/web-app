/***
 * Filename: login.component.ts
 * Author  : Duncan Tilley
 * Class   : LoginComponent / <login>
 * 
 *     The login form of the mapper. Simply asks for the username and password.
 ***/

import { Component } from '@angular/core';

@Component({
    selector: 'login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent {

    username: string;
    password: string;

    constructor() {
        this.username = "";
        this.password = "";
    }

    onSubmit() {
        window.alert("Submitted");
    }

}

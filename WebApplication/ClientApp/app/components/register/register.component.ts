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

@Component({
    selector: 'register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.css']
})
export class RegisterComponent {

    email: string;
    firstname: string;
    lastname: string;
    password: string;

    constructor(private router: Router) {
        this.email = "";
        this.firstname = "";
        this.lastname = "";
        this.password = "";
    }

    onSubmit() {
        window.alert("Submitted");
        // TODO submit registration and go to login
    }

}

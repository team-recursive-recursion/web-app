/***
 * Filename: api.service.ts
 * Author  : Duncan Tilley
 * Class   : ApiService
 * 
 *     This service encapsulates API requests and should be used instead of
 *     directly making HTTP requests from the component.
 ***/

import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
@Injectable()
export class ApiService {

    url: string;

    constructor(private http: Http) {
        this.url = "localhost:5001";
    }

    /***
     * setApiUrl(string)
     * 
     *     Sets the base URL for API calls. Defaults as localhost:5001.
     ***/
    public setApiUrl(url: string) {
        this.url = url;
    }

    public getApiUrl(): string {
        return this.url;
    }

    getUsers() {
        return this.http.get(this.url + "/api/Users");
    }

    userMatch(email: string, password: string) {
        //return this.http.post(); // TODO
    }

    userCreate(email: string, firstname: string, lastname: string,
            password: string) {
        // TODO
    }

}

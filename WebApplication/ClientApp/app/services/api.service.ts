/***
 * Filename: api.service.ts
 * Author  : Duncan Tilley, Christiaan H Nel
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
        this.url = "http://localhost:5001";
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

    userMatch(email: string, password: string) {
        var url = this.url + "/api/Users/Match";
        return this.http.post(url,
                {"Email": email, "Password": password}
        );
    }

    userCreate(email: string, firstname: string, lastname: string,
            password: string) {
        var url = this.url + "/api/Users/Create";
        return this.http.post(url,
                {"Email": email, "Name": firstname, "Surname": lastname,
                "Password": password}
        );
    }

    /***
     *
     * API calls for map spesifics
     *
     ***/
    getCourses() {
        var url = this.url + "/api/GolfCoursesNew";
        return this.http.get(url);
    }

    getCourse(courseId: string) {
        var url = this.url + "/api/GolfCoursesNew/" + courseId;
        return this.http.get(url);
    }

    createCourse(name: string) {
        var url = this.url + "/api/GolfCoursesNew";

        return this.http.post(url, 
            { "courseName": name}
        );
    }
}

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
        var url = this.url + "/api/users/match";
        return this.http.post(url,
                {"Email": email, "Password": password}
        );
    }

    userCreate(email: string, firstname: string, lastname: string,
            password: string) {
        var url = this.url + "/api/users/create";
        return this.http.post(url,
                {"Email": email, "Name": firstname, "Surname": lastname,
                "Password": password}
        );
    }

    /***
     * API calls for map specifics. api/courses
     ***/
    getCourses() {
        var url = this.url + "/api/courses";
        return this.http.get(url);
    }

    getCourse(courseId: string) {
        var url = this.url + "/api/courses/" + courseId;
        return this.http.get(url);
    }

    createCourse(name: string) {
        var url = this.url + "/api/courses";

        return this.http.post(url, 
            { "courseName": name}
        );
    }

    deleteCourse(courseId: string) {
        var url = this.url + "/api/courses/" + courseId;
        return this.http.delete(url);
    }

    updateCourse(courseId: string, courseName: string) {
        var url = this.url + "/api/courses";
        return this.http.put(url, 
            {
                "courseId": courseId,
                "courseName": courseName
            }
        );
    }

    /***
     * API calls for map specifics. api/courses
     ***/
    getHoles() {
        var url = this.url + "/api/holes";
        return this.http.get(url);
    }

    getHole(holeId: string) {
        var url = this.url + "/api/holes/" + holeId;
        return this.http.get(url);
    }

    addHole(courseId: string, holeName: string) {
        var url = this.url + "/api/holes";

        return this.http.post(url, 
            {
                "Name": holeName,
                "courseName": courseId
            }
        );
    }

    updateHole(holeId: string, holeName: string) {
        var url = this.url + "/api/holes";

        return this.http.put(url, 
            {
                "HoleId": holeId,
                "Name": holeName
            }
        );
    }

    deleteHole(holeId: string) {
        var url = this.url + "/api/holes/" + holeId;
        return this.http.delete(url);
    }

    /***
     * API calls for map specifics. api/points
     ***/
    getPoints() {
        var url = this.url + "/api/points";
        return this.http.get(url);
    }

    getPoint(pointId: string) {
        var url = this.url + "/api/points/" + pointId;
        return this.http.get(url);
    }

    addPoint(pointId: string, courseId: string, holeId: string, typeOf: number, 
            geoJson: string) {
        var url = this.url + "/api/points";
        return this.http.post(url, 
            {
                "courseId": courseId,
                "holeId": holeId,
                "type": typeOf,
                "geoJson": geoJson
            }
        );
    }

    updatePoint(pointId: string, courseId: string, holeId: string, 
            geoJson: string, courseElementId: string, pointRaw: string, 
            typeOf: number) {
        var url = this.url + "/api/points/" + pointId;
        return this.http.put(url,
            {
                "type": typeOf,
                "pointRaw": pointRaw,
                "geoJson": geoJson,
                "courseElementId": courseElementId,
                "holeId": holeId,
                "courseId": courseId
            }
        );
    }

    deletePoint(pointId: string) {
        var url = this.url + "/api/points/" + pointId;
        return this.http.delete(url);
    }

    /***
     * API calls for map specifics. api/polygons
     ***/
    getPolygons() {
        var url = this.url + "/api/polygons";
        return this.http.get(url);
    }

    addPolygon(body: any) {
        var url = this.url + "/api/polygons";
        return this.http.post(url, body);
    }

    getPolygon(polygonId: string) {
        var url = this.url + "/api/polygons/" + polygonId;
        return this.http.get(url);
    }

    updatePolygon(courseElementId: string, body: any) {
        var url = this.url + "/api/polygons/" + courseElementId;
        console.log("url:" + url, body);
        return this.http.put(url, body);
    }

    deletePolygon(polygonId: string) {
        var url = this.url + "/api/polygons/" + polygonId;
        return this.http.delete(url);
    }
}

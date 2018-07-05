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

    /***
     * API calls: users
     ***/

    usersMatch(email: string, password: string) {
        var url = this.url + "/api/users/match";
        return this.http.post(url,
                {"Email": email, "Password": password}
        );
    }

    usersCreate(email: string, firstname: string, lastname: string,
            password: string) {
        var url = this.url + "/api/users";
        return this.http.post(url,
                {"Email": email, "Name": firstname, "Surname": lastname,
                "Password": password}
        );
    }

    /***
     * API calls: courses
     ***/

    coursesGet(uid: string) {
        var url = this.url + "/api/users/" + uid + "/courses";
        return this.http.get(url);
    }

    coursesCreate(uid: string, name: string) {
        var url = this.url + "/api/users/" + uid + "/courses";
        return this.http.post(url,
            {"CourseName": name}
        );
    }

    courseGet(cid: string) {
        var url = this.url + "/api/courses/" + cid;
        return this.http.get(url);
    }

    courseDelete(cid: string) {
        var url = this.url + "/api/courses/" + cid;
        return this.http.delete(url);
    }

    /***
     * API calls: holes
     ***/

    holesGet(cid: string) {
        var url = this.url + "/api/courses/" + cid + "/holes";
        return this.http.get(url);
    }

    holesCreate(cid: string, name: string) {
        var url = this.url + "/api/courses/" + cid + "/holes";
        return this.http.post(url,
            {"Name": name}
        );
    }

    holeGet(hid: string) {
        var url = this.url + "/api/holes/" + hid;
        return this.http.get(url);
    }

    holeDelete(hid: string) {
        var url = this.url + "/api/holes/" + hid;
        return this.http.delete(url);
    }

    /***
     * API calls: elements
     ***/

    courseGetElements(cid: string) {
        var url = this.url + "/api/courses/" + cid + "/elements";
        return this.http.get(url);
    }

    holeGetElements(hid: string) {
        var url = this.url + "/api/holes/" + hid + "/elements";
        return this.http.get(url);
    }

    /***
     * API calls: points
     ***/

    courseGetPoints(cid: string) {
        var url = this.url + "/api/courses/" + cid + "/points";
        return this.http.get(url);
    }

    courseCreatePoint(cid: string, type: number, info: string,
            geoJson: string) {
        var url = this.url + "/api/courses/" + cid + "/points";
        return this.http.post(url,
            {
                "PointType": type,
                "Info": info,
                "GeoJson": geoJson
            }
        );
    }

    holeGetPoints(hid: string) {
        var url = this.url + "/api/holes/" + hid + "/points";
        return this.http.get(url);
    }

    holeCreatePoint(hid: string, type: number, info: string, geoJson: string) {
        var url = this.url + "/api/holes/" + hid + "/points";
        return this.http.post(url,
            {
                "PointType": type,
                "Info": info,
                "GeoJson": geoJson
            }
        );
    }

    pointGet(eid: string) {
        var url = this.url + "/api/points/" + eid;
        return this.http.get(url);
    }

    pointDelete(eid: string) {
        var url = this.url + "/api/points/" + eid;
        return this.http.delete(url);
    }

    /***
     * API calls: polygons
     ***/

    courseGetPolygons(cid: string) {
        var url = this.url + "/api/courses/" + cid + "/polygons";
        return this.http.get(url);
    }

    courseCreatePolygon(cid: string, type: number, geoJson: string) {
        var url = this.url + "/api/courses/" + cid + "/polygons";
        return this.http.post(url,
            {
                "PolygonType": type,
                "GeoJson": geoJson
            }
        );
    }

    holeGetPolygons(hid: string) {
        var url = this.url + "/api/holes/" + hid + "/polygons";
        return this.http.get(url);
    }

    holeCreatePolygon(hid: string, type: number, geoJson: string) {
        var url = this.url + "/api/holes/" + hid + "/polygons";
        return this.http.post(url,
            {
                "PolygonType": type,
                "GeoJson": geoJson
            }
        );
    }

    polygonGet(eid: string) {
        var url = this.url + "/api/polygons/" + eid;
        return this.http.get(url);
    }

    polygonDelete(eid: string) {
        var url = this.url + "/api/polygons/" + eid;
        return this.http.delete(url);
    }

}

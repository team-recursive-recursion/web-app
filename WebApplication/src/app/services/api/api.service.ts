/***
 * Filename: api.service.ts
 * Author  : Duncan Tilley
 * Class   : ApiService
 *
 *     This service encapsulates API requests and should be used instead of
 *     directly making HTTP requests from the component.
 ***/

import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';

@Injectable()
export class ApiService {

    url: string;
    token: string;

    constructor(private http: Http) {
        this.url = "http://localhost:5001";
        this.token = "";
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
     * setBearerToken(string)
     *
     *     Sets the bearer token for authorization.
     ***/
    public setBearerToken(token: string) {
        this.token = token;
    }

    /***
     * createHeaders(): RequestOptions
     *
     *     Creates request headers for authorization.
     ***/
    private createHeaders() : RequestOptions {
        let headers = new Headers();
        headers.append('Authorization', 'Bearer ' + this.token);
        let opts = new RequestOptions();
        opts.headers = headers;
        return opts;
    }

    /***
     * API calls: users
     ***/

    public usersMatch(email: string, password: string) {
        var url = this.url + "/api/users/match";
        var SHA256 = require("crypto-js/sha256");
        password = SHA256(password).toString();
        return this.http.post(url,
                {"Email": email, "Password": password}
        );
    }

    public usersCreate(email: string, firstname: string, lastname: string,
            password: string) {
        var url = this.url + "/api/users";
        var SHA256 = require("crypto-js/sha256");
        password = SHA256(password).toString();
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

    public coursesCreate(uid: string, name: string, info: string) {
        var url = this.url + "/api/users/" + uid + "/courses";
        return this.http.post(url,
            {
                "CourseName": name,
                "Info": info
            },
            this.createHeaders()
        );
    }

    public courseGet(cid: string) {
        var url = this.url + "/api/courses/" + cid;
        return this.http.get(url);
    }

    public courseDelete(cid: string) {
        var url = this.url + "/api/courses/" + cid;
        return this.http.delete(url, this.createHeaders());
    }

    /***
     * API calls: holes
     ***/

    public holesGet(cid: string) {
        var url = this.url + "/api/courses/" + cid + "/holes";
        return this.http.get(url);
    }

    public holesCreate(cid: string, name: string, info: string) {
        var url = this.url + "/api/courses/" + cid + "/holes";
        return this.http.post(url,
            {
                "Name": name,
                "Info": info
            },
            this.createHeaders()
        );
    }

    public holeGet(hid: string) {
        var url = this.url + "/api/holes/" + hid;
        return this.http.get(url, this.createHeaders());
    }

    public holeDelete(hid: string) {
        var url = this.url + "/api/holes/" + hid;
        return this.http.delete(url, this.createHeaders());
    }

    /***
     * API calls: elements
     ***/

    public courseGetElements(cid: string) {
        var url = this.url + "/api/courses/" + cid + "/elements";
        return this.http.get(url);
    }

    public holeGetElements(hid: string) {
        var url = this.url + "/api/holes/" + hid + "/elements";
        return this.http.get(url);
    }

    /***
     * API calls: points
     ***/

    public courseGetPoints(cid: string) {
        var url = this.url + "/api/courses/" + cid + "/points";
        return this.http.get(url);
    }

    public courseCreatePoint(cid: string, type: number, info: string,
            geoJson: string) {
        var url = this.url + "/api/courses/" + cid + "/points";
        return this.http.post(url,
            {
                "PointType": type,
                "Info": info,
                "GeoJson": geoJson
            },
            this.createHeaders()
        );
    }

    public holeGetPoints(hid: string) {
        var url = this.url + "/api/holes/" + hid + "/points";
        return this.http.get(url);
    }

    public holeCreatePoint(hid: string, type: number, info: string, geoJson: string) {
        var url = this.url + "/api/holes/" + hid + "/points";
        return this.http.post(url,
            {
                "PointType": type,
                "Info": info,
                "GeoJson": geoJson
            },
            this.createHeaders()
        );
    }

    public pointGet(eid: string) {
        var url = this.url + "/api/points/" + eid;
        return this.http.get(url);
    }

    public pointDelete(eid: string) {
        var url = this.url + "/api/points/" + eid;
        return this.http.delete(url, this.createHeaders());
    }

    public pointUpdate(eid: string, geoJson: string, properties: any) {
        var url = this.url + "/api/points/" + eid;
        return this.http.put(url,
            {
                "ElementId": eid,
                "HoleId": properties.holeId,
                "CourseId": properties.courseId,
                "PointType": properties.pointType,
                "Info": properties.info,
                "GeoJson": geoJson
            },
            this.createHeaders()
        );
    }

    /***
     * API calls: polygons
     ***/

    public courseGetPolygons(cid: string) {
        var url = this.url + "/api/courses/" + cid + "/polygons";
        return this.http.get(url);
    }

    public courseCreatePolygon(cid: string, type: number, geoJson: string) {
        var url = this.url + "/api/courses/" + cid + "/polygons";
        return this.http.post(url,
            {
                "PolygonType": type,
                "GeoJson": geoJson
            },
            this.createHeaders()
        );
    }

    public holeGetPolygons(hid: string) {
        var url = this.url + "/api/holes/" + hid + "/polygons";
        return this.http.get(url);
    }

    public holeCreatePolygon(hid: string, type: number, geoJson: string) {
        var url = this.url + "/api/holes/" + hid + "/polygons";
        return this.http.post(url,
            {
                "PolygonType": type,
                "GeoJson": geoJson
            },
            this.createHeaders()
        );
    }

    public polygonGet(eid: string) {
        var url = this.url + "/api/polygons/" + eid;
        return this.http.get(url);
    }

    public polygonDelete(eid: string) {
        var url = this.url + "/api/polygons/" + eid;
        return this.http.delete(url, this.createHeaders());
    }

    public polygonUpdate(eid: string, geoJson: string, properties: any) {
        var url = this.url + "/api/polygons/" + eid;
        return this.http.put(url,
            {
                "ElementId": eid,
                "HoleId": properties.holeId,
                "CourseId": properties.courseId,
                "PolygonType": properties.polygonType,
                "GeoJson": geoJson
            },
            this.createHeaders()
        );
    }

}

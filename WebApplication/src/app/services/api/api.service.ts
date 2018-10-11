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
import { AreaType, PointType, ElementType } from '../../components/mapper/class/element';
import { GlobalsService } from '../globals/globals.service';

@Injectable()
export class ApiService {

    url: string;
    token: string;

    constructor(private http: Http, private globals: GlobalsService) {
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

    coursesGet() {
        var uid = this.globals.getUid();
        var url = this.url + "/api/users/" + uid + "/courses";
        return this.http.get(url);
    }

    public coursesCreate(name: string, info: string) {
        var uid = this.globals.getUid();
        var url = this.url + "/api/users/" + uid + "/zones";
        return this.http.post(url,
            {
                "ZoneName": name,
                "Info": info
            },
            this.createHeaders()
        );
    }

    public courseGet(cid: string) {
        var url = this.url + "/api/zones/" + cid;
        return this.http.get(url);
    }

    public courseDelete(cid: string) {
        var url = this.url + "/api/zones/" + cid;
        return this.http.delete(url, this.createHeaders());
    }

    public courseUpdate(cid: string, name: string, info: string) {
        var url = this.url + "/api/zones/" + cid;
        return this.http.put(url,
            {
                "ZoneId": cid,
                "ZoneName": name,
                "Info": info
            },
            this.createHeaders()
        );
    }

    /***
     * API calls: holes
     ***/

    public holesGet(cid: string) {
        var url = this.url + "/api/courses/" + cid + "/holes";
        return this.http.get(url);
    }

    public holesCreate(cid: string, name: string, info: string) {
        var url = this.url + "/api/zones/" + cid + "/zones";
        return this.http.post(url,
            {
                "ZoneName": name,
                "Info": info
            },
            this.createHeaders()
        );
    }

    public holeGet(hid: string) {
        var url = this.url + "/api/zones/" + hid;
        return this.http.get(url, this.createHeaders());
    }

    public holeDelete(hid: string) {
        var url = this.url + "/api/zones/" + hid;
        return this.http.delete(url, this.createHeaders());
    }

    public holeUpdate(hid: string, name: string, info: string) {
        var url = this.url + "/api/zones/" + hid;
        return this.http.put(url,
            {
                "ZoneId": hid,
                "ZoneName": name,
                "Info": info
            },
            this.createHeaders()
        );
    }

    /***
     * API calls: points
     ***/

    public createPoint(zid: string, type: number, info: string,
            geoJson: string) {
        var url = this.url + "/api/zones/" + zid + "/points";
        return this.http.post(url,
            {
                "GeoJson": geoJson,
                "ElementType": ElementType.POINT,
                "ClassType": type,
                "Info": info
            },
            this.createHeaders()
        );
    }

    public pointDelete(eid: string) {
        var url = this.url + "/api/points/" + eid;
        return this.http.delete(url, this.createHeaders());
    }

    public pointUpdate(eid: string, geoJson: string, zoneId: string,
            type: PointType, info: string) {
        var url = this.url + "/api/points/" + eid;
        return this.http.put(url,
            {
                "GeoJson": geoJson,
                "ElementId": eid,
                "ZoneId": zoneId,
                "ElementType": ElementType.POINT,
                "ClassType": type,
                "Info": info,
            },
            this.createHeaders()
        );
    }

    /***
     * API calls: polygons
     ***/

    public createPolygon(zid: string, type: number, geoJson: string) {
        var url = this.url + "/api/zones/" + zid + "/polygons";
        return this.http.post(url,
            {
                "GeoJson": geoJson,
                "ElementType": ElementType.AREA,
                "ClassType": type
            },
            this.createHeaders()
        );
    }

    public polygonDelete(eid: string) {
        var url = this.url + "/api/polygons/" + eid;
        return this.http.delete(url, this.createHeaders());
    }

    public polygonUpdate(eid: string, geoJson: string, zoneId: string,
            type: AreaType) {
        var url = this.url + "/api/polygons/" + eid;
        return this.http.put(url,
            {
                "GeoJson": geoJson,
                "ElementId": eid,
                "ZoneId": zoneId,
                "ElementType": ElementType.AREA,
                "ClassType": type,
            },
            this.createHeaders()
        );
    }

    /***
     * API calls: live location
     ***/

    public liveLocationsGet(cid: string) {
        var url = this.url + "/api/liveloc/" + cid;
        return this.http.get(url);
    }

}

import { ApiService } from "../../../services/api/api.service";
import { Course } from "./course";
import { Point, PointType } from "./element";
import { ModelState } from "../../../interfaces/enum.interface";
import { GoogleMap } from "./google-map";
import { ElementFactory } from "./element-factory";

/***
 * Filename: live-location.ts
 * Author  : Duncan Tilley
 * Class   : LiveLocation
 *
 *     Manages the live location data received from the Mapper API.
 ***/

export class LiveLocation {

    private api: ApiService;
    private map: GoogleMap;
    private interval: any;

    constructor(api: ApiService, map: GoogleMap) {
        this.api = api;
        this.map = map;
        this.interval = null;
    }

    /***
     * start(Course, number): void
     *
     *     Starts receiving live location data for the course after every
     *     specified period.
     ***/
    public start(c: Course, n: number) {
        if (this.interval == null) {
            this.receiveLocations(c.getId());
            this.interval = setInterval(() => {
                this.receiveLocations(c.getId());
            }, n);
        }
    }

    /***
     * stop(): void
     *
     *     Stops receiving live location data.
     ***/
    public stop() {
        if (this.interval != null) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    /***
     * receiveLocations(string): void
     *
     *     Gets the location data from the API and
     ***/
    private receiveLocations(cid: string) {
        this.api.liveLocationsGet(cid).subscribe(

            result => {
                // TODO real data
                //var positions: Array<any> = result.json();
                var positions = [
                    {geoJson: "{\"type\":\"Point\",\"coordinates\":[28.13893321439582,-25.659578813076532]}"},
                    {geoJson: "{\"type\":\"Point\",\"coordinates\":[28.1368947355445,-25.660323461397265]}"},
                    {geoJson: "{\"type\":\"Point\",\"coordinates\":[28.13696983739692,-25.660845679523906]}"}
                ];

                // create point elements
                var locations = [];
                positions.forEach(p => {
                    var point = new Point(ModelState.UNCHANGED, null, null,
                            true, false, PointType.LIVE);
                    point.geometry = JSON.parse(p.geoJson);
                    locations.push(point);
                });

                // display the new live data
                this.map.clearLiveData();
                this.map.addLiveData(ElementFactory.createFeatures(locations));
            },

            error => {
                console.log("Non-fatal error " + error.status +
                        ": failed to load live data");
            }

        );
    }

}

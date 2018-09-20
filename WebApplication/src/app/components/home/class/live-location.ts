import { ApiService } from "../../../services/api/api.service";
import { Course } from "./course";

/***
 * Filename: live-location.ts
 * Author  : Duncan Tilley
 * Class   : LiveLocation
 *
 *     Manages the live location data received from the Mapper API.
 ***/

export class LiveLocation {

    private api: ApiService;
    private interval: any;

    constructor(api: ApiService) {
        this.api = api;
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
                console.log("DATA:");
                console.log(result.json());
                // example
                /*
                [
                    {UserId: "whatever", playerlocation: GeoJSON}
                ]
                */
            },

            error => {
                console.log("Non-fatal error " + error.status +
                        ": failed to load live data");
            }

        );
    }

}

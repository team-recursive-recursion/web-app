/***
 * Filename: location.service.ts
 * Author  : Duncan Tilley
 * Class   : LocationService
 *
 *     This service creates a connection to the Mapper API and receives
 *     live location data from active users of the mobile application.
 ***/

import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Rx';
import { SocketService } from '../socket/socket.service';

@Injectable()
export class LocationService {

    private url: string;
    public locations: Subject<any>

    constructor(private socket: SocketService) {
        // set up the URL
        this.url = "ws://localhost:5001/ws";

        // set up the socket connection
        this.locations = <Subject<any>> this.socket
			.connect(this.url)
			.map((response: MessageEvent): any => {
				let data = JSON.parse(response.data);
				return data;
			});
    }

}

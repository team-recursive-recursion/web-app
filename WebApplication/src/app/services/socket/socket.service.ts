/***
 * Filename: socket.service.ts
 * Author  : Duncan Tilley
 * Class   : SocketService
 *
 *     This service encapsulates the use of a standard web socket.
 ***/

import { Injectable } from '@angular/core';
import * as Rx from 'rxjs/Rx';

@Injectable()
export class SocketService {

    private subject: Rx.Subject<MessageEvent>;

    /***
     * connect(string): Rx.Subject<MessageEvent>
     *
     *     Attempts to connect to the provided URL and returns the connection
     *     subject on successful connection.
     *
     *     TODO error checking?
     ***/
    public connect(url: string): Rx.Subject<MessageEvent> {
        // create the connection subject
        if (!this.subject) {
            this.subject = this.create(url);
            console.log("Successfully connected: " + url);
        }
        return this.subject;
    }

    /***
     * create(string): Rx.Subject<MessageEvent>
     *
     *     Creates the connection subject.
     *
     *     TODO error checking?
     ***/
    private create(url: string): Rx.Subject<MessageEvent> {
        let ws = new WebSocket(url);

        let observable = Rx.Observable.create(
            (obs: Rx.Observer<MessageEvent>) => {
                ws.onmessage = obs.next.bind(obs);
                ws.onerror = obs.error.bind(obs);
                ws.onclose = obs.complete.bind(obs);
                return ws.close.bind(ws);
            }
        );
        let observer = {
            next: (data: Object) => {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify(data));
                }
            }
        };
        return Rx.Subject.create(observer, observable);
    }

}

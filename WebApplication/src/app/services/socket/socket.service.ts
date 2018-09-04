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
    private connected: boolean;

    constructor() {
        this.subject = null;
        this.connected = false;
    }

    /***
     * isConnected(): boolean
     *
     *     Returns true if a successfull websocket connection has been made.
     ***/
    public isConnected(): boolean {
        return this.connected;
    }

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
        }
        return this.subject;
    }

    /***
     * create(string): Rx.Subject<MessageEvent>
     *
     *     Creates the connection subject.
     ***/
    private create(url: string): Rx.Subject<MessageEvent> {
        // create the web socket
        let parent = this;
        let ws = new WebSocket(url);
        ws.onerror = function() {
            parent.connected = false;
        };
        ws.onopen = function() {
            parent.connected = true;
        };
        ws.onclose = function() {
            parent.connected = false;
        }

        // create the socket observer
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

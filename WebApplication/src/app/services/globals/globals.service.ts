/***
 * Filename: globals.service.ts
 * Author  : Duncan Tilley
 * Class   : GlobalsService
 *
 *     This service contains all global variables.
 ***/

import { Injectable } from '@angular/core';
@Injectable()
export class GlobalsService {

    uid: string = null;

    public setUid(uid: string) {
        this.uid = uid;
    }

    public getUid(): string {
        return this.uid;
    }

}

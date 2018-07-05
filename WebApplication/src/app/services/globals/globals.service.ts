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

    uid: string = "dd3fce8d-0354-443a-a902-4d9382a92ea9";

    public setUid(uid: string) {
        this.uid = uid;
    }

    public getUid(): string {
        return this.uid;
    }

}

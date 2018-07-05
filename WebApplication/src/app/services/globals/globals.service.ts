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

    uid: string = "15706542-8208-4e70-8711-71741320310d";

    public setUid(uid: string) {
        this.uid = uid;
    }

    public getUid(): string {
        return this.uid;
    }

}

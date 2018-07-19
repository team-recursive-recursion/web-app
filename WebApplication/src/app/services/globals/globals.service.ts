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

    uid: string = "87330919-49af-4d1d-9e19-add0984310e0";

    public setUid(uid: string) {
        this.uid = uid;
    }

    public getUid(): string {
        return this.uid;
    }

}

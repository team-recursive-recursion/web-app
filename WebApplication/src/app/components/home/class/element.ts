/***
 * Filename: element.ts
 * Author  : Duncan Tilley
 * Class   : Element, Point, Area
 * Enum    : ElementState, ElementType
 *
 *     Represents a element (point or polygon). The element class is also
 *     used to represent drawable features on the map.
 ***/

import { ApiService } from '../../../services/api/api.service';
import { ModelState } from '../../../interfaces/enum.interface';

export enum ElementType {
    AREA = 0,
    POINT = 1
}

export enum PointType {
    PIN = 0,
    HOLE,
    TEE,
    LOCATION
}

export enum AreaType {
    ROUGH = 0,
    FAIR,
    GREEN,
    BUNKER,
    WATER
}

export abstract class Element {

    private state: ModelState;
    private id: string;

    public feature: any;

    /***
     * constructor(boolean, boolean)
     *
     *     Creates the element as new.
     ***/
    constructor(state: ModelState, enabled: boolean, editable: boolean) {
        this.state = state;
        this.id = "";
    }

    /***
     * ACCESSORS / MUTATORS
     ***/

    public getState() : ModelState {
        return this.state;
    }

    public setState(state: ModelState) {
        this.state = state;
    }

    public getId() : string {
        return this.id;
    }

    public setId(id: string) {
        if (this.id == "") {
            this.id = id;
        } else {
            console.log("Cannot change existing element ID");
        }
    }

    public setSelected(sel: boolean) {
        this.feature.setProperty("selected", sel);
    }

    public setEnabled(en: boolean) {
        this.feature.setProperty("enabled", en);
    }

    public setEditable(ed: boolean) {
        this.feature.setProperty("editable", ed);
    }

    /***
     * getElementType() : ElementType
     *
     *     Returns the type of the element to determine the specific subclass.
     *     Should be overridden by the subclass.
     ***/
    public abstract getElementType() : ElementType;

    /***
     * sync(api, function, function) : void
     *
     *     Pushes any local changes to the remote API. Calls the first given
     *     function on completion and the second given function on failures.
     *     Should be overridden by the subclass.
     ***/
    public abstract sync(api: ApiService, callDone: Function,
            callFail: Function);

}

export class Point extends Element {

    private type: PointType;
    private info: string;

    public constructor(state: ModelState, enabled: boolean, editable: boolean,
            type: PointType) {
        super(state, enabled, editable);
        this.type = type;
        this.info = "";
    }

    /***
     * ACCESSORS / MUTATORS
     ***/

    public getType() : PointType {
        return this.type;
    }

    public setType(type: PointType) {
        this.type = type;
    }

    public getInfo() : string {
        return this.info;
    }

    public setInfo(i: string) {
        this.info = i;
    }

    /***
     * OVERRIDE
     ***/

    public getElementType() : ElementType {
        return ElementType.POINT;
    }

    public sync(api: ApiService, callDone: Function, callFail: Function) {
        // TODO
        callDone();
    }

}

export class Area extends Element {

    private type: AreaType;

    public constructor(state: ModelState, enabled: boolean, editable: boolean,
            type: AreaType) {
        super(state, enabled, editable);
        this.type = type;
    }

    /***
     * ACCESSORS / MUTATORS
     ***/

    public getType() : AreaType {
        return this.type;
    }

    public setType(type: AreaType) {
        this.type = type;
    }

    /***
     * OVERRIDE
     ***/

    public getElementType() : ElementType {
        return ElementType.AREA;
    }

    public sync(api: ApiService, callDone: Function, callFail: Function) {
        // TODO
        callDone();
    }

}

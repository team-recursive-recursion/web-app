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

/*******************************************************************************
 * ELEMENT
 ******************************************************************************/

export abstract class Element {

    private state: ModelState;
    private id: string;

    public selected: boolean;
    public enabled: boolean;
    public editable: boolean;

    public geometry: any;
    public courseId: string = null;
    public holeId: string = null;

    /***
     * constructor(boolean, boolean)
     *
     *     Creates the element as new.
     ***/
    constructor(state: ModelState, enabled: boolean, editable: boolean) {
        this.state = state;
        this.id = "";
        this.enabled = enabled;
        this.editable = editable;
        this.selected = false;
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

/*******************************************************************************
 * POINT
 ******************************************************************************/

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
        // sync point
        switch (this.getState()) {
            case ModelState.CREATED:
                var call;
                if (this.holeId != null) {
                    call = api.holeCreatePoint(this.holeId, this.type,
                            this.info, JSON.stringify(this.geometry));
                } else {
                    call = api.courseCreatePoint(this.courseId, this.type,
                            this.info, JSON.stringify(this.geometry));
                }
                call.subscribe(

                    result => {
                        this.setId(result.json().elementId);
                        this.setState(ModelState.UNCHANGED);
                        callDone();
                    },

                    error => {
                        callFail(error.status, error.headers, error.text());
                    },

                    () => console.log("Point created successfully")

                );
                break;

            case ModelState.UPDATED:
                api.pointUpdate(this.getId(), JSON.stringify(this.geometry),
                        this.holeId, this.courseId, this.type, this.info)
                    .subscribe(

                        result => {},

                        error => {
                            callFail(error.status, error.headers, error.text());
                        },

                        () => console.log("Point updated successfully")

                    );
                break;

            case ModelState.DELETED:
                // TODO
                break;

            default:
                callDone();
                break;
        }
    }

}

/*******************************************************************************
 * AREA
 ******************************************************************************/

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
        // sync area
        switch (this.getState()) {
            case ModelState.CREATED:
                var call;
                if (this.holeId != null) {
                    call = api.holeCreatePolygon(this.holeId, this.type,
                            JSON.stringify(this.geometry));
                } else {
                    call = api.courseCreatePolygon(this.courseId, this.type,
                            JSON.stringify(this.geometry));
                }
                call.subscribe(

                    result => {
                        this.setId(result.json().elementId);
                        this.setState(ModelState.UNCHANGED);
                        callDone();
                    },

                    error => {
                        callFail(error.status, error.headers, error.text());
                    },

                    () => console.log("Area created successfully")

                );

                break;
            case ModelState.UPDATED:
                api.polygonUpdate(this.getId(), JSON.stringify(this.geometry),
                    this.holeId, this.courseId, this.type)
                    .subscribe(

                        result => {},

                        error => {
                            callFail(error.status, error.headers, error.text());
                        },

                        () => console.log("Area updated successfully")

                    );
                break;
            case ModelState.DELETED:
                // TODO
                break;

            default:
                callDone();
                break;
        }
    }

}

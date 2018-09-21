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
import { Course } from './course';
import { Hole } from './hole';

export enum ElementType {
    AREA = 0,
    POINT = 1
}

export enum PointType {
    PIN = 0,
    HOLE,
    TEE,
    LIVE
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

    private course: Course;
    private hole: Hole;

    public selected: boolean;
    public enabled: boolean;
    public editable: boolean;

    public geometry: any;

    /***
     * constructor(boolean, boolean)
     *
     *     Creates the element as new.
     ***/
    constructor(state: ModelState, course: Course, hole: Hole,
                enabled: boolean, editable: boolean) {
        this.state = state;
        this.id = "";
        this.course = course;
        this.hole = hole;
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

    public getCourse() : Course {
        return this.course;
    }

    public getHole() : Hole {
        return this.hole;
    }

    public getCourseId() : string {
        return this.course.getId();
    }

    public getHoleId() : string {
        if (this.hole != null) {
            return this.hole.getId();
        } else {
            return null;
        }
    }

    /***
     * delete() : void
     *
     *     Flags the element for deletion and clears it from the coures/hole.
     ***/
    public delete() {
        if (this.state != ModelState.CREATED) {
            this.state = ModelState.DELETED;
        } else {
            // new element, remove it from the parent
            this.removeFromParent();
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

    /***
     * removeFromParent()
     *
     *     Removes the current element from it's parent hole or course.
     ***/
    protected removeFromParent() {
        if (this.hole != null) {
            // remove from the hole
            this.hole.removeElement(this);
        } else {
            // remove from the course
            this.course.removeElement(this);
        }
    }

}

/*******************************************************************************
 * POINT
 ******************************************************************************/

export class Point extends Element {

    private type: PointType;
    private info: string;

    public constructor(state: ModelState, course: Course, hole: Hole,
            enabled: boolean, editable: boolean, type: PointType) {
        super(state, course, hole, enabled, editable);
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
                if (this.getHole() != null) {
                    call = api.holeCreatePoint(this.getHoleId(), this.type,
                            this.info, JSON.stringify(this.geometry));
                } else {
                    call = api.courseCreatePoint(this.getCourseId(),
                            this.type, this.info,
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

                    () => console.log("Point created successfully")

                );
                break;

            case ModelState.UPDATED:
                api.pointUpdate(this.getId(), JSON.stringify(this.geometry),
                        this.getHoleId(), this.getCourseId(),
                        this.type, this.info)
                    .subscribe(

                        result => {},

                        error => {
                            callFail(error.status, error.headers, error.text());
                        },

                        () => console.log("Point updated successfully")

                    );
                break;

                case ModelState.DELETED:
                    api.pointDelete(this.getId())
                        .subscribe(

                        result => {
                            this.removeFromParent();
                        },

                        error => {
                            callFail(error.status, error.headers, error.text());
                        },

                        () => console.log("Area deleted successfully")

                    );
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

    public constructor(state: ModelState, course: Course, hole: Hole,
            enabled: boolean, editable: boolean, type: AreaType) {
        super(state, course, hole, enabled, editable);
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
                if (this.getHole() != null) {
                    call = api.holeCreatePolygon(this.getHoleId(),
                            this.type, JSON.stringify(this.geometry));
                } else {
                    call = api.courseCreatePolygon(this.getCourseId(),
                            this.type, JSON.stringify(this.geometry));
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
                    this.getHoleId(), this.getCourseId(), this.type)
                    .subscribe(

                        result => {},

                        error => {
                            callFail(error.status, error.headers, error.text());
                        },

                        () => console.log("Area updated successfully")

                    );
                break;

            case ModelState.DELETED:
                api.polygonDelete(this.getId())
                    .subscribe(

                    result => {
                        this.removeFromParent();
                    },

                    error => {
                        callFail(error.status, error.headers, error.text());
                    },

                    () => console.log("Area deleted successfully")

                );
                break;

            default:
                callDone();
                break;
        }
    }

}

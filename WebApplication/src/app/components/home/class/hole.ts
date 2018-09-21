/***
 * Filename: hole.ts
 * Author  : Duncan Tilley
 * Class   : Hole
 *
 *     Represents a hole which is a collection of elements.
 ***/

import { ApiService } from '../../../services/api/api.service';
import { ModelState } from '../../../interfaces/enum.interface';
import { Course } from './course';
import { Element } from './element';
import { ElementFactory } from './element-factory';

export class Hole {

    private state: ModelState;
    private course: Course;
    private id: string;
    private name: string;
    private info: string;

    public elements: Array<Element>;

    /***
     * constructor(ModelState)
     *
     *     Creates a hole without any elements.
     ***/
    constructor(course: Course, state: ModelState) {
        this.state = state;
        this.course = course;
        this.id = "";
        this.name = "";
        this.info = "";
        this.elements = [];
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
            console.log("Cannot change existing hole ID");
        }
    }

    public getInfo() : string {
        return this.info;
    }

    public setInfo(i: string) {
        this.info = i;
    }

    public getName() : string {
        return this.name;
    }

    public setName(n: string) {
        this.name = n;
    }

    public getElements() : Array<Element> {
        return this.elements;
    }

    /***
     * addElement(Element) : void
     *
     *     Adds a element to the course.
     ***/
    public addElement(e: Element) {
        this.elements.push(e);
    }

    /***
     * asFeatures() : Array<any>
     *
     *     Returns the collection of elements as drawable features.
     ***/
    public asFeatures() : Array<any> {
        return ElementFactory.createFeatures(this.elements);
    }

    /***
     * sync(api, function, function) : void
     *
     *     Pushes any local changes to the remote API. Calls the first given
     *     function on completion and the second given function on failures.
     ***/
    public sync(api: ApiService, callDone: Function, callFail: Function) {
        // sync hole
        switch (this.state) {
            case ModelState.CREATED:
                api.holesCreate(this.course.getId(), this.name, this.info)
                    .subscribe(
                        result => {
                            // save the new ID
                            var id = result.json().holeId;
                            this.setId(id);
                            this.setState(ModelState.UNCHANGED);
                            this.syncElements(api, callDone);
                        },

                        error => {
                            callFail(error.status, error.headers, error.text());
                        },

                        () => console.log("Hole created successfully")
                    );
                break;
            case ModelState.UPDATED:
                // TODO
                break;
            case ModelState.DELETED:
                // TODO
                break;
            default:
                this.syncElements(api, callDone);
        }
    }

    /***
     * syncElements(ApiService, function) : void
     *
     *     Used by sync to sync the elements of the hole.
     ***/
    private syncElements(api: ApiService, callDone: Function) {
        this.elements.forEach(e => {
            e.sync(api,
                // success
                function() {},
                // fail
                function(status, header, body) {
                    console.log("Non-fatal error " + status +
                            ": failed to synchronize element");
                }
            );
        });
        callDone();
    }

    /***
     * reload(api, function, function) : void
     *
     *     Loads elements from the remote API. Calls the first given function on
     *     completion and the second given function on failures.
     ***/
    public reload(api: ApiService, callDone: Function, callFail: Function) {
        // load elements
        if (this.id != "") {
            api.holeGet(this.id)
                .subscribe(
                    result => {
                            // parse elements
                            this.elements = ElementFactory.parseElementArray(
                                result.json().elements, this.course, this,
                                false, false);
                            callDone();
                    },

                    error => {
                        callFail(error.status, error.headers, error.text());
                    },

                    () => console.log("Hole loaded successfully")
                );
        } else {
            // nothing to load, keep the local copy
            callDone();
        }
    }

}

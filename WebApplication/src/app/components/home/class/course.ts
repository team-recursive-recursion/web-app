/***
 * Filename: course.ts
 * Author  : Duncan Tilley
 * Class   : Course
 *
 *     Represents a course which is a collection of holes and elements.
 ***/

import { ApiService } from '../../../services/api/api.service';
import { ModelState } from '../../../interfaces/enum.interface';
import { Element } from './element';
import { Hole } from './hole';
import { ElementFactory } from './element-factory';

export class Course {

    private state: ModelState;
    private id: string;
    private name: string;
    private info: string;

    private elements: Array<Element>;
    private holes: Array<Hole>;

    /***
     * constructor(ModelState)
     *
     *     Creates the course without any holes or elements.
     ***/
    constructor(state: ModelState) {
        this.state = state;
        this.id = "";
        this.name = "Test Name";
        this.info = "";
        this.elements = [];
        this.holes = [];
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
            console.log("Cannot change existing course ID");
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

    public getHoles() : Array<Hole> {
        return this.holes;
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
     * removeElement(Element) : void
     *
     *     Removes the given element from the hole.
     ***/
    public removeElement(e: Element) {
        // find the element to remove from the list
        var i = 0;
        var done = false;
        while (!done && i < this.elements.length) {
            if (this.elements[i] == e) {
                this.elements.splice(i, 1);
                done = true;
            }
            ++i;
        }
    }

    /***
     * getHole(number) : Hole
     *
     *     Returns the hole at the given index.
     ***/
    public getHole(index: number) : Hole {
        return this.holes[index];
    }

    /***
     * addHole(Hole) : number
     *
     *     Adds a hole to the course. Returns the index of the new hole.
     ***/
    public addHole(h: Hole) : number {
        this.holes.push(h);
        return this.holes.length - 1;
    }

    /***
     * createHole(string, string) : number
     *
     *     Adds a hole to the course. Returns the index of the new hole.
     ***/
    public createHole(name: string, info: string) : number {
        var hole = new Hole(this, ModelState.CREATED);
        hole.setName(name);
        hole.setInfo(info);
        this.holes.push(hole);
        return this.holes.length - 1;
    }

    /***
     * removeHole(Hole) : void
     *
     *     Removes the given hole from the course.
     ***/
    public removeHole(h: Hole) {
        // find the hole to remove from the list
        var i = 0;
        var done = false;
        while (!done && i < this.holes.length) {
            if (this.holes[i] == h) {
                this.holes.splice(i, 1);
                done = true;
            }
            ++i;
        }
    }

    /***
     * clear() : void
     *
     *     Removes all holes and elements stored in the course to free memory.
     ***/
    public clear() {
        this.elements = [];
        this.holes = [];
    }

    /***
     * asFeatures() : Array<any>
     *
     *     Returns the collection of elements as drawable features.
     ***/
    public asFeatures() : Array<any> {
        var features = ElementFactory.createFeatures(this.elements);
        this.holes.forEach(h => {
            features = [
                ...features,
                ...h.asFeatures()
            ];
        });
        return features;
    }

    /***
     * sync(api, function, function) : void
     *
     *     Pushes any local changes to the remote API. Calls the first given
     *     function on completion and the second given function on failures.
     ***/
    public sync(api: ApiService, callDone: Function, callFail: Function) {
        // update the course
        if (this.state == ModelState.UPDATED) {
            // TODO
        }
        // sync elements
        this.elements.forEach(e => {
            e.sync(api,
                // finish
                function() {},
                // fail
                function(status, header, body) {
                    console.log("Non-fatal error " + status +
                            ": failed to synchronize element");
                }
            );
        });
        // sync holes
        this.holes.forEach(h => {
            h.sync(api,
                // success
                function() {},
                // fail
                function(status, header, body) {
                    console.log("Non-fatal error " + status +
                            ": failed to synchronize hole");
                }
            );
        });
        callDone();
    }

    /***
     * reload(api, function, function) : void
     *
     *     Loads elements and holes from the remote API. Calls the first given
     *     function on completion and the second given function on failures.
     ***/
    public reload(api: ApiService, callDone: Function, callFail: Function) {
        // load elements and holes
        if (this.id != "") {
            api.courseGet(this.id)
                .subscribe(
                    result => {
                        let body = result.json();
                        // parse the holes
                        let holes = body.holes;
                        for (var i = 0; i < holes.length; ++i) {
                            var hole = new Hole(this, ModelState.UNCHANGED);
                            hole.setId(holes[i].holeId);
                            hole.setName(holes[i].name);
                            hole.setInfo(holes[i].info);
                            this.holes.push(hole);
                        }

                        // parse the elements
                        this.elements = ElementFactory.parseElementArray(
                                body.elements, this, null, true, false);

                        // load holes
                        var numH = 0;
                        var t = this;
                        // synchronize by counting each finished hole and
                        // calling callDone once the last hole is done.
                        this.holes.forEach(h => {
                            h.reload(api,
                                // finish
                                function() {
                                    ++numH;
                                    if (numH >= t.holes.length) {
                                        callDone();
                                    }
                                },
                                // fail
                                function(status, header, body) {
                                    ++numH;
                                    console.log("Non-fatal error " + status +
                                            ": failed to load hole");
                                }
                            );
                        });
                    },

                    error => {
                        callFail(error.status, error.headers, error.text());
                    },

                    () => console.log("Course loaded successfully")
                );
        } else {
            // nothing to load, keep the local copy
            callDone();
        }
    }

}

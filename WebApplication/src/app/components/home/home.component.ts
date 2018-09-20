/***
 * Filename: home.component.ts
 * Author  : Christaan H Nel, Duncan Tilley
 * Class   : HomeComponent / <home>
 ***/

import { MediaMatcher } from '@angular/cdk/layout';
import {
    Component, ViewChild, ChangeDetectorRef, Inject, OnInit, NgZone,
    ApplicationRef, ValueProvider
}
    from '@angular/core';
import { Router } from '@angular/router';
import { AgmMap } from '@agm/core';
import { FormControl } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatSidenav } from '@angular/material';
import { element } from 'protractor';

import { ApiService } from '../../services/api/api.service';
import { GlobalsService } from '../../services/globals/globals.service';
import { LocationService } from '../../services/location/location.service';
import { LIVE_ANNOUNCER_ELEMENT_TOKEN } from '@angular/cdk/a11y';
import { AreaDialog } from './dialog/area-dialog.component';
import { PointDialog } from './dialog/point-dialog.component';
import { HoleDialog } from './dialog/hole-dialog.component';
import { CourseDialog } from './dialog/course-dialog.component';

import { GoogleMap, DrawMode } from './class/google-map';
import { ModelState } from '../../interfaces/enum.interface';
import { CourseManager } from './class/course-manager';
import { Element, Point, Area } from './class/element';
import { Hole } from './class/hole';
import { Course } from './class/course';
import { ElementFactory } from './class/element-factory';
import { LiveLocation } from './class/live-location';

@Component({
    selector: 'HomeComponent',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent {
    @ViewChild('AgmMap') agmMap: AgmMap;
    @ViewChild('snav') navbar: MatSidenav;

    // map elements
    map: GoogleMap;
    courseManager: CourseManager;
    liveLoc: LiveLocation;

    // selected items
    selectedFeature: any = null;

    url: any;
    courseIndex: number = -1;
    holeIndex: number = -1;

    features: any;
    drawingMode: string;
    viewMode: boolean = false;

    lat: number = -25.658712;
    lng: number = 28.140347;
    zoom: number = 20;
    mapType: string = "satellite";
    mapDraggable: boolean = true;
    mobileQuery: MediaQueryList;

    activeElements: any;

    open: boolean = true;
    spin: boolean = false;
    direction: string = 'up';
    animationMode: string = 'scale';

    locationPoints: any;

    private _fixed: boolean = true;
    get fixed() { return this._fixed; }
    set fixed(fixed: boolean) {
        this._fixed = fixed;
        if (this._fixed) {
            this.open = true;
        }
    }

    private _mobileQueryListener: () => void;

    constructor(
        private api: ApiService,
        private globals: GlobalsService,
        private router: Router,
        private ngZone: NgZone,
        private appRef: ApplicationRef,
        changeDetectorRef: ChangeDetectorRef,
        media: MediaMatcher,
        public dialog: MatDialog) {

        this.mobileQuery = media.matchMedia('(max-width: 600px)');
        this._mobileQueryListener = () => changeDetectorRef.detectChanges();
        this.mobileQuery.addListener(this._mobileQueryListener);
        this.courseManager = new CourseManager(this.api, this.globals.getUid());
        this.liveLoc = new LiveLocation(this.api);
    }

    /***
     * ngAfterViewInit() : void
     *
     *     View init call. The user's courses are loaded through the API. If the
     *     user is not logged in, redirect to the login screen.
     ***/
    ngAfterViewInit() {
        // check if a user is logged in
        if (this.globals.getUid() == null) {
            this.router.navigateByUrl("/login");
        } else {
            // set up the map
            this.map = new GoogleMap(this.agmMap, this);
            // load courses
            this.courseManager.loadCourseList(
                // success
                function() {},
                // fail
                function (status, headers, body) {
                    // TODO nice message
                    window.alert("Error " + status +
                            ": failed to load user course list");
                    console.log(body);
                }
            );
        }
    }

    /***
     * ngOnDestroy() : void
     *
     *     Clean up.
     ***/
    ngOnDestroy(): void {
        this.mobileQuery.removeListener(this._mobileQueryListener);
    }

    /***
     * UI EVENT HANDLERS
     ***/

    /***
     * onSelectCourse(number) : void
     *
     *     Event listener for selecting a course from the dropdown menu. Sets
     *     the active course to the selected one.
     ***/
    public onSelectCourse(index: number) {
        // stop live locations
        this.liveLoc.stop();

        var t = this;
        if (index >= 0) {
            this.unselectFeature();
            this.courseManager.setActiveCourse(index, this.api,
                // success
                function () {
                    t.map.clearMap();
                    t.navbar.open();
                    // TODO
                    // go to viewing mode
                    /*this.viewMode = true;
                    this.updateViewMode();*/
                    t.liveLoc.start(t.courseManager.activeCourse, 10000);
                    t.map.displayCourse(t.courseManager.activeCourse);
                    t.holeIndex = -1;
                },
                // fail
                function(status, header, body) {
                    // TODO nice message
                    window.alert("Error " + status +
                            ": failed to load selected course");
                    console.log(body);
                }
            );
        } else {
            this.courseManager.unsetActiveCourse();
            this.navbar.close();
            this.map.clearMap();
        }
    }

    /***
     * onSaveCourse(): void
     *
     *     Function that saves the current course. New elements are posted,
     *     updated elements are put and removed elements are deleted.
     ***/
    public onSaveCourse() {
        this.courseManager.activeCourse.sync(this.api,
            // success
            function() {},
            // fail
            function(status, header, body) {
                // TODO nice message
                window.alert("Error " + status +
                        ": failed to save current course");
                console.log(body);
            }
        );
        // delete removed elements
        /*this.removedFeatures.forEach(feature => {
            var http;
            if (feature.getProperty("elementType") == Element_t.E_POLY) {
                // delete the polygon
                http = this.api.polygonDelete(feature.getProperty("elementId"));
            } else {
                // delete the point
                http = this.api.pointDelete(feature.getProperty("elementId"));
            }
            http.subscribe(
                result => this.onResult(result.headers,
                    result.json(),
                    Call_t.C_ELEMENT_DELETE, feature),
                error => this.onFail(error.status,
                    error.headers, error.text(),
                    Call_t.C_ELEMENT_DELETE),
                () => console.log("Element deleted successfully")
            );*/
    }

    /***
     * onCreateCourse(): void
     *
     *     Event listener for the course creation button. Brings up the course
     *     dialog and creates the course.
     ***/
    public onCreateCourse() {
        var t = this;
        // bring up the course dialog
        const dialogRef = this.dialog.open(CourseDialog);
        dialogRef.afterClosed().subscribe(result => {
            if (result.done) {
                // create course
                this.courseManager.createActiveCourse(result.name, result.info,
                    this.api,
                    // success
                    function() {
                        t.map.clearMap();
                        t.navbar.open();
                        t.courseIndex = t.courseManager.courses.length - 1;
                        // go to edit mode TODO
                        //this.viewMode = false;
                        //this.updateViewMode();
                    },
                    // fail
                    function (status, header, body) {
                        // TODO nice message
                        window.alert("Error " + status +
                                ": failed to create new course");
                        console.log(body);
                    }
                );

            }
        });
    }

    /***
     * onDeleteCourse(number) : void
     *
     *     Event listener for the course deletion button. Deletes the
     *     selected course.
     ***/
    public onDeleteCourse(index: number) {
        var t = this;
        if (window.confirm("Are you sure you want to delete '" +
            this.courseManager.activeCourse.getName() + "'?")) {
            // delete the course
            this.courseManager.deleteActiveCourse(this.api,
                // success
                function() {
                    t.unselectFeature();
                    t.map.clearMap();
                    t.navbar.close();
                    t.courseIndex = -1;
                },
                // fail
                function(status, header, body) {
                    // TODO nice message
                    window.alert("Error " + status +
                            ": failed to delete selected course");
                    console.log(body);
                }
            );
        }
    }

    /***
     * onSelectHole(number) : void
     *
     *     Event listener for selecting a hole radio button. Changes the active
     *     hole to the selected one.
     ***/
    public onSelectHole(index: number) {
        if (index >= 0) {
            this.map.displayHole(this.courseManager.activeCourse
                    .getHole(index));
            this.appRef.tick();
        } else {
            this.map.displayHole(null);
            this.appRef.tick();
        }
        // unselect the selected element
        this.unselectFeature();
    }

    /***
     * onCreateHole(): void
     *
     *     Event listener for the hole creation button. Creates a new hole
     *     using the hole dialog and adds the hole to the active course.
     ***/
    public onCreateHole() {
        // bring up the hole dialog
        const dialogRef = this.dialog.open(HoleDialog);
        dialogRef.afterClosed().subscribe(result => {
            if (result.done) {
                // create hole
                var index = this.courseManager.activeCourse.createHole(
                        result.name, result.par);
                this.holeIndex = index;
                this.onSelectHole(index);
            }
        });
    }

    /***
     * onEditHole(): void
     *
     *     Function that edits an existing hole using the API.
     *     On success, call onResult.
     *     On failure, call onFail.
     ***/
    public onEditHole() {
        // bring up the hole dialog
        /*const dialogRef = this.dialog.open(HoleDialog);
        dialogRef.afterClosed().subscribe(result => {
            if (result.done) {
                // update hole
                // TODO
            }
        });*/
    }

    /***
     * onDeleteHole(): void
     *
     *     Function that removes an existing hole using the API.
     *     On success, call onResult.
     *     On failure, call onFail.
     ***/
    public onDeleteHole() {
        // TODO
    }

    /***
     * onFabAdd(string) : void
     *
     *     Event listener for pressing the add point or area floating buttons.
     *     Sets the map to the appropriate drawing mode.
     ***/
    onFabAdd(type: number) {
        this.unselectFeature();
        if (type == 0) {
            this.map.setDrawingMode(DrawMode.POINT);
        } else {
            this.map.setDrawingMode(DrawMode.AREA);
        }
    }

    /***************************************************************************
     * Selection functions.
     **************************************************************************/

    /***
     * setSelectedFeature(any): void
     *
     *     Sets the currently selected feature.
     ***/
    private setSelectedFeature(f: any) {
        this.unselectFeature();
        // select feature
        f.getProperty('element').selected = true;
        // force update
        f.setProperty('update', false);
        this.selectedFeature = f;
        this.appRef.tick();
    }

    /***
     * unselectFeature() : void
     *
     *     Unselects the currently selected feature.
     */
    private unselectFeature() {
        if (this.selectedFeature != null) {
            this.selectedFeature.getProperty('element').selected = false;
            // force update
            this.selectedFeature.setProperty('update', false);
            this.selectedFeature = null;
            this.appRef.tick();
        }
    }

    /***************************************************************************
     * Map event handlers.
     **************************************************************************/

    /***
     * onFeatureAdd(any): void
     *
     *     Event handler for new & loaded elements on the map. The handler
     *     creates the element and adds it to the course.
     ***/
    public onFeatureAdd(feature: any) {
        var hole = null;
        if (this.holeIndex >= 0) {
            hole = this.courseManager.activeCourse.getHole(this.holeIndex);
        }
        // ignore the loaded elements
        if (feature.getProperty("elementId") === undefined) {
            if (this.courseManager.activeCourse != null) {
                // determine the type of element added
                this.ngZone.run(() => {
                    if (this.map.getDrawingMode() == DrawMode.AREA) {
                        // bring up the area dialog
                        const dialogRef = this.dialog.open(AreaDialog);
                        dialogRef.afterClosed().subscribe(result => {
                            if (result.done) {
                                // create the area element
                                var el = ElementFactory.parseArea(
                                    feature, true, true, result.type,
                                    this.courseManager.activeCourse, hole);
                                if (hole != null) {
                                    hole.addElement(el);
                                } else {
                                    this.courseManager.activeCourse
                                            .addElement(el);
                                }
                                this.setSelectedFeature(feature);
                            } else {
                                // delete the feature
                                this.map.removeFeature(feature);
                            }
                        });

                    } else if (this.map.getDrawingMode() == DrawMode.POINT) {
                        // bring up the point dialog
                        const dialogRef = this.dialog.open(PointDialog);
                        dialogRef.afterClosed().subscribe(result => {
                            if (result.done) {
                                // create the point element
                                var el = ElementFactory.parsePoint(
                                    feature, true, true, result.type,
                                    result.info,
                                    this.courseManager.activeCourse, hole);
                                if (hole != null) {
                                    hole.addElement(el);
                                } else {
                                    this.courseManager.activeCourse
                                            .addElement(el);
                                }
                                this.setSelectedFeature(feature);
                            } else {
                                // delete the feature
                                this.map.removeFeature(feature);
                            }
                        });
                    }
                });
            } else {
                // remove the invalid feature
                this.map.removeFeature(feature);
                // TODO nice message
                window.alert("Please load or create a course first.");
            }
            // go to select mode
            this.map.setDrawingMode(DrawMode.NONE);
        }
    }

    /***
     * onFeatureUpdate(any): void
     *
     *     Event handler for updated elements on the map. The handler sets the
     *     current selected feature to the updated one and flags the feature
     *     for update.
     ***/
    public onFeatureUpdate(feature: any) {
        if (feature != this.selectedFeature) {
            this.setSelectedFeature(feature);
        }
        // update the element
        var e: Element = feature.getProperty('element');
        e.geometry = ElementFactory.toGeoJson(e.getElementType(),
                feature.getGeometry());
        if (e.getState() != ModelState.CREATED) {
            e.setState(ModelState.UPDATED);
        }
    }

    /***
     * onFeatureClick(any): void
     *
     *     Event handler for map element clicks. The handler sets the current
     *     selected feature to the clicked one.
     ***/
    public onFeatureClick(feature: any) {
        this.setSelectedFeature(feature);
    }

    /***
     * onMapClick(any): void
     *
     *     Event handler for map clicks.
     ***/
    public onMapClick(event: any) {
        // deselect the selected feature
        this.unselectFeature();
    }

    /***************************************************************************
     * UI event handlers.
     **************************************************************************/

    /***
     * onDeleteElement(): void
     *
     *     Deletes the currently selected feature and adds it to the remove
     *     list.
     */
    /*public onDeleteElement() {
        if (this.selectedFeature != null) {
            this.googleMap.data.remove(this.selectedFeature);
            if (this.selectedFeature.getProperty("state") != State_t.S_NEW) {
                this.removedFeatures.push(this.selectedFeature);
                this.selectedFeature.setProperty("state", State_t.S_DELETE);
            }
            this.removeSelectedFeature();
        }
    }*/

    /***
     * onViewModeSwitch(): void
     *
     *     Event handler for switching between editing mode and live view mode.
     ***/
    /*public onViewModeSwitch() {
        this.updateViewMode();
    }*/

    /*public updateViewMode() {
        if (this.viewMode) {
            // switch to viewing mode
            this.removeSelectedFeature();
            this.googleMap.data.setDrawingMode(null);
            this.drawingMode = "None";
            // TODO ask to save first
            // disable selection of elements
            this.googleMap.data.forEach(feature => {
                feature.setProperty("editable", false);
            });
        } else {
            // switch to edit mode
            // enable selection of elements
            this.googleMap.data.forEach(feature => {
                feature.setProperty("editable", true);
            });
        }
    }*/

    /***************************************************************************
     * Display and data updating
     **************************************************************************/

    /*private addDummyPoints(){
        this.locationPoints[1]={
            "type": "Feature",
            "geometry": {
                "type":"Point",
                "coordinates":[-25.658712, 28.140347]
            },
            "properties": {
                "state": State_t.S_NONE,
                "pointType": Point_t.P_LOCATION,
                "elementType": null,
                "elementId": null,
                "courseId": null,
                "holeId": null,
                "enabled": true,
                "editable": !this.viewMode,
                "selected": false
            }
        };

    }*/
    /***
     * displayCourse(): void
     *
     *     Reset the map to display all the elements
     ***/
    /*private displayCourse() {
        //this.addDummyPoints();

        // add the course elements
        let features: any = [...this.generateFeature(this.currentCourse
            .elements)];
        // add all the holes' elements
        this.holes.forEach(hole => {
            features = [
                ...features,
                ...this.generateFeature(hole.elements, false)
            ]
        });
        // display the elements
        this.activeElements = {
            "type": "FeatureCollection",
            "features": [
                ...features
            ]
        }
        //this.updateDataLayer(this.showLocationPoints(this.locationPoints));
        this.updateDataLayer(this.activeElements);
    }*/

    /***************************************************************************
     * API response handlers.
     **************************************************************************/

    /***
     * onResult(any, any, Call_t, any): void
     *
     *     Function to be called after each successful API call.
     ***/
    /*private onResult(headers: any, body: any, callType: Call_t,
        feature: any = null) {
        switch (callType) {
            case Call_t.C_HOLE_LOAD:
                this.holes.push(body);
                if (this.holes.length === this.currentCourse.holes.length) {
                    this.displayCourse();
                }
                break;
            case Call_t.C_ELEMENT_CREATE:
            case Call_t.C_ELEMENT_UPDATE:
                if (body != null) {
                    this.onElementSaved(body, feature);
                }
                break;
        }
        }*/

    /**
     *
     * @param {Array<any>} collection
     * @param {boolean} enabled
     * @returns {Array<any>}
     */
    /*private showLocationPoints(collection: Array<any>, enabled: boolean = true){
        let elements: Array<any> = [];
        if (collection !== undefined && collection !== null) {
            collection.forEach(
                element =>{
                let value;
                value = {
                    "type": "Feature",
                    "geometry": {
                        ...JSON.parse(element.geoJson)
                    },
                    "properties": {
                        "state": State_t.S_NONE,
                        "pointType": element['pointType'],
                        "elementType": null,
                        "elementId": null,
                        "courseId": null,
                        "holeId": null,
                        "enabled": enabled,
                        "editable": !this.viewMode,
                        "selected": false
                    }
                };
                    elements.push(value);
                }
            );
        }
        return elements;
    }*/

}

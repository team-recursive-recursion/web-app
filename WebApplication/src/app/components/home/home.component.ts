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
import { PolygonDialog } from './dialog/polygon-dialog.component';
import { PointDialog } from './dialog/point-dialog.component';
import { HoleDialog } from './dialog/hole-dialog.component';
import { CourseDialog } from './dialog/course-dialog.component';

import { GoogleMap } from './class/google-map';
import { ModelState } from '../../interfaces/enum.interface';
import { CourseManager } from './class/course-manager';
import { Element, Point, Area } from './class/element';
import { Hole } from './class/hole';
import { Course } from './class/course';

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

    // selected items
    selectedFeature: any = null;
    dataLayer: any = null;

    removedFeatures: Array<any> = []; // list of elements to be deleted

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
        private liveLoc: LocationService,
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
            this.map = new GoogleMap(this.agmMap);
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
        var t = this;
        if (index >= 0) {
            this.courseManager.setActiveCourse(index, this.api,
                // success
                function () {
                    t.map.clearMap();
                    t.navbar.open();
                    // TODO
                    // go to viewing mode
                    /*this.viewMode = true;
                    this.updateViewMode();*/
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
            );
        });
        this.removedFeatures = [];
        // handle all existing features
        this.googleMap.data.toGeoJson(
            data => data.features.forEach(
                feature => {
                    // extract polygon properties

                    var type: number;
                    if (feature.geometry.type == "Point") {
                        type = feature.properties["pointType"];
                    } else {
                        type = feature.properties["polygonType"];
                    }
                    var eid: string = feature.properties["elementId"];
                    var geoJson: string = JSON.stringify(feature.geometry);
                    var courseId = feature.properties["courseId"];
                    var holeId = feature.properties["holeId"];

                    // perform the correct action for new and updated elements
                    switch (feature.properties.state) {
                        case State_t.S_NEW:
                            if (feature.properties.elementType ==
                                Element_t.E_POLY) {
                                this.createPolygon(holeId, courseId, type,
                                    geoJson, feature);
                            } else if (feature.properties.elementType ==
                                Element_t.E_POINT) {
                                let info = feature.properties["info"];
                                this.createPoint(holeId, courseId, type, info,
                                    geoJson, feature);
                            }
                            break;

                        case State_t.S_UPDATE:
                            let call;
                            if (feature.properties.elementType ==
                                Element_t.E_POLY) {
                                call = this.api.polygonUpdate(eid, geoJson,
                                    feature.properties);
                            } else if (feature.properties.elementType ==
                                Element_t.E_POINT) {
                                call = this.api.pointUpdate(eid, geoJson,
                                    feature.properties);
                            }
                            call.subscribe(
                                result => this.onResult(result.headers,
                                    result.json(),
                                    Call_t.C_ELEMENT_UPDATE, feature),
                                error => this.onFail(error.status,
                                    error.headers, error.text(),
                                    Call_t.C_ELEMENT_UPDATE),
                                () => console.log("Element saved successfully")
                            );
                            break;
                    }
                    console.log("Success: Course saved");
                }
            )
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
        } else {
            this.map.displayHole(null);
        }
        // unselect the selected feature
        //this.removeSelectedFeature(); TODO ?
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

    /*fabReloadMap(index: number) {
        this.onLoadCourse(index);
    }*/

    /***
     * fabAddPolygon(): void
     *
     *     Event listener for floating polygon button click. Deselects the
     *     selected feature and enters polygon drawing mode.
     ***/
    /*fabAddPolygon() {
        if (this.selectedFeature != null) {
            this.selectedFeature.setProperty("selected", false);
            this.selectedFeature = null;
        }
        this.googleMap.data.setDrawingMode("Polygon");
        this.drawingMode = "Polygon";
    }*/

    /***
     * fabAddPoint(): void
     *
     *     Event listener for floating point button click. Deselects the
     *     selected feature and enters marker drawing mode.
     ***/
    /*fabAddPoint() {
        if (this.selectedFeature != null) {
            this.selectedFeature.setProperty("selected", false);
            this.selectedFeature = null;
        }
        this.googleMap.data.setDrawingMode("Point");
        this.drawingMode = "Point";
    }*/

    /***
     * setupMap
     *
     *     Sets up the initial map controls and styling.
     ***/
    private setupMap() {
        //this.agmMap.mapReady.subscribe(map => {
            //this.googleMap = map;
            //this.dataLayer = new google.maps.Data();
            //this.dataLayer.setMap(map);
            //this.googleMap.data.setControls(['Point', 'Polygon']);
            //this.setUpMapEvents();
            //this.setUpStyling();
            //this.setUpSearch();
            //this.setUpLocations();
        //});
    }

    /***
     * setUpMapEvents
     *
     *     Function to set the Map Events listeners.
     ***/
    /*private setUpMapEvents() {
        this.googleMap.data.addListener("addfeature", e =>
            this.onMapFeatureAdd(e));
        this.googleMap.data.addListener('setgeometry', e =>
            this.onMapGeometrySet(e));
        this.googleMap.data.addListener('click', e =>
            this.onFeatureClick(e));
        this.googleMap.addListener('click', e =>
            this.onMapClick(e));
    }*/

    /***
     * setUpStyling(): void
     *
     *     Function that sets the color and style of features according to its
     *     type and enabled properties.
     ***/
    /*private setUpStyling() {
        this.googleMap.data.setStyle(function (feature) {
            let enabled = feature.getProperty('enabled');
            let editable = feature.getProperty('editable');
            let selected = feature.getProperty('selected');
            if (feature.getGeometry() != null) {
                if (feature.getGeometry().getType() == "Polygon") {
                    // styling for polygons
                    const polyType = feature.getProperty('polygonType');
                    // choose the color based on enabled and the type
                    let color = '#2E2E2E';
                    if (enabled) {
                        switch (polyType) {
                            case 0:
                                color = '#1D442D';
                                break;
                            case 1:
                                color = '#73A15D';
                                break;
                            case 2:
                                color = '#BADA55';
                                break;
                            case 3:
                                color = '#C2B280';
                                break;
                            case 4:
                                color = '#336699';
                                break;
                        }
                    }
                    // return the styling
                    return {
                        clickable: editable && enabled,
                        draggable: selected,
                        editable: selected,
                        visible: true,
                        fillColor: color,
                        fillOpacity: 0.3,
                        strokeWeight: 1,
                        zIndex: polyType
                    };
                } else {
                    var icon;
                    switch (feature.getProperty("pointType")) {
                        case Point_t.P_HOLE:
                            icon = "./assets/flag.png";
                            break;
                        case Point_t.P_TEE:
                            icon = "./assets/tee.png";
                            break;
                        default:
                            icon = "";
                            break;
                    }
                    return {
                        clickable: editable && enabled,
                        draggable: selected,
                        editable: selected,
                        visible: enabled,
                        icon: icon,
                        zIndex: 0
                    };
                }
            }
        });

    }*/

    /***
     * setUpSearch(): void
     *
     *     Creates the search bar and enables the events.
     ***/
    /*private setUpSearch(): void {
        // create and link the search input
        var map = this.googleMap;
        var div = document.getElementById("search-div");
        var input = document.getElementById("search-input");
        var searchBox = new google.maps.places.SearchBox(input);
        map.controls[google.maps.ControlPosition.TOP_LEFT].push(div);

        // bias search results to places in the current viewbox
        map.addListener('bounds_changed', function () {
            searchBox.setBounds(map.getBounds());
        });

        // add event for place selection
        searchBox.addListener('places_changed', function () {
            var places = searchBox.getPlaces();
            if (places.length == 0) {
                return;
            }

            // get the location.
            var bounds = new google.maps.LatLngBounds();
            // add bounds for each selected place
            places.forEach(place => {
                if (!place.geometry) {
                    console.log("Place contains no usable geometry");
                    return;
                }
                // focus on the area
                if (place.geometry.viewport) {
                    bounds.union(place.geometry.viewport);
                } else {
                    bounds.extend(place.geometry.location);
                }
            });
            map.fitBounds(bounds);
        });
    }*/

    /***
     * setUpLocations(): void
     *
     *     Creates the socket connection to the Mapper API for listening to
     *     live location data.
     ***/
    /*private setUpLocations(): void {
        this.liveLoc.locations.subscribe(loc => {
                console.log("Locations received: " + loc);
            }
        );
    }*/

    /***
     * setSelectedFeature(any): void
     *
     *     Sets the currently selected feature.
     ***/
    /*private setSelectedFeature(f: any) {
        if (this.selectedFeature != null) {
            this.selectedFeature.setProperty("selected", false);
        }
        this.selectedFeature = f;
        this.selectedFeature.setProperty("selected", true);
        this.appRef.tick();
    }*/

    /*private removeSelectedFeature() {
        if (this.selectedFeature != null) {
            this.selectedFeature.setProperty("selected", false);
            this.selectedFeature = null;
            this.appRef.tick();
        }
    }*/

    /***************************************************************************
     * Map event handlers.
     **************************************************************************/

    /***
     * onMapFeatureAdd(any): void
     *
     *     Event handler for new & loaded elements on the map. The handler adds
     *     the necessary properties to new elements.
     ***/
    /*private onMapFeatureAdd(e: any) {
        // ignore the loaded elements
        if (e.feature.getProperty("elementId") === undefined) {
            if (this.currentCourse !== undefined) {
                // determine the type of element added
                this.ngZone.run(() => {
                    if (this.drawingMode == "Polygon") {
                        // bring up the polygon dialog
                        const dialogRef = this.dialog.open(PolygonDialog);
                        dialogRef.afterClosed().subscribe(result => {
                            if (result.done) {
                                // assign polygon properties
                                this.setPolygonProperties(e.feature,
                                        result.type);
                            } else {
                                // delete the feature
                                this.googleMap.data.remove(e.feature);
                            }
                        });

                    } else if (this.drawingMode == "Point") {
                        // bring up the point dialog
                        const dialogRef = this.dialog.open(PointDialog);
                        dialogRef.afterClosed().subscribe(result => {
                            if (result.done) {
                                // assign point properties
                                this.setPointProperties(e.feature,
                                        result.type, result.info);
                            } else {
                                // delete the feature
                                this.googleMap.data.remove(e.feature);
                            }
                        });
                    }
                });
            } else {
                // remove the invalid feature
                this.googleMap.data.remove(e.feature);
                // TODO nice message
                window.alert("Please load or create a course first.");
            }
            // go to select mode
            this.googleMap.data.setDrawingMode(null);
        }
    }*/

    /***
     * setPolygonProperties(any, number): void
     *
     *     Adds the appropriate properties to the polygon based on the current
     *     state and given polygon type.
     ***/
    /*private setPolygonProperties(feature: any, type: number): void {
        // assign element properties
        feature.setProperty("state", State_t.S_NEW);
        feature.setProperty("elementId", null);
        feature.setProperty("courseId", this.currentCourse.courseId);
        if (this.selectedHole !== undefined) {
            feature.setProperty("holeId", this.selectedHole.holeId);
        } else {
            feature.setProperty("holeId", null);
        }
        // assign polygon properties
        feature.setProperty("enabled", true);
        feature.setProperty("selected", true);
        feature.setProperty("elementType", Element_t.E_POLY);
        feature.setProperty("polygonType", type);
        // update selection
        this.setSelectedFeature(feature);
    }*/

    /***
     * setPointProperties(any, number, string): void
     *
     *     Adds the appropriate properties to the polygon based on the current
     *     state and given polygon type.
     ***/
    /*private setPointProperties(feature: any, type: number, info: string): void {
        // assign element properties
        feature.setProperty("state", State_t.S_NEW);
        feature.setProperty("elementId", null);
        feature.setProperty("courseId", this.currentCourse.courseId);
        if (this.selectedHole !== undefined) {
            feature.setProperty("holeId", this.selectedHole.holeId);
        } else {
            feature.setProperty("holeId", null);
        }
        // assign point properties
        feature.setProperty("enabled", true);
        feature.setProperty("selected", true);
        feature.setProperty("elementType", Element_t.E_POINT);
        feature.setProperty("pointType", type);
        feature.setProperty("info", info);
        // update selection
        this.setSelectedFeature(feature);
    }*/

    /***
     * onMapGeometrySet(any): void
     *
     *     Event handler for updated elements on the map. The handler sets the
     *     current selected feature to the updated one and flags the feature
     *     for update.
     ***/
    /*private onMapGeometrySet(e: any) {
        if (e.feature != this.selectedFeature) {
            this.setSelectedFeature(e.feature);
        }
        if (e.feature.getProperty("state") != State_t.S_NEW) {
            e.feature.setProperty("state", State_t.S_UPDATE);
        }
    }*/

    /***
     * onFeatureClick(any): void
     *
     *     Event handler for map element clicks. The handler sets the current
     *     selected feature to the clicked one.
     ***/
    /*private onFeatureClick(e: any) {
        if (e.feature != this.selectedFeature) {
            this.setSelectedFeature(e.feature);
        }
    }*/

    /***
     * onMapClick(any): void
     *
     *     Event handler for map clicks.
     ***/
    /*private onMapClick(e: any) {
        // deselect the selected feature
        this.removeSelectedFeature();
    }*/

    /***************************************************************************
     * UI event handlers.
     **************************************************************************/

    /***
     * createPolygon(string, string, number, string, any) : void
     *
     *     Function that adds a new unsaved Polygon currently on the map
     *     through a API call.
     ***/
    /*private createPolygon(holeId: string, courseId: string, type: number,
        geoJson: string, feature: any) {

        var http;
        if (holeId !== undefined && holeId !== null) {
            // post the polygon to the hole
            http = this.api.holeCreatePolygon(
                holeId,
                type,
                geoJson
            );
        } else {
            // post the polygon to the course
            http = this.api.courseCreatePolygon(
                courseId,
                type,
                geoJson
            );
        }
        http.subscribe(
            result => this.onResult(result.headers,
                result.json(),
                Call_t.C_ELEMENT_CREATE, feature),
            error => this.onFail(error.status,
                error.headers, error.text(),
                Call_t.C_ELEMENT_CREATE),
            () => console.log("Poly saved successfully")
        );
        }*/

    /***
     * createPoint(string, string, number, string, string, any) : void
     *
     *     Function that adds a new unsaved Point currently on the map
     *     through a API call.
     ***/
    /*private createPoint(holeId: string, courseId: string, type: number,
        info: string, geoJson: string, feature: any) {

        var http;
        if (holeId !== undefined && holeId !== null) {
            // post the point to the hole
            http = this.api.holeCreatePoint(
                holeId,
                type,
                info,
                geoJson
            );
        } else {
            // post the point to the course
            http = this.api.courseCreatePoint(
                courseId,
                type,
                info,
                geoJson
            );
        }
        http.subscribe(
            result => this.onResult(result.headers,
                result.json(),
                Call_t.C_ELEMENT_CREATE, feature),
            error => this.onFail(error.status,
                error.headers, error.text(),
                Call_t.C_ELEMENT_CREATE),
            () => console.log("Point saved successfully")
        );
        }*/

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
     * Client side saving and updating handlers for Polygons.
     **************************************************************************/

    /***
     * onElementSaved
     *
     *     This function is called when an element is saved or updated. The
     *     element's properties are set to the properties received from the
     *     response.
     ***/
    /*private onElementSaved(body: any, feature: any) {
        if (feature.properties === undefined) {
            return;
        }
        if (feature !== undefined) {
            if (feature.properties.state !== undefined) {
                feature.properties.state = State_t.S_NONE;
            }
            feature.properties["elementType"] = body.elementType;
            feature.properties["elementId"] = body.elementId;
            feature.properties["courseId"] = body.courseId;
            feature.properties["holeId"] = body.holeId;
            if (body.elementType == Element_t.E_POLY) {
                feature.properties["polygonType"] = body.polygonType;
            } else {
                feature.properties["pointType"] = body.pointType;
                feature.properties["info"] = body.info;
            }
            // TODO explain below
            if (body.holeId != null) {
                this.holes.push(body);
            }
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

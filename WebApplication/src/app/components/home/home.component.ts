/***
 * Filename: home.component.ts
 * Author  : Christaan H Nel, Duncan Tilley
 * Class   : HomeComponent / <home>
 ***/

import { MediaMatcher } from '@angular/cdk/layout';
import { Component, ViewChild, ChangeDetectorRef, Inject, OnInit }
        from '@angular/core';
import { Router } from '@angular/router';
import { GoogleMapsAPIWrapper, AgmMap, AgmDataLayer, PolygonManager,
    LatLngBounds, LatLngBoundsLiteral, DataLayerManager } from '@agm/core';
import { FormControl } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { element } from 'protractor';

import { Course, GolfCourse, Hole, Elements, Polygon }
        from '../../interfaces/course.interface';
import { EmptyClass, Call_t, PolygonState_t }
        from '../../interfaces/enum.interface';
import { ApiService } from '../../services/api/api.service';
import { GlobalsService } from '../../services/globals/globals.service';


declare var google: any;
@Component({
    selector: 'HomeComponent',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent {
    @ViewChild('AgmMap') agmMap: AgmMap;

    // selected items
    selectedFeature: any;

    courses: Course[] = [];
    currentCourse: GolfCourse;
    courseId: string;
    holes: any[] = [];
    holeName: any[] = [];
    selectedHole: any;
    courseName: string;

    url: any;
    selected: number = 0;
    button_state: string = "add";
    // Map -- objects
    geoJsonObject: any;
    googleMap: any = null;
    features: any;
    selectedType: number = 0;

    lat: number = -25.658712;
    lng: number = 28.140347;
    zoom: number = 20;
    mapType: string = "satellite";
    mapDraggable: boolean = true;
    newHoleName: string;
    mobileQuery: MediaQueryList;

    activeElements: any;

    private _mobileQueryListener: () => void;

    terrainTypes = [
        { "typeName": 'Rough', "ttype": 0 },
        { "typeName": 'Fairway', "ttype": 1 },
        { "typeName": 'Green', "ttype": 2 },
        { "typeName": 'Bunker', "ttype": 3 },
        { "typeName": 'Water Hazard', "ttype": 4 }
    ];

    constructor(private api: ApiService, private globals: GlobalsService,
            private router: Router,
            changeDetectorRef: ChangeDetectorRef, media: MediaMatcher,
            public dialog: MatDialog) {

        this.mobileQuery = media.matchMedia('(max-width: 600px)');
        this._mobileQueryListener = () => changeDetectorRef.detectChanges();
        this.mobileQuery.addListener(this._mobileQueryListener);
    }

    ngOnDestroy(): void {
        this.mobileQuery.removeListener(this._mobileQueryListener);
    }

    ngOnInit() {
    }

    mapInteractionClick(event) {
        // for (var i = 0; i < this.features.length; i++) {
        // this.googleMap.data.remove(this.features[i]);
        // });
    }

    fabInteractionClick(event) {
        // console.log(event);
    }

    ngAfterViewInit() {
        // check if a user is logged in
        if (this.globals.getUid() == null) {
            this.router.navigateByUrl("/login");
        } else {
            // load saved courses
            this.api.coursesGet(this.globals.getUid())
                .subscribe(
                    result => this.onResult(result.headers, result.json(),
                        Call_t.C_COURSES_LOAD),
                    error => this.onFail(error.status, error.headers,
                        error.text(), Call_t.C_COURSES_LOAD),
                    () => console.log("Courses loaded successfully.")
                );
            this.setupMap();
        }
    }

    /***
     * setupMap
     *                   _         _
     *     TODO Whatever  \_(o-o)_/
     ***/
    private setupMap() {
        this.agmMap.mapReady.subscribe(map => {
            this.googleMap = map;
            this.googleMap.data.setControls(['Point', 'Polygon']);
            this.setUpMapEvents();
            this.styleFeatures();
        });
    }

    /***
     * setUpMapEvents
     *
     *     Function to set the Map Events listeners.
     ***/
    private setUpMapEvents() {
        this.googleMap.data.addListener("addfeature", e =>
                this.onMapFeatureAdd(e));
        this.googleMap.data.addListener('setgeometry', e =>
                this.onMapGeometrySet(e));
        this.googleMap.data.addListener('click', e =>
                this.onMapClick(e));
    }

    /***
     * styleFeatures
     *
     *     Function that sets the color of the Polygon according to its
     *     polygonType property.
     ***/
    private styleFeatures() {
        this.googleMap.data.setStyle(function (feature) {
            const polyType = feature.getProperty('polygonType');
            let color = '#336699';
            if (polyType == 0) {
                color = '#463E3E';
            }
            if (polyType == 1) {
                color = '#73A15D';
            }
            if (polyType == 2) {
                color = '#BADA55';
            }
            if (polyType == 3) {
                color = '#C2B280';
            }
            return {
                draggable: true,
                editable: true,
                fillColor: color,
                strokeWeight: 1
            };
        });

    }

    /***
     * updateDataLayer(any): void
     *
     *     Updates the items on the map to new items.
     ***/
    public updateDataLayer(geoJson: any) {
        this.geoJsonObject = geoJson;
        if (this.geoJsonObject !== undefined &&
                this.geoJsonObject.features.length !== 0) {
            const bounds: LatLngBounds = new google.maps.LatLngBounds();
            this.geoJsonObject.features.forEach(
                feature => {
                    if (feature.geometry.coordinates[0].forEach != null) {

                        feature.geometry.coordinates[0].forEach(
                            lngLat => bounds.extend(
                                new google.maps.LatLng(lngLat[1], lngLat[0]))
                        );
                    }
                }
            );
            this.googleMap.fitBounds(bounds);
        }
        this.googleMap.data.forEach(
            feature => this.googleMap.data.remove(feature)
        );
        this.googleMap.data.addGeoJson(this.geoJsonObject);
    }

    /***
     * setSelectedFeature(any): void
     *
     *     Sets the currently selected feature and updates the controls to
     *     reflect the selected feature.
     ***/
    private setSelectedFeature(f: any) {
        this.selectedFeature = f;
        // TODO update controls
    }

    /***************************************************************************
     * Map event handlers.
     **************************************************************************/

    /***
     * onMapFeatureAdd(any): void
     *
     *     Event handler for new & loaded elements on the map. The handler adds
     *     the necessary properties to new elements.
     ***/
    private onMapFeatureAdd(e: any) {
        // ignore the loaded polygons
        if (e.feature.getProperty("elementId") === undefined) {
            console.log("=== feature added ===");
            console.log(e.feature);
            console.log("=====================");
            // TODO polygon or point?
            // flag the polygon as new with the proper type and course/hole IDs
            if (this.currentCourse !== undefined) {
                e.feature.setProperty("elementId", null);
                e.feature.setProperty("state", PolygonState_t.PS_NEW);
                e.feature.setProperty("polygonType", this.selectedType);
                e.feature.setProperty("courseId", this.currentCourse.courseId);
                if (this.selectedHole !== undefined) {
                    e.feature.setProperty("holeId", this.selectedHole.holeId);
                } else {
                    e.feature.setProperty("holeId", null);
                }
            } else {
                // TODO remove the invalid feature
                // TODO nice message
                window.alert("Please load or create a course first");
            }
        }
    }

    /***
     * onMapGeometrySet(any): void
     *
     *     Event handler for updated elements on the map. The handler sets the
     *     current selected feature to the updated one and flags the feature
     *     for update.
     ***/
    private onMapGeometrySet(e: any) {
        if (e.feature != this.selectedFeature) {
            this.setSelectedFeature(e.feature);
        }
        e.feature.setProperty("state", PolygonState_t.PS_UPDATE);
    }

    /***
     * onMapClick(any): void
     *
     *     Event handler for map element clicks. The handler sets the current
     *     selected feature to the clicked one.
     ***/
    private onMapClick(e: any) {
        // TODO menu maybe?
        if (e.feature != this.selectedFeature) {
            this.setSelectedFeature(e.feature);
        }
    }

    /***************************************************************************
     * Create, load, save, and delete event handlers for a Course.
     **************************************************************************/

    /***
     * onCreateCourse(string): void
     *
     *     Function that creates a new Course using the API.
     *     On success, call onResult.
     *     On failure, call onFail.
     ***/
    public onCreateCourse(name: string) {
        if (name != "" && name != "Course Name") {
            // create new course
            this.api.coursesCreate(this.globals.getUid(), name)
                .subscribe(
                    result => this.onResult(result.headers, result.json(),
                        Call_t.C_COURSE_CREATE),
                    error => this.onFail(error.status, error.headers,
                        error.text(), Call_t.C_COURSE_CREATE),
                    () => console.log("Course created successfully.")
                );
        } else {
            // TODO nice message
            window.alert("Please enter a course name");
        }
    }

    /***
     * onLoadCourse
     *
     *     Function that retrieves the current (selected) Course using the API.
     *     On success, call onResult.
     *     On failure, call onFail.
     ***/
    public onLoadCourse(index: number) {
        // receive course info
        this.api.courseGet(this.courses[index].courseId)
            .subscribe(
                result => this.onResult(result.headers, result.json(),
                    Call_t.C_COURSE_LOAD),
                error => this.onFail(error.status, error.headers,
                    error.text(), Call_t.C_COURSE_LOAD),
                () => console.log("Course loaded successfully.")
            );
    }

    /***
     * onSaveCourse
     *
     *     Function that saves the current Course using the API.
     *     On success, call onResult.
     *     On failure, call onFail.
     ***/
    public onSaveCourse() {
        this.googleMap.data.toGeoJson(
            data => data.features.forEach(
                feature => {
                    // extract polygon properties
                    var type: number = feature.properties["polygonType"];
                    var geoJson: string = JSON.stringify(feature.geometry);
                    var courseId = feature.properties["courseId"];
                    var holeId = feature.properties["holeId"];

                    // perform the correct action for new, deleted and updated
                    // polygons
                    switch (feature.properties.flag) {
                        case PolygonState_t.PS_NEW:
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
                                    Call_t.C_POLY_CREATE, feature),
                                error => this.onFail(error.status,
                                    error.headers, error.text(),
                                    Call_t.C_POLY_CREATE),
                                () => console.log("Poly saved successfully")
                            );
                            break;

                        case PolygonState_t.PS_UPDATE:
                            /*value['elementId'] =
                                feature.properties.elementId;
                            this.api.updatePolygon(
                                feature.properties.elementId, value)
                                .subscribe(
                                    // TODO somehow remove feature and value
                                    // as parameter
                                    result => this.onResult(result.headers,
                                        result.json(), C_POLY_UPDATE, feature),
                                    error => this.onFail(error.status,
                                        error.headers, error.text(),
                                        C_POLY_UPDATE),
                                    () => console.log("Poly saved successfully")
                                );*/
                            // TODO: implement update
                            break;

                        case PolygonState_t.PS_DELETE:
                            // TODO implement delete
                            break;
                    }
                }
            )
        );
    }

    /***
     * onDeleteCourse
     *
     *     Function that deletes the current (selected) Course using the API.
     *     On success, call onResult.
     *     On failure, call onFail.
     ***/
    public onDeleteCourse(index: number) {
        if (window.confirm("Are you sure you want to delete '" +
            this.courses[index].courseName + "'?")) {
            // delete the course
            this.api.courseDelete(this.courses[index].courseId)
                .subscribe(
                    result => this.onResult(result.headers, result.json(),
                        Call_t.C_COURSE_DELETE),
                    error => this.onFail(error.status, error.headers,
                        error.text(), Call_t.C_COURSE_DELETE),
                    () => console.log("Course created successfully.")
                );
        }
    }

    /***************************************************************************
     * Create and load handler for Holes.
     **************************************************************************/

    /***
    * onAddHoles
    *
    *     Function that creates a new Hole for the current Course using the
    *     API.
    *     On success, call onResult.
    *     On failure, call onFail.
    ***/
    public onAddHole() {
        console.log("New hole name:", this.newHoleName);
        if (this.newHoleName != "" && this.newHoleName !== undefined &&
            this.newHoleName != "Hole Name") {
            this.api.holesCreate(this.currentCourse.courseId, this.newHoleName)
                .subscribe(
                    result => this.onResult(result.headers, result.json(),
                        Call_t.C_HOLE_CREATE),
                    error => this.onFail(error.status, error.headers,
                        error.text(), Call_t.C_HOLE_CREATE),
                    () => console.log("Hole added successfully.")
                );
        } else {
            // TODO nice message
            window.alert("Please enter a Hole name");
        }
    }

    /***
     * onLoadHoles
     *
     *     Function that retrieves the Holes of a Course from the API.
     *     On success, call onResult.
     *     On failure, call onFail.
     ***/
    private onLoadHoles() {
        this.holes = [];
        this.currentCourse.holes.forEach(
            hole => this.api.holeGet(hole.holeId)
                .subscribe(
                    result => this.onResult(result.headers, result.json(),
                        Call_t.C_HOLE_LOAD),
                    error => this.onFail(error.status, error.headers,
                        error.text(), Call_t.C_HOLE_LOAD),
                    () => console.log("Hole loaded successfully.")
                )
        );
    }

    /***************************************************************************
     * Create, load, update, and delete handler for Points.
     **************************************************************************/

    public onCreatePoint() {
    }

    /***************************************************************************
     * Client side saving and updating handlers for Polygons.
     **************************************************************************/

    /***
     * onPolygonSaved
     *
     *     This function is called when a polygon is saved or updated in
     *     onSaveCourse(...). The feature parameter's state (feature.flag) will
     *     be reset to PolygonState.PS_NONE
     ***/
    private onPolygonSaved(body: any, feature: any) {
        if (feature.property === undefined) {
            return;
        }
        if (feature !== undefined) {
            if (feature.property.flag !== undefined) {
                feature.property.flag = PolygonState_t.PS_NONE;
            }
            feature.property["polygonType"] = body.polygonType;
            feature.property["elementId"] = body.elementId;
            feature.property["courseId"] = body.courseId;
            feature.property["holeId"] = body.holeId;
            if (body.holeId != null) {
                this.holes.push(body);
            }
        }
    }

    /***************************************************************************
     * Other event handlers.
     **************************************************************************/

    /***
     * onToggleDraggable(): void
     *
     *     Toggles the draggable option of the map.
     ***/
    public onToggleDraggable() {
        this.mapDraggable = !this.mapDraggable;
    }

    /***
     * onResetMap(): void
     *
     *     Removes all drawn items on the map.
     ***/
    public onResetMap() {
        this.selectedHole = undefined;
        this.currentCourse = undefined;
        this.holes = [];
        this.selected = 0;

        this.googleMap.data.forEach(
            feature => this.googleMap.data.remove(feature)
        );
        this.googleMap.setCenter({ lat: this.lat, lng: this.lng });
        this.googleMap.setZoom(this.zoom);

    }

    /***************************************************************************
     * API response handlers.
     **************************************************************************/

    /***
     * onResult(any, any, Call_t, any): void
     *
     *     Function to be called after each successful API call.
     ***/
    private onResult(headers: any, body: any, callType: Call_t,
            feature: any = null) {
        switch (callType) {
            case Call_t.C_COURSES_LOAD:
                for (var i = 0; i < body.length; ++i) {
                    this.courses.push(body[i]);
                }
                break;
            case Call_t.C_COURSE_CREATE:
                this.courses.push(body);
                this.onResetMap();
                this.currentCourse = body;
                this.selected = this.courses.indexOf(body);
                break;
            case Call_t.C_COURSE_LOAD:
                this.currentCourse = body;
                this.activeElements = {
                    "type": "FeatureCollection",
                    "features": [
                        ...this.generateFeature(this.currentCourse.elements)
                    ]
                }
                this.onLoadHoles();
                this.updateDataLayer(this.activeElements);
                break;
            case Call_t.C_COURSE_SAVE:
                this.onSaveCourse()
                break;
            case Call_t.C_COURSE_DELETE:
                window.alert("Delete successful");
                // find the element to remove from the list
                var i = 0;
                var done = false;
                while (!done && i < this.courses.length) {
                    if (this.courses[i].courseId == body.courseId) {
                        this.courses.splice(i, 1);
                        done = true;
                    }
                    ++i;
                }
                break;
            case Call_t.C_HOLE_CREATE:
                if (this.currentCourse.holes === null) {
                    this.currentCourse.holes = [];
                }
                this.currentCourse.holes.push(body);
                break;
            case Call_t.C_HOLE_LOAD:
                this.holes.push(body);
                if (this.holes.length === this.currentCourse.holes.length) {
                    this.showHoles();
                }
                break;
            case Call_t.C_POLY_CREATE:
            case Call_t.C_POLY_UPDATE:
                this.onPolygonSaved(body, feature);
                break;
            default:
                window.alert("Success: Default success message.");
                break;
        }
    }

    /***
     * onFail(number, any, any, Call_t): void
     *
     *     Function to be called after each failed API call.
     ***/
    private onFail(status: number, headers: any, body: any, callType: Call_t) {
        //console.log(JSON.stringify(body));
        switch (callType) {
            case Call_t.C_COURSES_LOAD:
                window.alert("Error: Failed to load saved courses.");
                break;
            case Call_t.C_COURSE_CREATE:
                window.alert("Error: Failed to create course.");
                break;
            case Call_t.C_COURSE_LOAD:
                window.alert("Error: Failed to load course.");
                break;
            case Call_t.C_COURSE_SAVE:
                window.alert("Error: Failed to save course.");
                break;
            case Call_t.C_COURSE_DELETE:
                window.alert("Error: Failed to delete course.");
                break;
            case Call_t.C_HOLE_CREATE:
                window.alert("Error: Failed to create hole.");
                break;
            case Call_t.C_POLY_CREATE:
                window.alert("Error: Failed to create polygon.");
                break;
            case Call_t.C_POLY_UPDATE:
                window.alert("Error: Failed to update polygon.");
                break;
            default:
                window.alert("Error: Default error message.");
                break;
        }
    }

    /***
     * generateFeature(Array<any>): void
     *
     *     TODO No idea
     ***/
    private generateFeature(collection: Array<any>) {
        let elements: Array<any> = [];
        if (collection !== undefined && collection !== null) {
            collection.forEach(
                element => {
                    let value =
                        {
                            "type": "Feature",
                            "geometry": {
                                ...JSON.parse(element.geoJson)
                            },
                            "properties": {
                                "state": PolygonState_t.PS_NONE,
                                "polygonType": element['polygonType'],
                                "elementId": element.elementId,
                                "courseId": element.courseId,
                                "holeId": element.holeId
                            }
                        }
                    elements.push(value);
                    this.courseId = element.courseId
                }
            );
        }
        return elements;
    }

    /***
     * showHoles(): void
     *
     *     TODO No idea
     ***/
    private showHoles() {
        let tempHolder: any = [...this.generateFeature(this.currentCourse
            .elements)];
        this.holes.forEach(hole => {
            tempHolder = [...tempHolder, ...this.generateFeature(hole
                .elements)]
        });
        this.activeElements = {
            "type": "FeatureCollection",
            "features": [
                ...tempHolder
            ]
        }
        this.updateDataLayer(this.activeElements);
    }

    /***
     * filterHoles(string): void
     *
     *     TODO no idea
     *     Possibly filter which holes to show?
     ***/
    private filterHoles(holeId: string) {
        let tempHolder: any = [...this.generateFeature(this.currentCourse
            .elements)];
        this.holes.forEach(hole => {
            if (hole.holeId === holeId) {
                tempHolder = [...tempHolder, ...this.generateFeature(hole
                    .elements)]
            }
        });
        this.activeElements = {
            "type": "FeatureCollection",
            "features": [
                ...tempHolder
            ]
        }
        this.updateDataLayer(this.activeElements);
    }

    /***
     * updateHoles(any): void
     *
     *     TODO no idea
     ***/
    public updateHoles(event: any) {
        if (event.value !== undefined) {
            this.filterHoles(event.value.holeId);
        } else {
            this.showHoles();
        }
    }
}

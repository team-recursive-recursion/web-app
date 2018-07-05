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
import { EmptyClass, Call_t, State_t, Point_t, Element_t, Polygon_t }
        from '../../interfaces/enum.interface';
import { ApiService } from '../../services/api/api.service';
import { GlobalsService } from '../../services/globals/globals.service';
import { LIVE_ANNOUNCER_ELEMENT_TOKEN } from '@angular/cdk/a11y';


declare var google: any;
@Component({
    selector: 'HomeComponent',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent {
    @ViewChild('AgmMap') agmMap: AgmMap;

    // selected items
    selectedFeature: any = null;

    removedFeatures: Array<any> = []; // list of elements to be deleted

    courses: Course[] = [];
    currentCourse: GolfCourse;
    courseId: string;
    holes: any[] = [];
    holeName: any[] = [];
    selectedHole: any;
    courseName: string;
    pointInfo: string;

    url: any;
    selected: number = 0;
    button_state: string = "add";
    // Map -- objects
    geoJsonObject: any;
    googleMap: any = null;
    features: any;
    polyType: number = 0;
    pointType: number = 0;

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
        { "typeName": 'Rough', "ttype": Polygon_t.P_ROUGH },
        { "typeName": 'Fairway', "ttype": Polygon_t.P_FAIR },
        { "typeName": 'Green', "ttype": Polygon_t.P_GREEN },
        { "typeName": 'Bunker', "ttype": Polygon_t.P_BUNKER },
        { "typeName": 'Water Hazard', "ttype": Polygon_t.P_WATER }
    ];

    pointTypes = [
        {"pointName": 'Pin', "ptype": Point_t.P_PIN},
        {"pointName": 'Hole', "ptype": Point_t.P_HOLE},
        {"pointName": 'Tee', "ptype": Point_t.P_TEE}
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
        console.log(geoJson);
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
     *
     ***/
    private getMapDrawingMode() {
        // REALLY UGLY WAY TO GET THE CURRENT DRAWINGMANAGERMODE
        //                      _         _
        //                       \_(o-o)_/

        let obj = this.googleMap.data.gm_bindings_.drawingMode;
        for (var a in this.googleMap.data.gm_bindings_.drawingMode) {
            return obj[a].kd.getDrawingManagerMode();
        }
    }

    /***
     * onMapFeatureAdd(any): void
     *
     *     Event handler for new & loaded elements on the map. The handler adds
     *     the necessary properties to new elements.
     ***/
    private onMapFeatureAdd(e: any) {
        // ignore the loaded elements
        if (e.feature.getProperty("elementId") === undefined) {
            // flag the element as new with the proper type and course/hole IDs
            if (this.currentCourse !== undefined) {
                let mapDrawingMode = this.getMapDrawingMode();
                console.log("Drawing Mode: " + mapDrawingMode);
                if (mapDrawingMode !== undefined) {
                    e.feature.setProperty("state", State_t.S_NEW);
                    e.feature.setProperty("elementId", null);
                    e.feature.setProperty("courseId",
                            this.currentCourse.courseId);
                    if (this.selectedHole !== undefined) {
                        e.feature.setProperty("holeId",
                                this.selectedHole.holeId);
                    } else {
                        e.feature.setProperty("holeId", null);
                    }
                    // assign polygon or point properties
                    if (mapDrawingMode == "polygon") {
                        e.feature.setProperty("elementType", Element_t.E_POLY);
                        e.feature.setProperty("polygonType", this.polyType);
                    } else if (mapDrawingMode == "marker") {
                        e.feature.setProperty("elementType", Element_t.E_POINT);
                        e.feature.setProperty("pointType", this.pointType);
                        // get point info
                        var info: string = this.pointInfo;
                        if (info == "Point Info" || info === undefined) {
                            info = "";
                        }
                        window.alert("Info: " + info);
                        e.feature.setProperty("info", info);
                    }
                }
            } else {
                // remove the invalid feature
                this.googleMap.data.remove(e.feature);
                // TODO nice message
                window.alert("Please load or create a course first.");
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
        if (e.feature.getProperty("state") != State_t.S_NEW) {
            e.feature.setProperty("state", State_t.S_UPDATE);
        }
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
     * UI event handlers.
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
     * onSaveCourse(): void
     *
     *     Function that saves the current course. New elements are posted,
     *     updated elements are put and removed elements are deleted.
     ***/
    public onSaveCourse() {
        // delete removed elements
        this.removedFeatures.forEach(feature => {
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
                    console.log("POO:", feature);
                    // extract polygon properties

                    var type: number;
                    if (feature.geometry.type == "Point") {
                        type = feature.properties["pointType"];
                    } else {
                        type = feature.properties["polygonType"];
                    }
                    var geoJson: string = JSON.stringify(feature.geometry);
                    var courseId = feature.properties["courseId"];
                    var holeId = feature.properties["holeId"];

                    // perform the correct action for new, deleted and updated
                    // polygons
                    switch (feature.properties.state) {
                        case State_t.S_NEW:
                            if (feature.properties.elementType ==
                                    Element_t.E_POLY) {
                                this.createPolygon(holeId, courseId, type,
                                        geoJson);
                            } else if (feature.properties.elementType ==
                                    Element_t.E_POINT) {
                                let info = feature.properties["info"];
                                this.createPoint(holeId, courseId, type, info,
                                        geoJson);
                            }
                            break;

                        case State_t.S_UPDATE:
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
                    }
                    console.log("Success: Course saved");
                }
            )
        );
    }

    /***
     * createPolygon(string, string, number, string) : void
     *
     *     Yeaaaaaaah
     ***/
    private createPolygon(holeId: string, courseId: string, type: number,
            geoJson: string) {

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
    }

    /***
     * createPoint(string, string, number, string, string) : void
     *
     *     Yeaaaaaaah
     ***/
    private createPoint(holeId: string, courseId: string, type: number,
            info: string, geoJson: string) {

        var http;
        console.log("HOLEID:" + holeId);
        console.log("COURSEID:" + courseId);
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

    /***
     * onDeleteElement(): void
     *
     *     Deletes the currently selected feature and adds it to the remove
     *     list.
     */
    public onDeleteElement() {
        if (this.selectedFeature !== null) {
            this.googleMap.data.remove(this.selectedFeature);
            if (this.selectedFeature.getProperty("state") != State_t.S_NEW) {
                this.removedFeatures.push(this.selectedFeature);
                this.selectedFeature.setProperty("state", State_t.S_DELETE);
            }
            this.selectedFeature = null;
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
     * Client side saving and updating handlers for Polygons.
     **************************************************************************/

    /***
     * onElementSaved
     *
     *     This function is called when an element is saved or updated. The
     *     element's properties are set to the properties received from the
     *     response.
     ***/
    private onElementSaved(body: any, feature: any) {
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
            case Call_t.C_ELEMENT_CREATE:
            case Call_t.C_ELEMENT_UPDATE:
                console.log("BODY:",body);
                this.onElementSaved(body, feature);
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
            case Call_t.C_COURSE_DELETE:
                window.alert("Error: Failed to delete course.");
                break;
            case Call_t.C_HOLE_CREATE:
                window.alert("Error: Failed to create hole.");
                break;
            case Call_t.C_ELEMENT_CREATE:
                window.alert("Error: Failed to create element.");
                break;
            case Call_t.C_ELEMENT_UPDATE:
                window.alert("Error: Failed to update element.");
                break;
            case Call_t.C_ELEMENT_LOAD:
                window.alert("Error: Failed to load element.");
            case Call_t.C_ELEMENT_DELETE:
                window.alert("Error: Failed to delete element.");
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
                    let value;
                    if (element.elementType == Element_t.E_POINT) {
                        value =
                            {
                                "type": "Feature",
                                "geometry": {
                                    ...JSON.parse(element.geoJson)
                                },
                                "properties": {
                                    "state": State_t.S_NONE,
                                    "pointType": element['pointType'],
                                    "elementType": element.elementType,
                                    "elementId": element.elementId,
                                    "courseId": element.courseId,
                                    "holeId": element.holeId
                                }
                            }
                    } else if (element.elementType == Element_t.E_POLY) {
                        value =
                            {
                                "type": "Feature",
                                "geometry": {
                                    ...JSON.parse(element.geoJson)
                                },
                                "properties": {
                                    "state": State_t.S_NONE,
                                    "polygonType": element['polygonType'],
                                    "elementType": element.elementType,
                                    "elementId": element.elementId,
                                    "courseId": element.courseId,
                                    "holeId": element.holeId
                                }
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

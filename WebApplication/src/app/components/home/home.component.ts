/***
 * Filename: home.component.ts
 * Author  : Christaan H Nel, Duncan Tilley
 * Class   : HomeComponent / <home>
 ***/

import { MediaMatcher } from '@angular/cdk/layout';
import { Component, ViewChild, ChangeDetectorRef, Inject, OnInit }
    from '@angular/core';
import { Course, GolfCourse, Hole, Elements, Polygon }
    from '../../interfaces/course.interface';
import { ApiService } from '../../services/api.service';
import {
    GoogleMapsAPIWrapper, AgmMap, AgmDataLayer, PolygonManager,
    LatLngBounds, LatLngBoundsLiteral, DataLayerManager
} from '@agm/core';
import { FormControl } from '@angular/forms';

import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

declare var google: any;
@Component({
    selector: 'HomeComponent',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    providers: [ApiService]
})
export class HomeComponent {
    @ViewChild('AgmMap') agmMap: AgmMap;

    courses: Course[] = [];
    currentCourse: GolfCourse;
    courseId: string;
    holes: any;// = ['hole 1', 'hole 2', 'hole 3', 'hole 4'];
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
    private _mobileQueryListener: () => void;

    terrainTypes = [
        { "typeName": 'Rough', "ttype": 0 },
        { "typeName": 'Fairway', "ttype": 1 },
        { "typeName": 'Green', "ttype": 2 },
        { "typeName": 'Bunker', "ttype": 3 },
        { "typeName": 'Water Hazard', "ttype": 4 }
    ];

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


    constructor(private api: ApiService, changeDetectorRef: ChangeDetectorRef,
        media: MediaMatcher, public dialog: MatDialog) {
        this.mobileQuery = media.matchMedia('(max-width: 600px)');
        this._mobileQueryListener = () => changeDetectorRef.detectChanges();
        this.mobileQuery.addListener(this._mobileQueryListener);
    }

    ngAfterViewInit() {
        // load saved courses
        this.api.getCourses()
            .subscribe(
                result => this.onCoursesReceive(result.headers, result.json()),
                error => this.onCoursesFail(error.status, error.headers,
                    error.text()),
                () => console.log("Courses loaded successfully.")
            );
        this.agmMap.mapReady.subscribe(map => {
            this.googleMap = map;
            const bounds: LatLngBounds = new google.maps.LatLngBounds();
            if (this.geoJsonObject !== undefined) {
                this.geoJsonObject.geometry.coordinates[0].forEach(element => {
                    bounds.extend(new google.maps.LatLng(element[1], element[0]));
                });
                map.fitBounds(bounds);
            }
            this.features = map.data.addGeoJson(this.geoJsonObject);
            this.googleMap.data.setControls(['Point', 'LineString', 'Polygon']);
            this.googleMap.data.setStyle({
                editable: true,
                draggable: true
            });
            this.features.forEach(feature => {
                this.googleMap.data.overrideStyle(feature, { editable: true });
            });
            this.googleMap.data.setStyle(function (feature) {
                const polyType = feature.getProperty('type');
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
            this.googleMap.data.addListener("addfeature", e => {

                if (e.feature.getProperty('type') === undefined) {
                    e.feature.setProperty("type", this.selectedType);
                    e.feature.setProperty("courseId", this.currentCourse.courseId);
                    e.feature.setProperty("holeId", this.selectedHole.holeID);
                    e.feature.setProperty("flag", Flags.NEW);
                }
            });
            this.googleMap.data.addListener('setgeometry',
                e => {
                    e.feature.setProperty('type', this.selectedType);
                    e.feature.setProperty('flag', Flags.UPDATE);
                }
            );
            this.googleMap.data.addListener('click',
                e => {
                    e.feature.setProperty('type', this.selectedType);
                    e.feature.setProperty('flag', Flags.UPDATE);
                }
            );
        });
    }

    public updateDataLayer(geoJson: any) {
        //this.googleMap.data.remove(this.features);
        const bounds: LatLngBounds = new google.maps.LatLngBounds();
        this.geoJsonObject = geoJson;
        if (this.geoJsonObject !== undefined) {
            this.geoJsonObject.features.forEach(
                feature => {
                    if (feature.geometry.coordinates[0].forEach != null)
                        feature.geometry.coordinates[0].forEach(
                            lnglat => bounds.extend(
                                new google.maps.LatLng(lnglat[1], lnglat[0]))
                        );
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
     * Load, create and delete event handlers for Courses.
     ***/
    public onLoadCourses() {
        this.api.getCourses()
            .subscribe(
                result => this.onCoursesReceive(result.headers,
                    result.json()),
                error => this.onCoursesFail(error.status, error.headers,
                    error.text()),
                () => console.log("Courses loaded successfully.")
            );
    }

    public onLoadCourse(index: number) {
        //window.alert("Loading course '" + this.courses[index].courseName + "'");
        // close the modal
        var close = document.getElementById("modal-close");
        if (close) {
            close.click();
        }
        this.api.getCourse(this.courses[index].courseId)
            .subscribe(
                result => this.onCourseReceive(result.headers, result.json()),
                error => this.onCourseFail(error.status, error.headers,
                    error.text()),
                () => console.log("Course loaded successfully.")
            );
    }

    public onDeleteCourse(index: number) {
        // console.log(this.courses[index], index);
        if (window.confirm("Are you sure you want to delete '" +
            this.courses[index].courseName + "'?")) {
            // delete the course
            this.api.deleteCourse(this.courses[index].courseId)
                .subscribe(
                    result => this.onDeleteReceive(result.headers,
                        result.json()),
                    error => this.onDeleteFail(error.status, error.headers,
                        error.text()),
                    () => console.log("Course created successfully.")
                );
        }
        // TODO
    }

    public onCreateCourse(name: string) {
        // console.log("Course name: " + name);
        if (name != "" && name != "Course Name") {
            // create new course
            this.api.createCourse(name)
                .subscribe(
                    result => this.onCreateReceive(
                        result.headers,
                        result.json()
                    ),
                    error => this.onCreateFail(error.status, error.headers
                        , error.text()),
                    () => console.log("Course created successfully.")
                );
        } else {
            // TODO nice message
            window.alert("Please enter a course name");
        }
    }

    /***
     * Create, update, delete handlers for Holes.
     ***/
    public onAddHole() {
        console.log("New hole name:", this.newHoleName);
        if (this.newHoleName != "" && this.newHoleName !== undefined && 
                this.newHoleName != "Hole Name") {
            let body = {
                "Name": this.newHoleName,
                "courseId": this.currentCourse.courseId
            }
            this.api.addHole(body)
                .subscribe(
                    result => this.onHoleCreate(result.headers, result.json()),
                    error => this.onHoleFail(error.status, error.headers),
                    () => console.log("Hole added successfully.")
                );

        } else {
            // TODO nice message
            window.alert("Please enter a course name");
        }
    
    }


    /***
     * Other event handlers.
     ***/
    public onSaveCourse() {
        this.googleMap.data.toGeoJson(
            data => data.features.forEach(
                feature => {
                    let value = {
                        "type": feature.properties['type'],
                        "geoJson": JSON.stringify(feature.geometry),
                        "courseId": feature.properties['courseId'],
                        "holeId": feature.properties['holeId'],
                    };
                    
                    console.log("VALUE: " ,value);
                    switch (feature.properties.flag) {
                        case Flags.NEW:
                            //if () { // is it is connected to a hole
                            //} else { // else it is global
                            this.api.addPolygon(value)
                                .subscribe(
                                    result => this.onPolyonSaved(
                                        result.headers, result.json()),
                                    error => this.onPolygonFail(error.status,
                                        error.headers, error.text(), value),
                                    () => console.log("Polygon saved succesfully.")
                                );
                            //}
                            break;
                        case Flags.UPDATE:
                            value['courseElementId'] =
                                feature.properties.courseElementId;
                            this.api.updatePolygon(
                                feature.properties.courseElementId, value)
                                .subscribe(
                                    result => this.onPolygonUpdate(
                                        result.headers, result.json()),
                                    error => this.onPolygonFail(error.status,
                                        error.headers, error.text(), value),
                                    () => console.log("Polygon saved succesfully.")
                                );
                            break;
                        case Flags.DELETE:

                            break;
                        default:
                            break;
                    }
                }
            ));
        //TODO update elements, add elements, and delete elements

    }

    public onToggleDraggable() {
        this.mapDraggable = !this.mapDraggable;
    }

    public onChangePolyType(bool: boolean, index: number) {

        // todo 
        // this.map.onChangePolyType(bool, index);
    }

    public onNewPolygon() {
        // console.log(this.googleMap.data);
    }

    public onResetMap() {
        this.selectedHole = undefined;
        this.currentCourse = undefined;
        this.selected = 0;

        this.googleMap.data.forEach(
            feature => this.googleMap.data.remove(feature)
        );
        this.googleMap.setCenter({lat: this.lat, lng: this.lng});
        this.googleMap.setZoom(this.zoom);

    }

    /***
     * API response handlers.
     ***/
    private onCoursesReceive(headers: any, body: any) {
        for (var i = 0; i < body.length; ++i) {
            this.courses.push(body[i]);
        }
    }

    private onCoursesFail(status: number, headers: any, body: any) {
        window.alert("Failed to load saved courses.");
        // TODO disable selector
    }

    private onCourseReceive(headers: any, body: any) {
        this.currentCourse = body;
        // console.log(body);
        let elements: Array<any> = [];
        this.currentCourse.courseElements.forEach(
            element => {
                let value =
                    {
                        "type": "Feature",
                        "geometry": {
                            ...JSON.parse(element.geoJson)
                        },
                        "properties": {
                            "flag": Flags.NONE,
                            "type": element['type'],
                            "courseElementId": element.courseElementId,
                            "courseId": element.courseId,
                            "holeId": element.holeId
                        }
                    }
                elements.push(value);
                this.courseId = element.courseId
            }
        );
        let temp: any = {
            "type": "FeatureCollection",
            "features": [
                ...elements
            ]
        }

        this.updateDataLayer(temp);
    }

    private onCourseFail(status: number, headers: any, body: any) {
        window.alert("Failed to load course.");
    }

    private onCreateReceive(headers: any, body: any) {
        this.courses.push(body);
        this.currentCourse = body;
        this.selected = this.courses.indexOf(body);
    }

    private onCreateFail(status: number, headers: any, body: any) {
        // TODO nice message
        window.alert("Create failed");
    }

    private onDeleteReceive(headers: any, body: any) {
        // TODO nice message
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
    }

    private onDeleteFail(status: number, headers: any, body: any) {
        // TODO nice message
        window.alert("Delete failed");
    }

    private onPolygonFail(status: number, headers: any, body: any, val: any) {
        window.alert("<Something> polygon failed");
        // console.log(val);
    }

    private onPolyonSaved(headers: any, body: any) {
        // console.log("Polygon saved", body);
    }

    private onPolygonUpdate(headers: any, body: any) {
        // console.log("Polygon saved", body);
    }

    private onHoleCreate(headers: any, body: any) {
        console.log("Hole added:", body);
        this.currentCourse['holes'].push(body);
    }

    private onHoleFail(headers: any, body: any) {
        window.alert("Hole creation failed");
    }
}

enum Flags {
    NEW = 0,
    UPDATE,
    DELETE,
    NONE,
}

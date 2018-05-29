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
    styleUrls: ['./home.component.css'],
    providers: [ApiService]
})

export class HomeComponent {
    @ViewChild('AgmMap') agmMap: AgmMap;

    courses: Course[] = [];
    currentCourse: GolfCourse;

    url: any;
    selected: number = 0;
    button_state: string = "add";
    // Map -- objects
    geoJsonObject: any;
    geoString: string = '{"type": "Feature","geometry":{"type": "Polygon","coordinates": [[[21.97265625,-3.337953961416472],[15.468749999999998,-9.79567758282973],[18.720703125,-18.646245142670598],[28.564453125,-12.897489183755892],[34.1015625,0.08789059053082422],[25.224609375,17.14079039331665],[15.8203125,17.22475820662464],[21.97265625,-3.337953961416472]]]}}';
    googleMap: any = null;
    features: any;
    selectedType: number = 0;

    lat: number = -25.658712;
    lng: number = 28.140347;
    zoom: number = 20;
    mapType: string = "satellite";
    mapDraggable: boolean = true;

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
        this.geoJsonObject = JSON.parse(this.geoString);
    }

    mapInteractionClick(event) {
        // for (var i = 0; i < this.features.length; i++) {
        // this.googleMap.data.remove(this.features[i]);
        // });
    }

    fabInteractionClick(event) {
        console.log(event);
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
            this.geoJsonObject.geometry.coordinates[0].forEach(element => {
                bounds.extend(new google.maps.LatLng(element[1], element[0]));
            });
            map.fitBounds(bounds);
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
                console.log("Added a polygon to the data of the map");

                if (e.feature.getProperty('type') === undefined) {
                    console.log("The element is completely new and do not have a type added the selected type ", this.selectedType);
                    e.feature.setProperty("type", this.selectedType);
                }
            });
            this.googleMap.data.addListener('setgeometry',
                e => {
                    console.log("Element on map's geometry have been edited new values are", e);
                    e.feature.setProperty('type', this.selectedType);
                }
            );
            this.googleMap.data.addListener('click',
                e => {

                    console.log("Item was clicked on so changed type to ", this.selectedType);
                    e.feature.setProperty('type', this.selectedType);
                }
            );
        });
    }

    public updateDataLayer(geoJson: any) {
        //this.googleMap.data.remove(this.features);
        const bounds: LatLngBounds = new google.maps.LatLngBounds();

        this.geoJsonObject = geoJson;
        console.log(geoJson);
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
        if (name != "" && name != "Course Name") {
            // create new course
            this.api.createCourse(name)
                .subscribe(
                    result => this.onCreateReceive(result.headers,
                        result.json()),
                    error => this.onCreateFail(error.status, error.headers,
                        error.text()),
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


    /***
     * Other event handlers.
     ***/
    public onSaveCourse() {
        this.googleMap.data.toGeoJson(
            data => console.log(data)
        );
    }

    public onToggleDraggable() {
        this.mapDraggable = !this.mapDraggable;
    }

    public onChangePolyType(bool: boolean, index: number) {

        // todo 
        // this.map.onChangePolyType(bool, index);
    }

    public onNewPolygon() {
        console.log(this.googleMap.data);
    }

    public onResetMap() {
        this.googleMap.data.forEach(
            feature => this.googleMap.data.remove(feature)
        );
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
        console.log(body);
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
                            "type": element['type'],
                            "courseElementId": element.courseElementId,
                            "courseId": element.courseId
                        }
                    }
                elements.push(value);
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
        // close the modal
        var close = document.getElementById("modal-close");
        if (close) {
            close.click();
        }
        // todo update the mapper
        // this.map.onLoadCourse(body);
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

 
}

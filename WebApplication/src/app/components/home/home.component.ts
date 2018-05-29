/***
 * Filename: home.component.ts
 * Author  : Christaan H Nel, Duncan Tilley
 * Class   : HomeComponent / <home>
 ***/

import { MediaMatcher } from '@angular/cdk/layout';
import { Component, ViewChild, ChangeDetectorRef, Inject, OnInit } from '@angular/core';
import { Course, Hole, Elements, Polygon } from '../../interfaces/course.interface';
import { ApiService } from '../../services/api.service';
import {
    GoogleMapsAPIWrapper, AgmMap, AgmDataLayer, PolygonManager,
    LatLngBounds, LatLngBoundsLiteral, DataLayerManager
} from '@agm/core';

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
        });
    }

    /***
     * Load, create and delete event handlers.
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
        window.alert("Loading course '" + this.courses[index].courseName + "'");
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
     * Other event handlers.
     ***/
    public onSaveCourse() {
  // todo 
        // this.map.onSaveCourse();
    }

    public onToggleDraggable() {
        this.googleMap.draggable = !this.googleMap.draggable;
    }

    public onChangePolyType(bool: boolean, index: number) {

  // todo 
        // this.map.onChangePolyType(bool, index);
    }

    public onNewPolygon() {

  // todo 
        // this.map.onNewPolygon();
    }

    public onResetMap() {

  // todo 
        // this.map.onResetMap();
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
    }

    private onCourseFail(status: number, headers:any, body: any) {
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

    openDialog(): void {
        let dialogRef = this.dialog.open(CourseDialog, {
            width: '70vw',
            data: { courses: this.courses }
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log('The dialog was closed');
            // this.animal = result;
        });
    }
}

@Component({
    selector: 'course.dialog',

    styleUrls: ['./course.dialog.css'],
    templateUrl: 'course.dialog.html',
})
export class CourseDialog {

    constructor(
        public dialogRef: MatDialogRef<CourseDialog>,
        @Inject(MAT_DIALOG_DATA) public data: any) { }

    onNoClick(): void {
        this.dialogRef.close();
    }

}

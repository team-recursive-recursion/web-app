/***
 * Filename: home.component.ts
 * Author  : Christaan H Nel, Duncan Tilley
 * Class   : HomeComponent / <home>
 ***/

import { Component, ViewChild } from '@angular/core';
import { MapperComponent } from '../mapper/mapper.component'
import { GeoJSON } from 'geojson'
import { Course, Hole, Elements, Polygon } from 
        '../../interfaces/course.interface';
import { ApiService } from '../../services/api.service';

@Component({
    selector: 'HomeComponent',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css'],
    providers: [ApiService]
})
export class HomeComponent {
    @ViewChild(MapperComponent) public map: MapperComponent;
    url: any;
    courseId: string = "";
    selected: number = 0;

    terrainTypes = [
        {"typeName": 'Rough', "ttype": 0},
        {"typeName": 'Fairway', "ttype": 1},
        {"typeName": 'Green', "ttype": 2},
        {"typeName": 'Bunker', "ttype": 3},
        {"typeName": 'Water Hazard', "ttype": 4}
    ];

    courses: Course[] = [];

    constructor(private api: ApiService) {
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
    }

    /***
     * Load, create and delete event handlers.
     ***/
    public onLoadCourse(index: number) {
        window.alert("Loading course '" + this.courses[index].courseName + "'");
        // close the modal
        var close = document.getElementById("modal-close");
        if (close) {
            close.click();
        }
        // update the mapper
        this.map.onLoadCourse(this.courses[index]);
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
        this.map.onSaveCourse();
    }

    public onToggleDraggable() {
        this.map.onToggleDraggable();
    }

    public onChangePolyType(bool: boolean, index: number) {
        this.map.onChangePolyType(bool, index);
    }
    
    public onNewPolygon() {
        this.map.onNewPolygon();
    }

    public onResetMap() {
        this.map.onResetMap();
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

    private onCreateReceive(headers: any, body: any) {
        this.courses.push(body);
        // close the modal
        var close = document.getElementById("modal-close");
        if (close) {
            close.click();
        }
        // update the mapper
        this.map.onLoadCourse(body);
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

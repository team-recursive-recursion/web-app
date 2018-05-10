/***
 * Filename: home.component.ts
 * Author  : Christaan H Nel
 * Class   : HomeComponent / <home>
 ***/

import { Component, ViewChild } from '@angular/core';
import { MapperComponent } from '../mapper/mapper.component'
import { GeoJSON } from 'geojson'
import { Course, Hole, Elements, Polygon } from 
        '../../interfaces/course.interface';

@Component({
    selector: 'HomeComponent',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent {
    @ViewChild(MapperComponent) public map: MapperComponent;
    url: any;
    courseId: string = "";

    terrainTypes = [
        {"typeName": 'Rough', "ttype": 0},
        {"typeName": 'Fairway', "ttype": 1},
        {"typeName": 'Green', "ttype": 2},
        {"typeName": 'Bunker', "ttype": 3},
        {"typeName": 'Water Hazard', "ttype": 4}
    ];

    courses: Course[] = [];

    ngAfterViewInit() {
        console.log("whatever");
        this.onCreateCourse("Koooos");
        this.onLoadCourses();
        this.onLoadCourse("fcb67d04-1eb4-45d0-a1fa-0df35616ba63");
        this.onSaveCourse();
    }

    public onToggleDraggable() {
        this.map.onToggleDraggable();
    }

    public onChangePolyType(bool: boolean, index: number) {
        this.map.onChangePolyType(bool, index);
    }

    constructor() {
    }
    
    public onNewPolygon() {
        this.map.onNewPolygon();
    }

    public onCreateCourse(courseName: string) {
        if (courseName != "") {
            //TODO call API
            this.map.onCreateCourse(courseName);
        }
    }

    public onSaveCourse() {
        //TODO
        //this.map.onSaveCourse();
    }

    public onLoadCourse(courseId: string) {
        //TODO this should populate the select with courses
        this.map.onLoadCourse(courseId);
        courses = this.map.getCourses();
    }

    public onLoadCourses() {
        this.map.onLoadCourses();
    }

    public onResetMap() {
        this.map.onResetMap();
    }
}

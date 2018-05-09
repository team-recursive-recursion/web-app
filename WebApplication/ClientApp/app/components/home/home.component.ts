import { Component, ViewChild } from '@angular/core';
import { MapperComponent } from '../mapper/mapper.component'
import { GeoJSON } from 'geojson'

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

    courses: golfCourses[] = [];

    ngAfterViewInit() {
        this.getServerURL();
    }

    getServerURL() {
        this.url = prompt("Enter server URL:", "localhost:5001");
    }

    //TODO
    setupAPI() {
    }

    public toggleDraggable() {
        this.map.toggleDraggable();
    }

    public changePolyType(bool: boolean, index: number) {
        this.map.changePolyType(bool, index);
    }

    constructor() {
    }
    
    public newPolygon() {
        this.map.newPolygon();
    }

    public createCourse(courseName: string) {
        if (courseName != "") {
            console.log("Course Name: " + courseName);
            //TODO call API
            this.map.createCourse(courseName);
        }
    }

    public saveCourse() {
        //TODO
        this.map.saveCourse();
    }

    public loadCourse(index: number) {
        //TODO this should populate the select with courses
        console.log(index);
        this.map.loadCourse(index);
    }

    public loadCourses() {

    }

    public resetMap() {
        this.map.resetMap();
    }
}

interface golfCourses {
    courseName: string;
    courseId: string;
}

interface golfCourse {
    courseId: string;

}

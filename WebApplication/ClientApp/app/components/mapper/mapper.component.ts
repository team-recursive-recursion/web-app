import { Component, OnInit, ViewChild } from '@angular/core';
import { MouseEvent, LatLngLiteral } from '@agm/core';

declare var google: any;

@Component({
  selector: 'app-mapper',
  templateUrl: './mapper.component.html',
  styleUrls: ['./mapper.component.css']
})

export class MapperComponent implements OnInit {
    map: any;

    title: string = "mapping";
    lat: number = -25.658712;
    lng: number = 28.140347;
    zoom: number = 20;
    mapType: string = "satellite";
    mapDraggable: boolean = true;

    //current polygon
    poly: polygon = {
        strokeOpacity: 1,
        strokeWeight: 5,
        fillOpacity: 0.4,
        fillColor: this.getColor(0),
        strokeColor: this.getColor(0),
        polyDraggable: true,
        editable: true,
        clickable: true,
        terrainType: 0,
        zIndex: 0,
        paths: []
    }
    //all polygons
    polygons: polygon[] = [];

    constructor() {
        //TODO
    }

    ngOnInit() {
        this.poly = this.defaultPolygon();
    }

    ngAfterViewInit() {
    }

    public mapClicked($event: MouseEvent) {
        this.poly.paths.push({
            lat: $event.coords.lat,
            lng: $event.coords.lng
        });
    }

    public updatePolyPosition(_poly: polygon, $event: MouseEvent) {
        console.log("polygon:", _poly," ", "whatever:", $event);
    }

    public newPolygon() {
        //    this.poly.polyDraggable = false;
        //this.poly.editable = false;
        //this.poly.clickable = false;
        this.polygons.push(this.poly);
        this.poly = this.defaultPolygon();
    }

    public saveCourse() {

    }

    public loadCourses(index: number) {

    }

    public loadCourse(index: number) {

    }

    public resetMap() {

    }

    public toggleDraggable() {
        this.mapDraggable = !this.mapDraggable;
    }

    public getPolygons() {
    }

    public changePolyType(bool: boolean, index: number) {
        this.poly.fillColor = this.getColor(index);
        this.poly.strokeColor = this.getColor(index);
        this.poly.polyDraggable = bool;
        this.poly.editable = bool;
        this.poly.clickable = bool;
        this.poly.terrainType = index;
        this.poly.zIndex = index;
    }

    public createCourse(courseName: string) {

    }

    private addLatLng(event: object) {
    }

    private error(message: string) {
    }

    private getColor(data: number): string {
        console.log("color " + data);
        if (data == 0) {
            return '#463E3E';
        }
        if (data == 1) {
            return '#73A15D';
        }
        if (data == 2) {
            return '#BADA55';
        }
        if (data == 3) {
            return '#C2B280';
        }
        return '#336699';
    }

    private defaultPolygon() {
        return this.createPolygon(true, 0);
    }

    private createPolygon(bool: boolean, ttype: number) {
        return {
            strokeOpacity: 1,
            strokeWeight: 5,
            fillOpacity: 0.4,
            fillColor: this.getColor(ttype),
            strokeColor: this.getColor(ttype),
            polyDraggable: bool,
            editable: bool,
            clickable: bool,
            terrainType: ttype,
            zIndex: ttype,
            paths: []
        }
    }

}

interface polygon {
    strokeOpacity: number;
    strokeWeight: number;
    fillOpacity: number;
    fillColor: string;
    strokeColor: string;
    polyDraggable: boolean;
    editable: boolean;
    clickable: boolean;
    terrainType: number;
    zIndex: number;
    paths: Array<LatLngLiteral>;
} 

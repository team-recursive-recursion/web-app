/***
 * Filename: mapper.component.ts
 * Author  : Christiaan H Nel, Duncan Tilley
 * Class   : MapperComponent / <mapper>
 *
 *      The home of the mapper. Create, Load, Edit a map.
 ***/

import { Component, OnInit, ViewChild } from '@angular/core';
import { MouseEvent, LatLngLiteral } from '@agm/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api/api.service';
import { Course, Hole, Elements, Polygon } from
    '../../interfaces/course.interface';

@Component({
    selector: 'app-mapper',
    templateUrl: './mapper.component.html',
    styleUrls: ['./mapper.component.scss'],
    providers: [ApiService]
})

export class MapperComponent implements OnInit {
    map: any;

    title: string = "mapping";
    lat: number = -25.658712;
    lng: number = 28.140347;
    zoom: number = 20;
    mapType: string = "satellite";
    mapDraggable: boolean = true;

    course: Course;

    //current polygon
    poly: Polygon = {
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
    polygons: Polygon[] = [];

    constructor(private router: Router, private api: ApiService) {
        //TODO
    }

    ngOnInit() {
        this.poly = this.defaultPolygon();
    }

    ngAfterViewInit() {
    }

    /***
     * Course load and save handlers.
     ***/
    public onLoadCourse(course: Course) {
        this.course = course;
        window.alert(JSON.stringify(course));
        // TODO load holes
    }

    public onSaveCourse() {
        // TODO save course using API
    }

    public onMapClicked($event: MouseEvent) {
        this.poly.paths.push({
            lat: $event.coords.lat,
            lng: $event.coords.lng
        });
    }

    public updatePolyPosition(_poly: Polygon, $event: MouseEvent) {
        console.log("polygon:", _poly, " ", "whatever:", $event);
    }

    public onNewPolygon() {
        //    this.poly.polyDraggable = false;
        //this.poly.editable = false;
        //this.poly.clickable = false;
        this.polygons.push(this.poly);
        this.poly = this.defaultPolygon();
    }

    public onResetMap() {

    }

    public getPolygons() {
    }

    public onToggleDraggable() {
        this.mapDraggable = !this.mapDraggable;
    }

    public onChangePolyType(bool: boolean, index: number) {
        this.poly.fillColor = this.getColor(index);
        this.poly.strokeColor = this.getColor(index);
        this.poly.polyDraggable = bool;
        this.poly.editable = bool;
        this.poly.clickable = bool;
        this.poly.terrainType = index;
        this.poly.zIndex = index;
    }

    private error(message: string) {
    }

    private getColor(data: number): string {
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

import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-mapper',
  templateUrl: './mapper.component.html',
  styleUrls: ['./mapper.component.css']
})

export class MapperComponent implements OnInit {
    title: string = "mapping";
    lat: number = -25.658712;
    lng: number = 28.140347;
    zoom: number = 20;
    mapType: string = "satellite";
    mapDraggable: boolean = true;

    constructor() {
        //TODO
    }

    ngOnInit() {
    }

    ngAfterViewInit() {
    }

    public toggleDraggable() {
        this.mapDraggable = !this.mapDraggable;
    }

    public addPolygons() {
    }
    public getPolygons() {
    }
}

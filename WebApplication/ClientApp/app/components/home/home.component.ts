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
    drag: boolean = true;
    path: string;
    polygon: GeoJSON;
    multiPolygons: GeoJSON;
    poly: GeoJSON;
    addedPolygons: GeoJSON;

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

    constructor() {
    }
}

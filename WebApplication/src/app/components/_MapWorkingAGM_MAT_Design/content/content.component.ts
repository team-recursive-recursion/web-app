import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { GoogleMapsAPIWrapper, AgmMap, AgmDataLayer, PolygonManager,
         LatLngBounds, LatLngBoundsLiteral, DataLayerManager} from '@agm/core';


declare var google: any;

@Component({
    selector: 'app-content',
    templateUrl: './content.component.html',
    styleUrls: ['./content.component.css']
})
export class ContentComponent implements OnInit {

    lat = 41.399115;
    lng = 2.160962;
    geoJsonObject: Object;

    @ViewChild('AgmMap') agmMap: AgmMap;

   geoString: '{"type": "Feature","geometry":{"type": "Polygon","coordinates": [[[21.97265625,-3.337953961416472],[15.468749999999998,-9.79567758282973],[18.720703125,-18.646245142670598],[28.564453125,-12.897489183755892],[34.1015625,0.08789059053082422],[25.224609375,17.14079039331665],[15.8203125,17.22475820662464],[21.97265625,-3.337953961416472]]]}}';


    constructor() { }

    ngOnInit() {
        this.geoJsonObject = JSON.parse(this.geoString);
    }

    ngAfterViewInit() {
        console.log(this.agmMap);
        this.agmMap.mapReady.subscribe(map => {
            const bounds: LatLngBounds = new google.maps.LatLngBounds();
            const GeoJSON = JSON.parse(this.geoString);
            GeoJSON.geometry.coordinates[0].forEach(element => {
                bounds.extend(new google.maps.LatLng(element[1], element[0]));
            });
            map.fitBounds(bounds);
            map.data.addGeoJson(GeoJSON);
        });
    }

    mapIdle() {
        console.log('idle');
    }

    clicked(clickEvent) {
        console.log( "GeoJSON poly Clicked" );
    }
}

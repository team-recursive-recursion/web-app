/***
 * Filename: google-map.ts
 * Author  : Duncan Tilley
 * Class   : GoogleMap
 * Enum    : DrawMode
 *
 *     Encapsulates the functionality of the Google Maps API.
 ***/

import { AgmMap, LatLngBounds } from '@agm/core';
import { Course } from './course';
import { Element, PointType, AreaType } from './element';
import { Hole } from './hole';
import { HomeComponent } from '../home.component';

export enum DrawMode {
    POINT, AREA, NONE
}

declare var google: any;
export class GoogleMap {

    private agmMap: AgmMap;
    private map: any;
    private mode: DrawMode = DrawMode.NONE;
    private comp: HomeComponent;

    /***
     * constructor()
     *
     *     Sets up the Google map.
     ***/
    public constructor(agmMap: AgmMap, comp: HomeComponent) {
        this.agmMap = agmMap;
        this.comp = comp;
        this.agmMap.mapReady.subscribe(map => {
            this.map = map;
            this.map.data.setControls(['Point', 'Polygon']);
            this.setUpMapEvents();
            this.setUpStyling();
            this.setUpSearch();
        });
    }

    /***
     * clearMap(): void
     *
     *     Removes all drawn items on the map.
     ***/
    public clearMap() {
        this.map.data.forEach(
            feature => this.map.data.remove(feature)
        );
    }

    /***
     * removeFeature(any) : void
     *
     *     Removes the given feature from the map.
     ***/
    public removeFeature(feature: any) {
        this.map.data.remove(feature);
    }

    /***
     * displayCourse(Course): void
     *
     *    Displays all of the elements of the given course on the map.
     ***/
    public displayCourse(course: Course) {
        var features = course.asFeatures();
        this.updateDataLayer(
            {
                "type": "FeatureCollection",
                "features": features
            }
        );
        this.setDrawingMode(DrawMode.NONE);
    }

    /***
     * displayHole(Hole): void
     *
     *     Filters elements to make only the given hole active. Pass null as the
     *     hole to enable course elements.
     ***/
    public displayHole(h: Hole) {
        var id = (h != null) ? h.getId() : null;
        this.map.data.forEach(feature => {
            if (feature.getProperty('holeId') == id) {
                feature.setProperty('enabled', true);
            } else {
                feature.setProperty('enabled', false);
            }
        });
    }

    /***
     * getDrawingMode() : DrawMode
     ***/
    public getDrawingMode() : DrawMode {
        return this.mode;
    }

    /***
     * setDrawingMode(DrawMode) : void
     *
     *     Sets the map to the given drawing mode.
     ***/
    public setDrawingMode(mode: DrawMode) {
        switch (mode) {
            case DrawMode.POINT:
                this.map.data.setDrawingMode("Point");
                break;
            case DrawMode.AREA:
                this.map.data.setDrawingMode("Polygon");
                break;
            case DrawMode.NONE:
                this.map.data.setDrawingMode(null);
                break;
        }
        this.mode = mode;
    }

    /***
     * setUpMapEvents() : void
     *
     *     Sets up the map event listeners.
     ***/
    private setUpMapEvents() {
        this.map.data.addListener("addfeature", e =>
            this.comp.onFeatureAdd(e.feature));
        this.map.data.addListener('setgeometry', e =>
            this.comp.onFeatureUpdate(e.feature));
        this.map.data.addListener('click', e =>
            this.comp.onFeatureClick(e.feature));
        this.map.addListener('click', e =>
            this.comp.onMapClick(e));
    }

    /***
     * setUpStyling(): void
     *
     *     Sets the color and style of features according to its type and
     *     certain properties.
     ***/
    private setUpStyling() {
        this.map.data.setStyle(function (feature) {
            let enabled = feature.getProperty('enabled');
            let editable = feature.getProperty('editable');
            let selected = feature.getProperty('selected');
            if (feature.getGeometry() != null) {
                if (feature.getGeometry().getType() == "Polygon") {
                    // styling for polygons
                    const polyType = feature.getProperty('polygonType');
                    // choose the color based on enabled and the type
                    let color = '#2E2E2E';
                    if (enabled) {
                        switch (polyType) {
                            case AreaType.ROUGH:
                                color = '#1D442D';
                                break;
                            case AreaType.FAIR:
                                color = '#73A15D';
                                break;
                            case AreaType.GREEN:
                                color = '#BADA55';
                                break;
                            case AreaType.BUNKER:
                                color = '#C2B280';
                                break;
                            case AreaType.WATER:
                                color = '#336699';
                                break;
                        }
                    }
                    // return the styling
                    return {
                        clickable: editable && enabled,
                        draggable: selected,
                        editable: selected,
                        visible: true,
                        fillColor: color,
                        fillOpacity: 0.3,
                        strokeWeight: 1,
                        zIndex: polyType
                    };
                } else {
                    var icon;
                    switch (feature.getProperty("pointType")) {
                        case PointType.HOLE:
                            icon = "./assets/flag.png";
                            break;
                        case PointType.TEE:
                            icon = "./assets/tee.png";
                            break;
                        default:
                            icon = "";
                            break;
                    }
                    return {
                        clickable: editable && enabled,
                        draggable: selected,
                        editable: selected,
                        visible: enabled,
                        icon: icon,
                        zIndex: 0
                    };
                }
            }
        });
    }

    /***
     * setUpSearch(): void
     *
     *     Creates the search bar and enables the events.
     ***/
    private setUpSearch(): void {
        // create and link the search input
        var map = this.map;
        var div = document.getElementById("search-div");
        var input = document.getElementById("search-input");
        var searchBox = new google.maps.places.SearchBox(input);
        map.controls[google.maps.ControlPosition.TOP_LEFT].push(div);

        // bias search results to places in the current viewbox
        map.addListener('bounds_changed', function () {
            searchBox.setBounds(map.getBounds());
        });

        // add event for place selection
        searchBox.addListener('places_changed', function () {
            var places = searchBox.getPlaces();
            if (places.length == 0) {
                return;
            }

            // get the location.
            var bounds = new google.maps.LatLngBounds();
            // add bounds for each selected place
            places.forEach(place => {
                if (!place.geometry) {
                    console.log("Place contains no usable geometry");
                    return;
                }
                // focus on the area
                if (place.geometry.viewport) {
                    bounds.union(place.geometry.viewport);
                } else {
                    bounds.extend(place.geometry.location);
                }
            });
            map.fitBounds(bounds);
        });
    }

    /***
     * updateDataLayer(any): void
     *
     *     Updates the items on the map to new items.
     ***/
    private updateDataLayer(geoJson: any) {
        // find the outer bounds and focus on the map
        if (geoJson !== undefined && geoJson.features.length !== 0) {
            const bounds: LatLngBounds = new google.maps.LatLngBounds();
            geoJson.features.forEach(
                feature => {
                    if (feature.geometry.coordinates[0].forEach != null) {

                        feature.geometry.coordinates[0].forEach(
                            lngLat => bounds.extend(
                                new google.maps.LatLng(lngLat[1], lngLat[0]))
                        );
                    }
                }
            );
            this.map.fitBounds(bounds);
        }
        // replace the data with the new features
        this.clearMap();
        this.map.data.addGeoJson(geoJson);
    }

}

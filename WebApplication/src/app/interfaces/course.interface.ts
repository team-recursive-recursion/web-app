/***
 * Filename: course.interface.ts
 * Author  : Christiaan H Nel
 * Class   : 
 * 
 *     The class that represents a course returned from the API and used
 *     by MapperComponent.
 ***/
import { LatLngLiteral } from '@agm/core';

export interface Course {
    courseId: string;
    courseName: string;
    createdAt: string;
    updatedAt: string;
}

export interface GolfCourse {
    courseId: string;
    courseName: string;
    createdAt: string;
    updatedAt: string;
    holes: Hole[];
    courseElements: Elements[];
}

export interface Hole {
    name: string;
    holeID: string;
    courseId: string;
    courseElement: Elements[];
}

export interface Elements {
    etype: number;
    polygonRaw: string;
    createdAt: string;
    updatedAt: string;
    geoJson: string;
    courseElementId: string;
    holeId: string;
    hole: string;
    courseId: string;
    golfCourse: string;
}

export interface Polygon {
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

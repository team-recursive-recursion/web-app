/***
 * Filename: element-factory.ts
 * Author  : Duncan Tilley
 * Class   : ElementFactory
 *
 *     Parses received element arrays and produces elements that can be
 *     displayed on the map.
 ***/

import { ModelState } from '../../../interfaces/enum.interface';
import { Element, Point, Area, ElementType, PointType, AreaType } from './element';
import { Course } from './course';
import { Hole } from './hole';

export class ElementFactory {

    /***
     * parseElementArray(any, boolean, boolean): Array<Element>
     *
     *     Produces an array of elements from raw JSON received from the Mapper
     *     API.
     ***/
    public static parseElementArray(json: Array<any>, enabled: boolean,
            editable: boolean) : Array<Element> {
        var elements: Array<Element> = [];

        if (json !== undefined && json !== null) {
            json.forEach(e => {
                var element: Element;
                if (e.elementType == ElementType.POINT) {
                    // create the point element
                    element = new Point(ModelState.UNCHANGED, enabled, editable,
                            e.pointType);
                    (<Point> element).setInfo(e.info);
                } else if (e.elementType == ElementType.AREA) {
                    // create the area element
                    element = new Area(ModelState.UNCHANGED, enabled, editable,
                            e.polygonType);
                }
                // add element properties
                element.setId(e.elementId);
                element.courseId = e.courseId;
                element.holeId = e.holeId;
                element.geometry = JSON.parse(e.geoJson);
                elements.push(element);
            });
        }

        return elements;
    }

    /***
     * createFeatures(Array<Element>) : Array<any>
     *
     *     Creates drawable features from the given elements.
     ***/
    public static createFeatures(elements : Array<Element>) : Array<any> {
        var features: Array<any> = [];

        elements.forEach(e => {
            var feature = {
                "type": "Feature",
                "geometry": {
                    ...e.geometry
                },
                "properties": {
                    "elementType": e.getElementType(),
                    "element": e,
                    "update": false
                }
            };
            features.push(feature);
        });

        return features;
    }

    /***
     * parsePoint(any, boolean, boolean, Course, Hole): Point
     *
     *     Produces a point element from a new map feature. Leave the hole as
     *     null for a course element.
     ***/
    public static parsePoint(feature: any, enabled: boolean, editable: boolean,
            type: PointType, info: string, course: Course, hole: Hole) {
        // create element
        var point = new Point(ModelState.CREATED, enabled, editable, type);
        point.setInfo(info);
        point.geometry = feature.geometry;
        point.courseId = course.getId();
        if (hole != null) {
            point.holeId = hole.getId();
        } else {
            point.holeId = null;
        }
        // set feature properties
        feature.setProperty("elementType", ElementType.POINT);
        feature.setProperty("element", point);
        return point;
    }

    /***
     * parseArea(any, boolean, boolean, Course, Hole): Point
     *
     *     Produces an area element from a new map feature. Leave the hole as
     *     null for a course element.
     ***/
    public static parseArea(feature: any, enabled: boolean, editable: boolean,
            type: AreaType, course: Course, hole: Hole) {
        // create element
        var area = new Area(ModelState.CREATED, enabled, editable, type);
        area.geometry = feature.geometry;
        area.courseId = course.getId();
        if (hole != null) {
            area.holeId = hole.getId();
        } else {
            area.holeId = null;
        }
        // set feature properties
        feature.setProperty("elementType", ElementType.AREA);
        feature.setProperty("element", area);
        return area;
    }

}

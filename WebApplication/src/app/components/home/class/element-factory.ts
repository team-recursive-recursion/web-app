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
     *     API. Also produces features that can be displayed on the map.
     ***/
    public static parseElementArray(json: Array<any>, enabled: boolean,
            editable: boolean) : Array<Element> {
        var elements: Array<Element> = [];

        if (json !== undefined && json !== null) {
            json.forEach(e => {
                var feature: any;
                var element: Element;
                if (e.elementType == ElementType.POINT) {
                    // create the point feature
                    feature = {
                        "type": "Feature",
                        "geometry": {
                            ...JSON.parse(e.geoJson)
                        },
                        "properties": {
                            "pointType": e['pointType'],
                            "elementType": e.elementType,
                            "elementId": e.elementId,
                            "courseId": e.courseId,
                            "holeId": e.holeId,
                            "enabled": enabled,
                            "editable": editable,
                            "selected": false
                        }
                    };
                    // create the point element
                    element = new Point(ModelState.UNCHANGED, enabled, editable,
                            e.pointType);
                    (<Point> element).setInfo(e.info);
                    element.setId(e.elementId);
                    element.feature = feature;
                } else if (e.elementType == ElementType.AREA) {
                    // create the area feature
                    feature = {
                        "type": "Feature",
                        "geometry": {
                            ...JSON.parse(e.geoJson)
                        },
                        "properties": {
                            "polygonType": e['polygonType'],
                            "elementType": e.elementType,
                            "elementId": e.elementId,
                            "courseId": e.courseId,
                            "holeId": e.holeId,
                            "enabled": enabled,
                            "editable": editable,
                            "selected": false
                        }
                    };
                    // create the area element
                    element = new Area(ModelState.UNCHANGED, enabled, editable,
                            e.polygonType);
                    element.setId(e.elementId);
                    element.feature = feature;
                }
                elements.push(element);
            });
        }

        return elements;
    }

    /***
     * parsePoint(any, boolean, boolean, Course, Hole): Point
     *
     *     Produces a point element from a new map feature. Leave the hole as
     *     null for a course element.
     ***/
    public static parsePoint(feature: any, enabled: boolean, editable: boolean,
            type: PointType, info: string, course: Course, hole: Hole) {
        var point = new Point(ModelState.CREATED, enabled, editable, type);
        // add properties to the feature
        // assign element properties
        feature.setProperty("elementId", null);
        feature.setProperty("courseId", course.getId());
        if (hole != null) {
            feature.setProperty("holeId", hole.getId());
        } else {
            feature.setProperty("holeId", null)
        }
        // assign point properties
        feature.setProperty("enabled", enabled);
        feature.setProperty("editable", editable);
        feature.setProperty("selected", true);
        feature.setProperty("elementType", ElementType.POINT);
        feature.setProperty("pointType", type);
        feature.setProperty("info", info);
        // add properties to element
        point.setInfo(info);
        point.feature = feature;
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
    var area = new Area(ModelState.CREATED, enabled, editable, type);
    // add properties to the feature
    // assign element properties
    feature.setProperty("elementId", null);
    feature.setProperty("courseId", course.getId());
    if (hole != null) {
        feature.setProperty("holeId", hole.getId());
    } else {
        feature.setProperty("holeId", null)
    }    // assign point properties
    feature.setProperty("enabled", enabled);
    feature.setProperty("editable", editable);
    feature.setProperty("selected", true);
    feature.setProperty("elementType", ElementType.AREA);
    feature.setProperty("polygonType", type);
    // add feature to element
    area.feature = feature;
    return area;
}

}

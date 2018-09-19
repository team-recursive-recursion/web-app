/***
 * Filename: element-factory.ts
 * Author  : Duncan Tilley
 * Class   : ElementFactory
 *
 *     Parses received element arrays and produces elements that can be
 *     displayed on the map.
 ***/

import { ModelState } from '../../../interfaces/enum.interface';
import { Element, Point, Area, ElementType } from './element';

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
                            "pointType": e.pointType, //e['pointType'],
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
                            "polygonType": e.polygonType, //e['polygonType'],
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

}

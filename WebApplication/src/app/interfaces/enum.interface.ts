/***
 * Filename: call.interface.ts
 * Author  : Christiaan H Nel
 * Enum    : Call_t
 * 
 *     The enum than represents the type of call made by the web app, that 
 *     is used for error checking.
 *
 * Enum    : PolygonState_t
 *
 *     The enum that represents the current state of the polygon, this enable
 *     the use of knowing which polygons are newly addded, been deleted, or
 *     updated.
 ***/

export class EmptyClass {
    str: string;
}

export enum Call_t {
    C_COURSES_LOAD = 0,

    C_COURSE_CREATE,
    C_COURSE_LOAD,
    C_COURSE_SAVE,
    C_COURSE_DELETE,

    C_HOLE_CREATE,
    C_HOLE_LOAD,
    C_HOLE_DELETE,

    C_POLY_CREATE,
    C_POLY_LOAD,
    C_POLY_UPDATE,

    C_POINT_CREATE,
    C_POINT_LOAD,
    C_POINT_DELETE,
}

enum PolygonState_t {
    PS_NEW = 0,
    PS_UPDATE,
    PS_DELETE,
    PS_NONE
}

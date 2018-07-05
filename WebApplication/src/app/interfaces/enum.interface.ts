/***
 * Filename: call.interface.ts
 * Author  : Christiaan H Nel
 * Enum    : Call_t
 *
 *     The enum than represents the type of call made by the web app, that
 *     is used for error checking.
 *
 * Enum    : State_t
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
    C_COURSE_DELETE,

    C_HOLE_CREATE,
    C_HOLE_LOAD,
    C_HOLE_DELETE,

    C_POLY_CREATE,
    C_POLY_LOAD,
    C_POLY_UPDATE,

    C_POINT_CREATE,
    C_POINT_DELETE,
    C_POINT_UPDATE
}

export enum State_t {
    S_NEW = 0,
    S_UPDATE,
    S_DELETE,
    S_NONE
}

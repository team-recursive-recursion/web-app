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

    C_ELEMENT_CREATE,
    C_ELEMENT_LOAD,
    C_ELEMENT_UPDATE,
    C_ELEMENT_DELETE
}

export enum State_t {
    S_NEW = 0,
    S_UPDATE,
    S_DELETE,
    S_NONE
}

export enum Element_t {
    E_POLY = 0,
    E_POINT
}

export enum Point_t {
    P_PIN =0,
    P_HOLE,
    P_TEE
}

export enum Polygon_t {
    P_ROUGH = 0,
    P_FAIR,
    P_GREEN,
    P_BUNKER,
    P_WATER
}

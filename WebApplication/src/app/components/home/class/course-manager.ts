/***
 * Filename: course-manager.ts
 * Author  : Duncan Tilley
 * Class   : CourseManager
 *
 *     Manages the list of courses owned by the user and allows the selection
 *     of a specific course.
 ***/

import { ApiService } from '../../../services/api/api.service';
import { ModelState } from '../../../interfaces/enum.interface';
import { Course } from './course';

export class CourseManager {

    public courses: Array<Course>;
    public activeCourse: Course;

    private uid: string;
    private api: ApiService;

    /***
     * constructor(string, string)
     *
     *     Sets up the manager configurations.
     ***/
    public constructor(api: ApiService, uid: string) {
        this.api = api;
        this.courses = [];
        this.activeCourse = null;
        this.uid = uid;
    }

    /***
     * loadCourseList(function, function) : void
     *
     *     Loads the user's courses from the api. On successful load, the first
     *     function is called. On failure, the second is called.
     */
    public loadCourseList(callSucc: Function, callFail: Function) {
        // load user's courses
        this.api.coursesGet(this.uid)
            .subscribe(

                result => {
                    // parse the received course list
                    let body = result.json();
                    for (var i = 0; i < body.length; ++i) {
                        var course = new Course(ModelState.UNCHANGED);
                        course.setId(body[i].courseId);
                        course.setName(body[i].courseName);
                        course.setInfo(body[i].info);
                        this.courses.push(course);
                    }
                    callSucc();
                },

                error => {
                    callFail(error.status, error.headers, error.text());
                },

                () => console.log("Course list loaded successfully")

            );
    }

    /***
     * setActiveCourse(number, ApiService, function, function)
     *
     *     Loads the elements of the provided course index. The current active
     *     course is unloaded from memory. Calls the first given function after
     *     successfully loading the course, or the second function in case of
     *     an error.
     ***/
    public setActiveCourse(index: number, api: ApiService,
            callSucc: Function, callFail: Function) {
        if (index >= 0 && index < this.courses.length) {
            // clear previous course
            if (this.activeCourse != null) {
                this.activeCourse.clear();
            }
            var newActive = this.courses[index];
            // load the new course
            newActive.reload(api,
                // success
                function() {
                    callSucc();
                },
                // failure
                function(status, header, body) {
                    callFail(status, header, body);
                }
            );
            this.activeCourse = newActive;
        } else {
            console.log("Warning: Attempted to load invalid course index");
        }
    }

    /***
     * unsetActiveCourse() : void
     *
     *     Resets to having no course selected.
     ***/
    public unsetActiveCourse() {
        if (this.activeCourse != null) {
            this.activeCourse.clear();
            this.activeCourse = null;
        }
    }

    /***
     * createActiveCourse(string, string, ApiService, function, function) : void
     *
     *     Creates a new course and sets it as the active course. Calls the
     *     first function on success and the second function on failure.
     ***/
    public createActiveCourse(name: string, info: string, api: ApiService,
            callSucc: Function, callFail: Function) {
        api.coursesCreate(this.uid, name, info)
            .subscribe(
                result => {
                    // create new course
                    var course = new Course(ModelState.UNCHANGED);
                    course.setId(result.json().courseId);
                    course.setName(name);
                    course.setInfo(info);
                    this.courses.push(course);
                    // deselect old course
                    if (this.activeCourse) {
                        this.activeCourse.clear();
                    }
                    this.activeCourse = course;
                    callSucc();
                },

                error => {
                    callFail(error.status, error.headers, error.text());
                },

                () => {
                    console.log("Course created successfully")
                }
            );
    }

    /***
     * deleteActiveCourse(ApiService, function, function) : void
     *
     *     Permanently removes the active course on the remote API. Calls the
     *     first function on success and the second function on failure.
     ***/
    public deleteActiveCourse(api: ApiService, callSucc: Function,
            callFail: Function) {
        if (this.activeCourse != null) {
            this.activeCourse.clear();
            // delete the course
            api.courseDelete(this.activeCourse.getId())
            .subscribe(
                result => {
                    // find the hole to remove from the list
                    var i = 0;
                    var done = false;
                    while (!done && i < this.courses.length) {
                        if (this.courses[i] == this.activeCourse) {
                            this.courses.splice(i, 1);
                            done = true;
                        }
                        ++i;
                    }
                    this.activeCourse = null;
                    callSucc();
                },

                error => {
                    callFail(error.status, error.headers, error.text());
                },

                () => {
                    console.log("Course deleted successfully.");
                }
            );
        }
    }

}

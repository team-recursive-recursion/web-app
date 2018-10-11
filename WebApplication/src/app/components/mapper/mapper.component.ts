/***
 * Filename: mapper.component.ts
 * Author  : Christaan H Nel, Duncan Tilley
 * Class   : MapperComponent / <mapper>
 ***/

import { MediaMatcher } from '@angular/cdk/layout';
import {
    Component, ViewChild, ChangeDetectorRef, Inject, OnInit, NgZone,
    ApplicationRef, ValueProvider
}
    from '@angular/core';
import { Router } from '@angular/router';
import { AgmMap } from '@agm/core';
import { FormControl } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatSidenav } from '@angular/material';
import { element } from 'protractor';

import { ApiService } from '../../services/api/api.service';
import { GlobalsService } from '../../services/globals/globals.service';
import { LIVE_ANNOUNCER_ELEMENT_TOKEN } from '@angular/cdk/a11y';
import { AreaDialog } from './dialog/area-dialog.component';
import { PointDialog } from './dialog/point-dialog.component';
import { HoleDialog } from './dialog/hole-dialog.component';
import { CourseDialog } from './dialog/course-dialog.component';

import { GoogleMap, DrawMode } from './class/google-map';
import { ModelState } from '../../interfaces/enum.interface';
import { CourseManager } from './class/course-manager';
import { Element } from './class/element';
import { ElementFactory } from './class/element-factory';
import { LiveLocation } from './class/live-location';
import { InfoDialog, InfoType } from '../dialog/info-dialog.component';
import { ConfirmDialog } from '../dialog/confirm-dialog.component';
import { toTypeScript } from '@angular/compiler';

@Component({
    selector: 'mapper',
    templateUrl: './mapper.component.html',
    styleUrls: ['./mapper.component.scss']
})
export class MapperComponent {
    @ViewChild('AgmMap') agmMap: AgmMap;
    @ViewChild('snav') navbar: MatSidenav;

    // map elements
    map: GoogleMap;
    courseManager: CourseManager;
    liveLoc: LiveLocation;

    // selected items
    selectedFeature: any = null;

    url: any;
    courseIndex: number = -1;
    holeIndex: number = -1;

    features: any;
    drawingMode: string;
    viewMode: boolean = false;

    lat: number = -25.658712;
    lng: number = 28.140347;
    zoom: number = 20;
    mapType: string = "satellite";
    mapDraggable: boolean = true;
    mobileQuery: MediaQueryList;

    activeElements: any;

    open: boolean = true;
    spin: boolean = false;
    direction: string = 'up';
    animationMode: string = 'scale';

    locationPoints: any;

    private _fixed: boolean = true;
    get fixed() { return this._fixed; }
    set fixed(fixed: boolean) {
        this._fixed = fixed;
        if (this._fixed) {
            this.open = true;
        }
    }

    private _mobileQueryListener: () => void;

    constructor(
        private api: ApiService,
        private globals: GlobalsService,
        private router: Router,
        private ngZone: NgZone,
        private appRef: ApplicationRef,
        changeDetectorRef: ChangeDetectorRef,
        media: MediaMatcher,
        public dialog: MatDialog) {

        this.mobileQuery = media.matchMedia('(max-width: 600px)');
        this._mobileQueryListener = () => changeDetectorRef.detectChanges();
        this.mobileQuery.addListener(this._mobileQueryListener);
        this.courseManager = new CourseManager(this.api);
    }

    /***
     * ngAfterViewInit() : void
     *
     *     View init call. The user's courses are loaded through the API. If the
     *     user is not logged in, redirect to the login screen.
     ***/
    ngAfterViewInit() {
        // check if a user is logged in
        if (this.globals.getUid() == null) {
            this.router.navigateByUrl("/login");
        } else {
            // set up the map
            this.map = new GoogleMap(this.agmMap, this);
            this.liveLoc = new LiveLocation(this.api, this.map);
            // load courses
            this.courseManager.loadCourseList(
                // success
                function() {},
                // fail
                function (status, headers, body) {
                    this.dialog.open(InfoDialog, {data: {
                        message: "Failed to load your course list. " +
                                "Try refreshing the page.",
                        type: InfoType.ERROR
                    }});
                }
            );
        }
    }

    /***
     * ngOnDestroy() : void
     *
     *     Clean up.
     ***/
    ngOnDestroy(): void {
        this.mobileQuery.removeListener(this._mobileQueryListener);
    }

    /***************************************************************************
     * UI EVENT HANDLERS
     **************************************************************************/

    /***
     * onSelectCourse(number) : void
     *
     *     Event listener for selecting a course from the dropdown menu. Sets
     *     the active course to the selected one.
     ***/
    public onSelectCourse(index: number) {
        // stop live locations
        this.liveLoc.stop();

        var t = this;
        if (index >= 0) {
            this.unselectFeature();
            this.courseManager.setActiveCourse(index, this.api,
                // success
                function () {
                    t.map.clearMap();
                    t.navbar.open();
                    // go to editing mode
                    t.viewMode = false;
                    t.updateViewMode();
                    // select no hole
                    t.map.displayCourse(t.courseManager.activeCourse);
                    t.holeIndex = -1;
                },
                // fail
                function(status, header, body) {
                    this.dialog.open(InfoDialog, {data: {
                        message: "Failed to load the selected course. " +
                                "Try refreshing the page.",
                        type: InfoType.ERROR
                    }});
                    console.log(body);
                }
            );
        } else {
            this.courseManager.unsetActiveCourse();
            this.navbar.close();
            this.map.clearMap();
        }
    }

    /***
     * onSaveCourse(): void
     *
     *     Function that saves the current course. New elements are posted,
     *     updated elements are put and removed elements are deleted.
     ***/
    public onSaveCourse() {
        var p = this;
        this.courseManager.activeCourse.sync(this.api,
            // success
            function() {
                p.dialog.open(InfoDialog, {data: {
                    message: "Save successful",
                    type: InfoType.SUCCESS
                }});
            },
            // fail
            function(status, header, body) {
                p.dialog.open(InfoDialog, {data: {
                    message: "Failed to save the current course",
                    type: InfoType.ERROR
                }});
            }
        );
    }

    /***
     * onCreateCourse(): void
     *
     *     Event listener for the course creation button. Brings up the course
     *     dialog and creates the course.
     ***/
    public onCreateCourse() {
        var t = this;
        // bring up the course dialog
        const dialogRef = this.dialog.open(CourseDialog, {
            data: { update: false }
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result != undefined && result.done) {
                // create course
                this.courseManager.createActiveCourse(result.name, result.info,
                    this.api,
                    // success
                    function() {
                        t.map.clearMap();
                        t.navbar.open();
                        t.courseIndex = t.courseManager.courses.length - 1;
                        // go to edit mode
                        t.viewMode = false;
                        t.updateViewMode();
                    },
                    // fail
                    function (status, header, body) {
                        this.dialog.open(InfoDialog, {data: {
                            message: "Failed to create a new course",
                            type: InfoType.ERROR
                        }});
                    }
                );

            }
        });
    }

    /***
     * onDeleteCourse(number) : void
     *
     *     Event listener for the course deletion button. Deletes the
     *     selected course.
     ***/
    public onDeleteCourse(index: number) {
        var t = this;
        // bring up the confirm dialog
        const dialogRef = this.dialog.open(ConfirmDialog);
        dialogRef.afterClosed().subscribe(result => {
            if (result != undefined && result.choice) {
                // delete course
                // delete the course
                this.courseManager.deleteActiveCourse(this.api,
                    // success
                    function() {
                        t.unselectFeature();
                        t.map.clearMap();
                        t.navbar.close();
                        t.courseIndex = -1;
                    },
                    // fail
                    function(status, header, body) {
                        this.dialog.open(InfoDialog, {data: {
                            message: "Failed to delete the selected course",
                            type: InfoType.ERROR
                        }});
                    }
                );
            }
        });
    }

    /***
     * onEditCourse(number) : void
     *
     *     Event listener for the course edit button. Opens the dialog to edit
     *     the selected course.
     ***/
    public onEditCourse(index: number) {
        var c = this.courseManager.activeCourse;
        // bring up the course dialog
        const dialogRef = this.dialog.open(CourseDialog, {
            data : {
                update: true,
                name: c.getName(),
                info: c.getInfo()
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result != undefined && result.done) {
                // update course
                if (c.getState() != ModelState.CREATED) {
                    c.setState(ModelState.UPDATED);
                }
                c.setName(result.name);
                c.setInfo(result.info);
            }
        });
    }

    /***
     * onSelectHole(number) : void
     *
     *     Event listener for selecting a hole radio button. Changes the active
     *     hole to the selected one.
     ***/
    public onSelectHole(index: number) {
        if (index >= 0) {
            this.map.displayHole(this.courseManager.activeCourse
                    .getHole(index));
            this.appRef.tick();
        } else {
            this.map.displayHole(null);
            this.appRef.tick();
        }
        // unselect the selected element
        this.unselectFeature();
    }

    /***
     * onCreateHole(): void
     *
     *     Event listener for the hole creation button. Creates a new hole
     *     using the hole dialog and adds the hole to the active course.
     ***/
    public onCreateHole() {
        // bring up the hole dialog
        const dialogRef = this.dialog.open(HoleDialog, {
            data : {
                holes: this.courseManager.activeCourse.getHoles(),
                update: false
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result != undefined && result.done) {
                // create hole
                var index = this.courseManager.activeCourse.createHole(
                        result.name, result.par);
                this.holeIndex = index;
                this.onSelectHole(index);
            }
        });
    }

    /***
     * onEditHole(): void
     *
     *     Function that edits an existing hole using the API.
     *     On success, call onResult.
     *     On failure, call onFail.
     ***/
    public onEditHole() {
        // bring up the hole dialog
        var h = this.courseManager.activeCourse.getHole(this.holeIndex);
        const dialogRef = this.dialog.open(HoleDialog, {
            data : {
                holes: this.courseManager.activeCourse.getHoles(),
                update: true,
                name: h.getName(),
                par: h.getInfo()
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result != undefined && result.done) {
                // update hole
                if (h.getState() != ModelState.CREATED) {
                    h.setState(ModelState.UPDATED);
                }
                h.setName(result.name);
                h.setInfo(result.par);
            }
        });
    }

    /***
     * onDeleteHole(): void
     *
     *     Event listener for deleting the current hole.
     ***/
    public onDeleteHole() {
        if (this.holeIndex < 0) {
            return;
        }
        var t = this;
        // bring up the confirm dialog
        const dialogRef = this.dialog.open(ConfirmDialog);
        dialogRef.afterClosed().subscribe(result => {
            if (result != undefined && result.choice) {
                // delete the hole
                var h = t.courseManager.activeCourse.getHole(t.holeIndex);
                h.delete();
                // remove elements from the map
                t.map.removeElements(h.getElements());
            }
        });
    }

    /***
     * onFabAdd(string) : void
     *
     *     Event listener for pressing the add point or area floating buttons.
     *     Sets the map to the appropriate drawing mode.
     ***/
    onFabAdd(type: number) {
        this.unselectFeature();
        if (type == 0) {
            this.map.setDrawingMode(DrawMode.POINT);
        } else {
            this.map.setDrawingMode(DrawMode.AREA);
        }
    }

    /***
     * onDeleteElement(): void
     *
     *     Event listener for deleting the selected feature.
     */
    public onDeleteElement() {
        if (this.selectedFeature != null) {
            this.map.removeFeature(this.selectedFeature);
            var el: Element = this.selectedFeature.getProperty('element');
            el.delete();
            this.unselectFeature();
        }
    }

    /***
     * onViewModeSwitch(): void
     *
     *     Event handler for switching between editing mode and live view mode.
     ***/
    public onViewModeSwitch() {
        this.updateViewMode();
    }

    /***************************************************************************
     * Map event handlers
     **************************************************************************/

    /***
     * onFeatureAdd(any): void
     *
     *     Event handler for new & loaded elements on the map. The handler
     *     creates the element and adds it to the course.
     ***/
    public onFeatureAdd(feature: any) {
        var hole = null;
        if (this.holeIndex >= 0) {
            hole = this.courseManager.activeCourse.getHole(this.holeIndex);
        }
        // ignore the loaded elements
        if (feature.getProperty("elementId") === undefined) {
            if (this.courseManager.activeCourse != null) {
                // determine the type of element added
                this.ngZone.run(() => {
                    if (this.map.getDrawingMode() == DrawMode.AREA) {
                        // bring up the area dialog
                        const dialogRef = this.dialog.open(AreaDialog);
                        dialogRef.afterClosed().subscribe(result => {
                            if (result != undefined && result.done) {
                                // create the area element
                                var el = ElementFactory.parseArea(
                                    feature, true, true, result.type,
                                    this.courseManager.activeCourse, hole);
                                if (hole != null) {
                                    hole.addElement(el);
                                } else {
                                    this.courseManager.activeCourse
                                            .addElement(el);
                                }
                                this.setSelectedFeature(feature);
                            } else {
                                // delete the feature
                                this.map.removeFeature(feature);
                            }
                        });

                    } else if (this.map.getDrawingMode() == DrawMode.POINT) {
                        // bring up the point dialog
                        const dialogRef = this.dialog.open(PointDialog);
                        dialogRef.afterClosed().subscribe(result => {
                            if (result != undefined && result.done) {
                                // create the point element
                                var el = ElementFactory.parsePoint(
                                    feature, true, true, result.type,
                                    result.info,
                                    this.courseManager.activeCourse, hole);
                                if (hole != null) {
                                    hole.addElement(el);
                                } else {
                                    this.courseManager.activeCourse
                                            .addElement(el);
                                }
                                this.setSelectedFeature(feature);
                            } else {
                                // delete the feature
                                this.map.removeFeature(feature);
                            }
                        });
                    }
                });
            } else {
                // remove the invalid feature
                this.map.removeFeature(feature);
                this.dialog.open(InfoDialog, {data: {
                    message: "Please load or create a course first",
                    type: InfoType.WARNING
                }});
            }
            // go to select mode
            this.map.setDrawingMode(DrawMode.NONE);
        }
    }

    /***
     * onFeatureUpdate(any): void
     *
     *     Event handler for updated elements on the map. The handler sets the
     *     current selected feature to the updated one and flags the feature
     *     for update.
     ***/
    public onFeatureUpdate(feature: any) {
        if (feature != this.selectedFeature) {
            this.setSelectedFeature(feature);
        }
        // update the element
        var e: Element = feature.getProperty('element');
        e.geometry = ElementFactory.toGeoJson(e.getElementType(),
                feature.getGeometry());
        if (e.getState() != ModelState.CREATED) {
            e.setState(ModelState.UPDATED);
        }
    }

    /***
     * onFeatureClick(any): void
     *
     *     Event handler for map element clicks. The handler sets the current
     *     selected feature to the clicked one.
     ***/
    public onFeatureClick(feature: any) {
        this.setSelectedFeature(feature);
    }

    /***
     * onMapClick(any): void
     *
     *     Event handler for map clicks.
     ***/
    public onMapClick(event: any) {
        // deselect the selected feature
        this.unselectFeature();
    }

    /***************************************************************************
     * Selection functions
     **************************************************************************/

    /***
     * setSelectedFeature(any): void
     *
     *     Sets the currently selected feature.
     ***/
    private setSelectedFeature(f: any) {
        this.unselectFeature();
        // select feature
        f.getProperty('element').selected = true;
        // force update
        f.setProperty('update', false);
        this.selectedFeature = f;
        this.appRef.tick();
    }

    /***
     * unselectFeature() : void
     *
     *     Unselects the currently selected feature.
     */
    private unselectFeature() {
        if (this.selectedFeature != null) {
            this.selectedFeature.getProperty('element').selected = false;
            // force update
            this.selectedFeature.setProperty('update', false);
            this.selectedFeature = null;
            this.appRef.tick();
        }
    }

    /***************************************************************************
     * View mode functions
     **************************************************************************/

    public updateViewMode() {
        if (this.viewMode) {
            // switch to viewing mode
            this.unselectFeature();
            this.map.setDrawingMode(DrawMode.NONE);
            // TODO ask to save first
            // disable editing of elements
            this.map.setEditable(false);
            this.map.displayAll();
            // start live view
            this.liveLoc.start(this.courseManager.activeCourse, 10000);
        } else {
            // switch to edit mode
            // stop live view
            this.liveLoc.stop();
            this.map.clearLiveData();
            // enable editing of elements
            this.map.setEditable(true);
            this.onSelectHole(this.holeIndex);
        }
    }

}

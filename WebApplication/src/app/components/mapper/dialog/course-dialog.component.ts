/***
 * Filename: course-dialog.component.ts
 * Author  : Duncan Tilley
 * Class   : CourseDialog / <course-dialog>
 ***/

import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
    selector: 'course-dialog',
    templateUrl: './course-dialog.component.html'
})
export class CourseDialog {

    name: string = "";
    info: string = "";

    oldName: string;
    oldInfo: string;
    update: boolean;

    constructor(public dialogRef: MatDialogRef<CourseDialog>,
            @Inject(MAT_DIALOG_DATA) public data: any)
    {
        this.update = data.update;
        if (data.update) {
            this.name = data.name;
            this.oldName = this.name;
            this.info = data.info;
            this.oldInfo = this.info;
        }
    }

    onCancelClick(): void {
        this.dialogRef.close({done: false});
    }

    onDoneClick(): void {
        var info = this.info;
        if (info == undefined || info == "Optional Info") {
            info = "";
        }
        if (this.update && this.name == this.oldName &&
                this.info == this.oldInfo) {
            this.dialogRef.close({done: false});
        }
        if (this.name != "Course Name" && this.name != "" &&
                this.name != undefined) {
            this.dialogRef.close(
                {
                    done: true,
                    name: this.name,
                    info: info
                }
            );
        }
    }

}


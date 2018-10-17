/***
 * Filename: home.component.ts
 * Author  : Duncan Tilley
 * Class   : HomeComponent / <home>
 *
 *     The homepage of the golf course mapper.
 ***/

import { Component, ChangeDetectorRef } from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { LoginDialog } from './dialog/login-dialog.component';
import { RegisterDialog } from './dialog/register-dialog.component';

@Component({
    selector: 'home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent {

    mobileQuery: MediaQueryList;

    private _mobileQueryListener: () => void;

    public constructor(
            private router: Router,
            media: MediaMatcher,
            changeDetectorRef: ChangeDetectorRef,
            public dialog: MatDialog) {
        this.mobileQuery = media.matchMedia('(max-width: 600px)');
        this._mobileQueryListener = () => changeDetectorRef.detectChanges();
        this.mobileQuery.addListener(this._mobileQueryListener);
    }

    public onLogin() {
        // bring up the login dialog
        const dialogRef = this.dialog.open(LoginDialog);
        dialogRef.afterClosed().subscribe(result => {
            if (result != undefined && result.done) {
                this.router.navigateByUrl("/mapper");
            }
        });
    }

    public onRegister() {
        // bring up the register dialog
        this.dialog.open(RegisterDialog);
    }

}

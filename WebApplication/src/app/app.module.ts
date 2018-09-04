import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NavComponent } from './components/_MapWorkingAGM_MAT_Design/nav/nav.component';
import { ContentComponent } from './components/_MapWorkingAGM_MAT_Design/content/content.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AgmCoreModule, GoogleMapsAPIWrapper } from '@agm/core'

import { AppComponent } from './app.component';
import { NavMenuComponent } from './components/navmenu/navmenu.component';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { RegisterComponent } from './components/register/register.component';
import { PolygonDialog } from './components/home/dialog/polygon-dialog.component';
import { PointDialog } from './components/home/dialog/point-dialog.component';
import { HoleDialog } from './components/home/dialog/hole-dialog.component';
import { CourseDialog } from './components/home/dialog/course-dialog.component';

import { ApiService } from './services/api/api.service';
import { GlobalsService } from './services/globals/globals.service';
import { SocketService } from './services/socket/socket.service';
import { LocationService } from './services/location/location.service';

import { CommonModule } from '@angular/common';
import { FormsModule, NgModel, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';
import { SmdFabSpeedDialComponent, SmdFabSpeedDialActions, SmdFabSpeedDialTrigger } from "./components/smd-fab-speed-dial"

import {
    MatAutocompleteModule,
    MatBadgeModule,
    MatBottomSheetModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDatepickerModule,
    MatDialogModule,
    MatDividerModule,
    MatExpansionModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatRippleModule,
    MatSelectModule,
    MatSidenavModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatSortModule,
    MatStepperModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    MatTreeModule,
} from '@angular/material';


@NgModule({
    declarations: [
        AppComponent,
        NavComponent,
        ContentComponent,
        NavMenuComponent,
        LoginComponent,
        RegisterComponent,
        HomeComponent,
        PolygonDialog,
        PointDialog,
        HoleDialog,
        CourseDialog,
        SmdFabSpeedDialComponent,
        SmdFabSpeedDialActions,
        SmdFabSpeedDialTrigger
    ],
    imports: [
        CommonModule,
        HttpModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule.forRoot([
            { path: '', redirectTo: 'login', pathMatch: 'full' },
            { path: 'login', component: LoginComponent },
            { path: 'mapper', component: HomeComponent },
            { path: 'register', component: RegisterComponent },
            { path: '**', redirectTo: 'login' }
        ]),
        MatAutocompleteModule,
        MatBadgeModule,
        MatBottomSheetModule,
        MatButtonModule,
        MatButtonToggleModule,
        MatCardModule,
        MatCheckboxModule,
        MatChipsModule,
        MatDatepickerModule,
        MatDialogModule,
        MatDividerModule,
        MatExpansionModule,
        MatGridListModule,
        MatIconModule,
        MatInputModule,
        MatListModule,
        MatMenuModule,
        MatNativeDateModule,
        MatPaginatorModule,
        MatProgressBarModule,
        MatProgressSpinnerModule,
        MatRadioModule,
        MatRippleModule,
        MatSelectModule,
        MatSidenavModule,
        MatSliderModule,
        MatSlideToggleModule,
        MatSnackBarModule,
        MatSortModule,
        MatStepperModule,
        MatTableModule,
        MatTabsModule,
        MatToolbarModule,
        MatTooltipModule,
        MatTreeModule,
        BrowserModule,
        BrowserAnimationsModule,
        AgmCoreModule.forRoot({
            apiKey: "AIzaSyBnbeKYeCMSTPhkws7du0gvv_eSEp02Kog",
            libraries: ["places"]
        })
    ],
    providers: [
        GoogleMapsAPIWrapper,
        ApiService,
        GlobalsService,
        SocketService,
        LocationService
    ],
    entryComponents: [PolygonDialog, PointDialog, HoleDialog, CourseDialog],
    bootstrap: [AppComponent]
})
export class AppModule { }


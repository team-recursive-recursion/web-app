import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NavComponent } from './components/_MapWorkingAGM_MAT_Design/nav/nav.component';
import { ContentComponent } from './components/_MapWorkingAGM_MAT_Design/content/content.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AgmCoreModule, GoogleMapsAPIWrapper } from '@agm/core'

import { AppComponent } from './app.component';
import { NavMenuComponent } from './components/navmenu/navmenu.component';
import { MapperComponent } from './components/mapper/mapper.component';
import { HomeComponent } from './components/home/home.component';
import { AreaDialog } from './components/mapper/dialog/area-dialog.component';
import { PointDialog } from './components/mapper/dialog/point-dialog.component';
import { HoleDialog } from './components/mapper/dialog/hole-dialog.component';
import { CourseDialog } from './components/mapper/dialog/course-dialog.component';
import { LoginDialog } from './components/home/dialog/login-dialog.component';
import { RegisterDialog } from './components/home/dialog/register-dialog.component';
import { InfoDialog } from './components/dialog/info-dialog.component';
import { ConfirmDialog } from './components/dialog/confirm-dialog.component';

import { ApiService } from './services/api/api.service';
import { GlobalsService } from './services/globals/globals.service';

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
        HomeComponent,
        MapperComponent,
        AreaDialog,
        PointDialog,
        HoleDialog,
        CourseDialog,
        LoginDialog,
        RegisterDialog,
        InfoDialog,
        ConfirmDialog,
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
            { path: '', redirectTo: 'home', pathMatch: 'full' },
            { path: 'home', component: HomeComponent },
            { path: 'mapper', component: MapperComponent },
            { path: '**', redirectTo: 'home' }
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
        GlobalsService
    ],
    entryComponents: [AreaDialog, PointDialog, HoleDialog, CourseDialog,
            LoginDialog, RegisterDialog, InfoDialog, ConfirmDialog],
    bootstrap: [AppComponent]
})
export class AppModule { }


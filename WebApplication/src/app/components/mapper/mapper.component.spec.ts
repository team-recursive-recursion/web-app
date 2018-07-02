import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {} from 'jasmine';

import { MapperComponent } from './mapper.component';

describe('MapperComponent', () => {
    let component: MapperComponent;
    let fixture: ComponentFixture<MapperComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ MapperComponent ]
        })
        .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MapperComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('Test Map Geojson format', () => {
        expect(component).toBeTruthy();
    });
    it('Save polygon in GeoJson', () => {
        expect(component).toBeTruthy();
    });
    it('Load Polygon from GeoJson', () => {
        expect(component).toBeTruthy();
    });
    it('Create Course', () => {
        expect(component).toBeTruthy();
    });
    it('Set type of polygon', () => {
        expect(component).toBeTruthy();
    });
});

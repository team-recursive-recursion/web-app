import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentComponent } from './content.component';

<<<<<<< HEAD:WebApplication/ClientApp/app/components/mapper/mapper.component.spec.ts
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
=======
describe('ContentComponent', () => {
  let component: ContentComponent;
  let fixture: ComponentFixture<ContentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
>>>>>>> feature/lean-website:WebApplication/src/app/components/_MapWorkingAGM_MAT_Design/content/content.component.spec.ts

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

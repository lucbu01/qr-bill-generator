import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewPdfDialogComponent } from './view-pdf-dialog.component';

describe('ViewPdfDialogComponent', () => {
  let component: ViewPdfDialogComponent;
  let fixture: ComponentFixture<ViewPdfDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewPdfDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewPdfDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

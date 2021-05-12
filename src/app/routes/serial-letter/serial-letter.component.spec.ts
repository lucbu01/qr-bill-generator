import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SerialLetterComponent } from './serial-letter.component';

describe('SerialLetterComponent', () => {
  let component: SerialLetterComponent;
  let fixture: ComponentFixture<SerialLetterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SerialLetterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SerialLetterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

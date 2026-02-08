import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Workshop } from './workshop';

describe('Workshop', () => {
  let component: Workshop;
  let fixture: ComponentFixture<Workshop>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Workshop]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Workshop);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

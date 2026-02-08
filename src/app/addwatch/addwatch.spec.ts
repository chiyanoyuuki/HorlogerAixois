import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Addwatch } from './addwatch';

describe('Addwatch', () => {
  let component: Addwatch;
  let fixture: ComponentFixture<Addwatch>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Addwatch]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Addwatch);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

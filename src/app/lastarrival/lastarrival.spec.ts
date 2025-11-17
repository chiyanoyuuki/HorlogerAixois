import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Lastarrival } from './lastarrival';

describe('Lastarrival', () => {
  let component: Lastarrival;
  let fixture: ComponentFixture<Lastarrival>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Lastarrival]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Lastarrival);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

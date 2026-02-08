import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Horology } from './horology';

describe('Horology', () => {
  let component: Horology;
  let fixture: ComponentFixture<Horology>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Horology]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Horology);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

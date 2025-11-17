import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Movementscomplic } from './movementscomplic';

describe('Movementscomplic', () => {
  let component: Movementscomplic;
  let fixture: ComponentFixture<Movementscomplic>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Movementscomplic]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Movementscomplic);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

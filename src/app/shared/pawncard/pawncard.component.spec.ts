import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PawncardComponent } from './pawncard.component';

describe('PawncardComponent', () => {
  let component: PawncardComponent;
  let fixture: ComponentFixture<PawncardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PawncardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PawncardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PawnFormComponent } from './pawn-form.component';

describe('PawnFormComponent', () => {
  let component: PawnFormComponent;
  let fixture: ComponentFixture<PawnFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PawnFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PawnFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

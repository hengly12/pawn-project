import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpiredPawnDialogComponent } from './expired-pawn-dialog.component';

describe('ExpiredPawnDialogComponent', () => {
  let component: ExpiredPawnDialogComponent;
  let fixture: ComponentFixture<ExpiredPawnDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpiredPawnDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpiredPawnDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

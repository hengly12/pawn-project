import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpiredCustomerComponent } from './expired-customer.component';

describe('ExpiredCustomerComponent', () => {
  let component: ExpiredCustomerComponent;
  let fixture: ComponentFixture<ExpiredCustomerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpiredCustomerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpiredCustomerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

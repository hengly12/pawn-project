import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportRouterComponent } from './report-router.component';

describe('ReportRouterComponent', () => {
  let component: ReportRouterComponent;
  let fixture: ComponentFixture<ReportRouterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportRouterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportRouterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

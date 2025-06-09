import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkeletonFormLoaderComponent } from './skeleton-form-loader.component';

describe('SkeletonFormLoaderComponent', () => {
  let component: SkeletonFormLoaderComponent;
  let fixture: ComponentFixture<SkeletonFormLoaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkeletonFormLoaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SkeletonFormLoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

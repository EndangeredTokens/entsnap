import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RequestPasswordResetPage } from './request-password-reset.page';

describe('RequestPasswordResetPage', () => {
  let component: RequestPasswordResetPage;
  let fixture: ComponentFixture<RequestPasswordResetPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(RequestPasswordResetPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

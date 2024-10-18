import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthAccountCodePage } from './auth-account-code.page';

describe('AuthAccountCodePage', () => {
  let component: AuthAccountCodePage;
  let fixture: ComponentFixture<AuthAccountCodePage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(AuthAccountCodePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

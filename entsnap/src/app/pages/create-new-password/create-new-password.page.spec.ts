import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateNewPasswordPage } from './create-new-password.page';

describe('CreateNewPasswordPage', () => {
  let component: CreateNewPasswordPage;
  let fixture: ComponentFixture<CreateNewPasswordPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(CreateNewPasswordPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

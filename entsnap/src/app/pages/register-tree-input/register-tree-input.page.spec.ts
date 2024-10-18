import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterTreeInputPage } from './register-tree-input.page';

describe('RegisterTreeInputPage', () => {
  let component: RegisterTreeInputPage;
  let fixture: ComponentFixture<RegisterTreeInputPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(RegisterTreeInputPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

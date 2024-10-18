import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TreePagePage } from './tree-page.page';

describe('TreePagePage', () => {
  let component: TreePagePage;
  let fixture: ComponentFixture<TreePagePage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(TreePagePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

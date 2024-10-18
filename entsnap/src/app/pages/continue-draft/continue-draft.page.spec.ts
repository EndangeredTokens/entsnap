import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContinueDraftPage } from './continue-draft.page';

describe('ContinueDraftPage', () => {
  let component: ContinueDraftPage;
  let fixture: ComponentFixture<ContinueDraftPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ContinueDraftPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

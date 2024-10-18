import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyCollectionPage } from './my-collection.page';

describe('MyCollectionPage', () => {
  let component: MyCollectionPage;
  let fixture: ComponentFixture<MyCollectionPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(MyCollectionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

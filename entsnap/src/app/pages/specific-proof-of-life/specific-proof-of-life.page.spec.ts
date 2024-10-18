import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SpecificProofOfLifePage } from './specific-proof-of-life.page';

describe('SpecificProofOfLifePage', () => {
  let component: SpecificProofOfLifePage;
  let fixture: ComponentFixture<SpecificProofOfLifePage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(SpecificProofOfLifePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

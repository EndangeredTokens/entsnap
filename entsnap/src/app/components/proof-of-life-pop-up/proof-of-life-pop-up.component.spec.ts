import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ProofOfLifePopUpComponent } from './proof-of-life-pop-up.component';

describe('ProofOfLifePopUpComponent', () => {
  let component: ProofOfLifePopUpComponent;
  let fixture: ComponentFixture<ProofOfLifePopUpComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ProofOfLifePopUpComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ProofOfLifePopUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

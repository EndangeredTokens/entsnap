import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { IonModal } from '@ionic/angular';

@Component({
  selector: 'app-proof-of-life-pop-up',
  templateUrl: './proof-of-life-pop-up.component.html',
  styleUrls: ['./proof-of-life-pop-up.component.scss'],
})
export class ProofOfLifePopUpComponent  implements OnInit {

  @ViewChild(IonModal) modal?: IonModal;

  constructor() { }

  ngOnInit() {
    console.log("[proof of life pop up - OnInit] Initialized")
  }

  async presentModal() {
    await this.modal?.present();
  }

}

import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
// import { IonSlides } from '@ionic/angular';

@Component({
  selector: 'app-logo',
  templateUrl: 'logo.page.html',
  styleUrls: ['logo.page.scss'],
})
export class LogoPage implements OnInit {

  // @ViewChild(IonSlides) slides: IonSlides;

  logo: string = "../../../assets/icon/logo_ents_intro.svg";
  logoArbol: string = "../../../assets/icon/logo_arbol.png";
  logoPrincipal: string = "../../../assets/icon/logo_principal.svg";
  moneda: string = "../../../assets/icon/moneda.png";
  grupo1:string = "../../../assets/icon/grupo_1.svg";
  grupo2:string = "../../../assets/icon/grupo_2.svg";
  grupo3: string = "../../../assets/icon/grupo_3.svg";
  continueIcon: string = "../../../assets/icon/button_continue.svg";
  continueIconBackground: string = "../../../assets/icon/esquina_inferior.svg";

  constructor(
    private router: Router,
  ) { }

  ngOnInit() {
    console.log("logo");
    setTimeout(() => {
      this.router.navigateByUrl('/login');
    }, 300)  }

  goToLogin(): void {
    setTimeout(() => {
      this.router.navigateByUrl('/login');
    }, 300)
  }
}

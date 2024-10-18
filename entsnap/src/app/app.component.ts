import { Component, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';
import { RouteHistoryService } from './services/route-history.service';
import { Router } from '@angular/router';
import { MultiLanguageService } from './services/multi-language.service';
 
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  showSplashScreen: boolean = true;
  constructor(
    private platform: Platform,
    private routeHistoryService: RouteHistoryService,
    private router: Router,
    private multiLanguageService: MultiLanguageService,
  ) {
     
  }

  ngOnInit() {
    // Asegurar que el idioma preferido se carga al iniciar la aplicación
    this.initializeApp();
    this.hideSplashScreen();
    this.loadPreferredLanguage();  // Cargar el idioma preferido al inicio
  }
  initializeApp() {
    this.platform.ready().then(() => {
      this.platform.backButton.subscribeWithPriority(0, async () => {
        console.log("[app component] InitializeApp - backButton subscribed");
        const prevUrl = this.routeHistoryService.getPrevUrl();
        if (prevUrl) {
          this.router.navigateByUrl(prevUrl);
        }
      });
    });
  }

  hideSplashScreen() {
    setTimeout(() => {
      this.showSplashScreen = false;
    }, 1000);
  }
  // Cargar el idioma preferido desde localStorage o el idioma del dispositivo
  async loadPreferredLanguage() {
    await this.multiLanguageService.updatePreferredLanguage();
    console.log("Idioma preferido cargado:", this.multiLanguageService.getCurrentLanguange());
  }
}

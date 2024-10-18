import { TranslateService } from '@ngx-translate/core';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { Device } from '@capacitor/device';

@Injectable({
    providedIn: 'root'
})
export class MultiLanguageService {
    private ImplementedLanguages: string[] = ["en", "es", "pt"];
    private inUseLanguange: string | null = null;
    private defaultLanguage: string = "en";

    constructor (
        private _translate: TranslateService
    ) {
        // default lang
        this._translate.setDefaultLang(this.defaultLanguage);
    }

    setLanguage(toLanguage: string){
        // check the allowed language list
        if (this.ImplementedLanguages.includes(toLanguage)){
            this.inUseLanguange = toLanguage;
            this._translate.use(this.inUseLanguange);
            localStorage.setItem('selectedLanguage', this.inUseLanguange);
        } else {
            console.log(`[MultiLang.changeLanguage] invalid target language ${toLanguage}`)
        }
    }

    /**
     * if the device preferred language is in the list of integrated languages,
     * update the default language to that.
     * use this function only once when the app loads
     */
    async updatePreferredLanguage() {
        const storedLanguage = localStorage.getItem('selectedLanguage');

        // if not stored lang
        if (!storedLanguage){
            // try to use device lang
            const deviceLang = await this.getDeviceLanguage();
            if (deviceLang && this.ImplementedLanguages.includes(deviceLang)){
                // use device lang
                this._translate.use(deviceLang);
                this.inUseLanguange = deviceLang;
            }
            // otherwise, keep with the default lang
        } else {
            // if stored lang, use that
            this._translate.use(storedLanguage);
            this.inUseLanguange = storedLanguage;
            console.log(`[MultiLang.updatePreferredLanguage] Using stored language: ${storedLanguage}`);
        }
    }


    async getDeviceLanguage(): Promise<string|null>{
        try {
                // Obtener el idioma en un dispositivo móvil
                const { value } = await Device.getLanguageCode();
                console.log(`[MultiLang.getDeviceLanguage] Device language: ${value}`);
                return value ? value.split('-')[0] : null;
            
        } catch (err) {
            const browserLang = navigator.language.split('-')[0];
            console.error(`[MultiLang.getDeviceLanguage] Error: ${err}`);
            return browserLang;
        }
    }

    getDefaultLanguage(): string {
        return this._translate.getDefaultLang()
    }

    getCurrentLanguange(): string {
        return this.inUseLanguange || this.defaultLanguage;
    }


}

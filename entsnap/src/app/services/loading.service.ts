import { Injectable } from "@angular/core";
import { LoadingController } from "@ionic/angular";
import { AlertController } from "@ionic/angular";

@Injectable({
	providedIn: "root",
})
export class LoadingService {
	private _loadingAnimation!: HTMLIonLoadingElement;
	private _alertAnimation!: HTMLIonAlertElement;

	constructor(private loadingController: LoadingController, private alertController: AlertController) {}

	async show(): Promise<void> {
		this._loadingAnimation = await this.loadingController.create({
			cssClass: "transparent",
			message: 'Loading...',
			spinner: 'circles'
		});

		return this._loadingAnimation.present();
	}

	async dismiss(): Promise<boolean> {
		return this._loadingAnimation.dismiss();
	}

	async notificationShow(): Promise<void> {
		this._alertAnimation = await this.alertController.create({
			header: "Sin conexión",
			subHeader: "Comprueba tu conexión Wi-Fi o de datos móviles",
			buttons: ["OK"],
		});

		return this._alertAnimation.present();
	}

	async notificationErrorShow(text?: string): Promise<void> {
		this._alertAnimation = await this.alertController.create({
			header: "Error",
			subHeader: text ? text : "Ha ocurrido un error, por favor intente de nuevo más tarde.",
			buttons: ["OK"],
		});

		return this._alertAnimation.present();
	}
}

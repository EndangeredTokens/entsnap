import { Injectable } from "@angular/core";
import { Platform } from "@ionic/angular";
import { environment } from "src/environments/environment";

@Injectable({
	providedIn: "root",
})
export class VersionsService {
	private _userVersion = this.appPlatform === "android" ? environment.androidVersionNumber : 0;
	private _userVersionCode = this.appPlatform === "android" ? environment.androidVersion : "0";


	constructor(private platform: Platform) {}

	get appPlatform(): string {
		if (this.platform.is("ios")) {
			return "ios";
		}
		if (this.platform.is("android")) {
			return "android";
		}
		if (this.platform.is("desktop")) {
			return "android";
		}
		return "unknown";
	}

	get appGoToStoreFunction(): () => void {
        // function to redirecto to store 
        // if the current app version is lower than the current version
        // accepted by the backend
        // we could use conditional in the case the app is deployed in different platforms
		return () => {
			window.open("https://play.google.com/store/apps/details?id=ehive_V1.app", "_system");
		};
	}

	get userVersion(): number {
		return this._userVersion;
	}

	get userVersionCode(): string {
		return this._userVersionCode;
	}

	checkAppVersion = async (): Promise<string | void> => {
		// we could use this to check the compatible version of the backend and validate
        // if the current app version is active or the user should update
	};
}

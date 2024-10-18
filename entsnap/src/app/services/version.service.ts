import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Platform } from "@ionic/angular";
import { environment } from "src/environments/environment";
import { routes } from "./routes";
import { map, tap } from "rxjs";

@Injectable({
	providedIn: "root",
})
export class VersionsService {
	constructor(
		private platform: Platform,
		private http: HttpClient,
		private routes: routes,
	) {}

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
		if (this.appPlatform === "android") return environment.androidVersionNumber;
		else if (this.appPlatform === "ios") return environment.iosVersionNumber;
		else return 0
	}

	get userVersionCode(): string {
		if (this.appPlatform === "android") return environment.androidVersion;
		else if (this.appPlatform === "ios") return environment.iosVersion;
		else return "0.0.0"
	}

	checkAppVersion = async (): Promise<boolean> => {
		return new Promise<boolean> ((resolve, reject) => {
			this.http.get(this.routes.versionUrl()+"/"+this.appPlatform).subscribe(
				(response: any) => {
					resolve(this.userVersion >= response.data);
				},
				(error: any) => {
					reject(error);
				}
			)
		});
	}
}

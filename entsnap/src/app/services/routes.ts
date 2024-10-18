import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class routes {

  getUrl(name: keyof typeof environment.api): string {
    return `${environment.backend}/${environment.api[name]}`;
  }

  getApiKey(name: keyof typeof environment.keys): string {
    return environment.keys[name]
  }

  commentsUrl(): string {
    return this.getUrl("comments");
  }

  imagesUrl(): string {
    return this.getUrl("images");
  }

  plantnetUrl(): string {
    return this.getUrl("plantnet");
  }

  reportsUrl(): string {
    return this.getUrl("reports");
  }

  usersUrl(): string {
    return this.getUrl("users");
  }

  authUrl(): string {
    return this.getUrl("auth");
  }

  recoverUrl(): string {
    return this.getUrl("recover");
  }

  weatherUrl(lat: number, lng: number): string {
    return `${this.getUrl("weather")}/${lat}/${lng}`;
  }

  validationUrl(): string {
    return this.getUrl("validate")
  }

  treeStageUrl(): string {
    return this.getUrl("stages")
  }

  treeFoliagesUrl(): string {
    return this.getUrl("foliages")
  }

  countriesUrl(): string {
    return this.getUrl("countries");
  }

  versionUrl(): string {
    return this.getUrl("version");
  }
}

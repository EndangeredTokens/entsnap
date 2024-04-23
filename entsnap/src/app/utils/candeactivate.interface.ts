import { UrlTree } from "@angular/router";
import { Observable } from "rxjs";


export interface ICanComponentDeactivate {
    canDeactivate: () => Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree;
  }
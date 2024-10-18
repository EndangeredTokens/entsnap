import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { routes } from './routes';
import { Observable } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TreePropertiesService {

  constructor(
    private http: HttpClient,
    private routes: routes,
  ) { }

  getStages(): Observable<any> {
    return this.http.get<any>(this.routes.treeStageUrl())
    .pipe(
      tap(_ => console.log("Fetched stages")),
        map(response => response.data),
    )
  }

  getFoliages(): Observable<any> {
    return this.http.get<any>(this.routes.treeFoliagesUrl())
    .pipe(
      tap(_ => console.log("Fetched Foliages")),
        map(response => response.data),
    )
  }
}

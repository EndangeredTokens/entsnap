import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { routes } from './routes';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, retry, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ReportValidationService {

  headers!: HttpHeaders;
  authToken!: string | null;

  constructor(
    private http: HttpClient,
    private routes: routes,
    private authService: AuthService,
  ) { }

  addValidation(proofOfLife: any): Observable<any> {
    this.authToken = this.authService.getAuthToken();
    this.headers = new HttpHeaders({
      auth_token: 'Bearer '+this.authToken || '',
    });

    console.log("Adding validation", proofOfLife );
    return this.http.post<any>(this.routes.validationUrl(), proofOfLife, { headers: this.headers })
      .pipe(
        catchError(this.handleError('Error add validation', proofOfLife))
      );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.log(error)
      console.log(`${operation} failed: ${error.message}`);
      return of(result as T);
    }
  }
}

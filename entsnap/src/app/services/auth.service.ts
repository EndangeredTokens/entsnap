import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Router } from '@angular/router';
import { UserService } from './user.service';
import { routes } from './routes';
import { Observable, of } from 'rxjs';
import { User } from "../models/userShort";
import { HttpClient, HttpHeaders, HttpRequest, HttpResponse, HttpParams } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';
import { Network } from '@capacitor/network';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  user!: User;
  logedIn!: boolean;
  offlineMode!: boolean;

  constructor(
    private http: HttpClient,
    private platform: Platform,
    private router: Router,
    private userService: UserService,
    private routes: routes,
  ) { }

  getEmail(): string|undefined {
    return this.user.email;
  }

  async networkStatus(): Promise<Boolean>{
    const status = await Network.getStatus();
    console.log("network status, connected", status.connected, "connectionType", status.connectionType)
    return status.connected
  }

  async enterOfflineMode(): Promise<void>{
    let emptyUser = this.userService.generateEmptyUser()
    this.userService.setUserData(emptyUser)
    this.user = emptyUser
    this.logedIn = false
    this.offlineMode = true
  }

  login(data: any): Observable<any> {
    this.logedIn = false;
    return this.http.post<User>(`${this.routes.authUrl()}/login`, data)
      .pipe(
        tap(_ => console.log("Starting login")),
        map(response => this.extractUser(response)),
        catchError(this.handleError("login", null))
      )
  }

  loginWeb3(address: string): Observable<any> {
    return this.http.post<User>(`${this.routes.authUrl()}/web3/login/`, { address, });
  }

  signUp(data: any): Observable<any> {
    this.logedIn = false;
    return this.http.post<User>(`${this.routes.authUrl()}/register`, data)
      .pipe(
        tap(_ => console.log("Starting register")),
        map(response => this.extractUser(response))
      )
  }

  googleSignUp(data: any): Observable<any> {
    this.logedIn = false;
    return this.http.post<User>(`${this.routes.authUrl()}/google/register`, data)
      .pipe(
        tap(_ => console.log("starting google register")),
        map(response => this.extractUser(response))
      )
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.log(`${operation} failed: ${error.message}`);
      this.logedIn = false;
      return of(result as T);
    }
  }

  extractUser(res: any): User {
    console.log("set user to", res.user);
    this.userService.setUserData(res.user);
    this.user = res.user;
    this.logedIn = true;
    return this.user
  }

  isLogedIn(): boolean {
    return this.logedIn;
  }

  isOfflineMode(): boolean {
    return this.offlineMode
  }

  isVerified(): Promise<boolean> {
    // old method from firebase login, should update
    return Promise.resolve(true);
  }

  reload(): void {
    // old method from firebase login, should check if delete or update
    // what could be the usages for this method?
  }

  sendResetEmail(email: string): Observable<any> {
    const data = {email: email}
    return this.http.post<User>(`${this.routes.authUrl()}/forgot-password`, data)
      .pipe(
        tap(_ => console.log("Starting recover password")),
        map(response => response),
        catchError(this.handleError("forgot password", null))
      )
  }

  createToken(token: string): Observable<any> {
    const data = {token: token}
    return this.http.post<any>(`${this.routes.recoverUrl()}/createRecoverToken`, data)
      .pipe(
        tap(_ => console.log("Starting create token")),
        map(response => response),
        catchError(this.handleError("create token", null))
      )
  }

  setCurrentUser(): void {
    // old method to set the current user, should delete (now using localstorage)
    // this.userService.setCurrentUserBody(this.FBUser);
  }

  setLocal(): void {
    // old method to set data persistency, should delete (now using localstorage)
    // this.angularFire.setPersistence(firebase.default.auth.Auth.Persistence.LOCAL);
  }

  setNone(): void {
    // old method to set data persistency, should delete (now using localstorage)
    // this.angularFire.setPersistence(firebase.default.auth.Auth.Persistence.NONE);
  }

//   signInWithEmail(email: string, password: string): Promise<firebase.default.auth.UserCredential> {
    // oldmethod to sing in with email, should update
    // return this.angularFire.signInWithEmailAndPassword(email, password);
//   }

  // signInWithGoogle(): Promise<any> {
  //   old method to sign in with google, should update
  //   const provider = new firebase.default.auth.GoogleAuthProvider();
  //   console.log(provider);
  //   const scopes = ['profile', 'email'];
  //   return this.socialSignIn(provider.providerId, scopes);
  // }

//   signOut() {
//     return this.angularFire.signOut().then(() => {
//       this.router.navigateByUrl('/login');
//     })
//   }

//   signUpWithEmail(email: string, password: string): Promise<firebase.default.auth.UserCredential> {
//     return this.angularFire.createUserWithEmailAndPassword(email, password);
//   }

//   socialSignIn(providerName: string, scopes?: Array<string>): Promise<any> {
//     const provider = new firebase.default.auth.OAuthProvider(providerName);
//     if (scopes) {
//       scopes.forEach(scope => {
//         provider.addScope(scope);
//       })
//     }

//     if (this.platform.is('desktop')) {
//       return this.angularFire.signInWithPopup(provider);
//     } else {
//       // App fails here
//       return this.angularFire.signInWithRedirect(provider);
//     }
//   }

  verifyEmail(): void {
    // old method to send email verification, should update
    // this.FBUser.sendEmailVerification()
  }

  isAuthenticated(token: string): Observable<any> {
    const params = new HttpParams().set('token', token);
    return this.http.get<any>(`${this.routes.authUrl()}/session/check/`, { params: params} )
      .pipe(
        tap(_ => console.log("Starting create token")),
        map(response => {
          this.extractUser(response);
          return response.ok
        }),
        catchError(this.handleError("create token", null))
      )
  }
}

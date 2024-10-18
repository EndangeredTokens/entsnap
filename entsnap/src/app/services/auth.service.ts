import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Router } from '@angular/router';
import { UserService } from './user.service';
import { routes } from './routes';
import { Observable, of, interval, throwError } from 'rxjs';
import { User } from '../models/userShort';
import {
    HttpClient,
    HttpHeaders,
    HttpRequest,
    HttpResponse,
    HttpParams,
} from '@angular/common/http';
import { catchError, map, tap, switchMap } from 'rxjs/operators';
import { Network } from '@capacitor/network';
import { Loader } from '@googlemaps/js-api-loader';
import { SessionVerify } from '../models/sessionVerify';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    user!: User;
    logedIn!: boolean;
    offlineMode!: boolean;

    // keep data state for register user operations
    registerEmail!: string;
    registerPassword!: string;

    // keep data state for password reset operations
    forgotPasswordData = {
        email: '',
        password: '',
        totp: '',
    };

    // keep data state for register user operations
    createAccountData = {
        email: '',
        password: '',
    };

    networkStatus: boolean = false;

    constructor(
        private http: HttpClient,
        private platform: Platform,
        private router: Router,
        private userService: UserService,
        private routes: routes,
    ) {
        this.initNetworkStatusMonitoring();
    }

    getEmail(): string | undefined {
        return this.user.email;
    }

    getAuthToken() {
        return localStorage.getItem('auth_token');
    }

    // Algo de los chequeos de internet esta haciendo que el console muestre logs nativos
    async initNetworkStatusMonitoring() {
        // Initial network status check
        this.networkStatus = await this.checkNetworkStatus();

        // Poll network status every second
        interval(1000)
            .pipe(switchMap(() => this.checkNetworkStatus()))
            .subscribe((status) => {
                this.networkStatus = status;
                // console.log('Network status updated:', this.networkStatus);
            });

        // Listen for network status changes using Capacitor Network plugin
        Network.addListener('networkStatusChange', async (status) => {
            this.networkStatus = status.connected;
            // console.log('[Network.addListener] Network status changed:', this.networkStatus);
        });
    }

    async checkNetworkStatus(): Promise<boolean> {
        const status = await Network.getStatus();
        // console.log("[checkNetworkStatus] Network status: connected", status.connected, "connectionType", status.connectionType);
        return status.connected;
    }

    async enterOfflineMode(): Promise<void> {
        let emptyUser = this.userService.generateEmptyUser();
        this.userService.setUserData(emptyUser);
        this.user = emptyUser;
        this.logedIn = false;
        this.offlineMode = true;
    }

    login(data: any): Observable<any> {
        // this.reloadGoogleMapsApi()
        if (!this.networkStatus) {
            console.log('No network connection');
            return throwError(new Error('No network connection'));
        }
        this.logedIn = false;
        return this.http
            .post<User>(`${this.routes.authUrl()}/login`, data)
            .pipe(
                tap((_) => console.log('Starting login')),
                map((response) => this.extractUser(response)),
                catchError(this.handleError('login', null)),
            );
    }

    loginWeb3(address: string): Observable<any> {
        return this.http.post<User>(`${this.routes.authUrl()}/web3/login/`, {
            address,
        });
    }

    signUp(data: any): Observable<any> {
        this.logedIn = false;
        return this.http
            .post<User>(`${this.routes.authUrl()}/register`, data)
            .pipe(
                tap((_) => console.log('Starting register')),
                map((response) => this.extractUser(response)),
            );
    }

    saveRegisterData(email: string, password: string) {
        this.registerEmail = email;
        this.registerPassword = password;
    }

    saveCreateAccountData(email?: string, password?: string) {
        if (email !== undefined) {
            this.createAccountData.email = email;
        }
        if (password !== undefined) {
            this.createAccountData.password = password;
        }

        console.log(
            '[auth.service] createAccountData:',
            this.createAccountData,
        );
    }

    saveForgotPasswordData(email?: string, password?: string, totp?: string) {
        if (email !== undefined) {
            this.forgotPasswordData.email = email;
        }
        if (password !== undefined) {
            this.forgotPasswordData.password = password;
        }
        if (totp !== undefined) {
            this.forgotPasswordData.totp = totp;
        }

        console.log(
            '[auth.service] saveForgotPasswordData:',
            this.forgotPasswordData.email,
            this.forgotPasswordData.password,
        );
    }

    // data: email object
    sendTotpEmail(data: any): Observable<any> {
        // return this.http.post<any>(`${this.routes.authUrl}/send-totp`, data)
        console.log('sendTotpEmail data:', data);
        // console.log(`${this.routes.authUrl}/send-totp`)
        return this.http.post<any>(`${this.routes.authUrl()}/send-totp`, data);
    }

    // data: {email, totpToken}
    validateTotpToken(data: any): Observable<any> {
        return this.http.post<any>(
            `${this.routes.authUrl()}/validate-totp`,
            data,
        );
    }

    web3SignUp(data: {
        email: string;
        password: string;
        walletAddress: string;
    }): Observable<any> {
        return this.http.post<User>(
            `${this.routes.authUrl()}/web3-register`,
            data,
        );
    }

    googleSignUp(data: any): Observable<any> {
        if (!this.networkStatus) {
            console.log('No network connection');
            return throwError(new Error('No network connection'));
        }
        this.logedIn = false;
        return this.http
            .post<User>(`${this.routes.authUrl()}/google/register`, data)
            .pipe(
                tap((_) => console.log('starting google register')),
                map((response) => this.extractUser(response)),
            );
    }

    private handleError<T>(operation = 'operation', result?: T) {
        return (error: any): Observable<T> => {
            console.log(`${operation} failed: ${error.message}`);
            this.logedIn = false;
            return of(result as T);
        };
    }

    extractUser(res: any): User {
        console.log('set user to', res.data);
        this.userService.setUserData(res.data);
        this.user = res.data;
        this.logedIn = true;
        return this.user;
    }

    isLogedIn(): boolean {
        return this.logedIn;
    }

    isOfflineMode(): boolean {
        return this.offlineMode;
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
        const data = { email: email };
        return this.http
            .post<User>(`${this.routes.authUrl()}/forgot-password`, data)
            .pipe(
                tap((_) => console.log('Starting recover password')),
                map((response) => response),
                catchError(this.handleError('forgot password', null)),
            );
    }

    createToken(token: string): Observable<any> {
        const data = { token: token };
        return this.http
            .post<any>(`${this.routes.recoverUrl()}/createRecoverToken`, data)
            .pipe(
                tap((_) => console.log('Starting create token')),
                map((response) => response),
                catchError(this.handleError('create token', null)),
            );
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

  verifyPassword(email:string, password: string) {
    const data = {
      email: email,
      password: password
    };
    return this.http.post<any>(`${this.routes.authUrl()}/verify`, data);
  }

    isAuthenticated(token: string): Observable<SessionVerify | null> {
        const params = new HttpParams().set('token', token);
        return this.http
            .get<SessionVerify>(`${this.routes.authUrl()}/session/check/`, {
                params: params,
            })
            .pipe(
                tap((_) => console.log('Starting create token')),
                map((response) => {
                    if (response.authorized && response.user){
                        // this.extractUser(response.data);
                        this.userService.setUserData(response.user);
                        this.user = response.user
                        this.logedIn = true;
                    } else {
                        this.logedIn = false;
                    }
                    console.log('RESPONSE DATA ', response);
                    return response;
                }),
                catchError(this.handleError('create token', null)),
            );
    }
}

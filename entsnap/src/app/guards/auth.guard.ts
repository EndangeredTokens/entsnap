import { Injectable, inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { switchMap, catchError, take } from 'rxjs/operators';
import { Observable, of, lastValueFrom} from 'rxjs';

@Injectable({
    providedIn: 'root'
})
class AuthGuard {

    constructor(
        private authService: AuthService,
        private router: Router
    ) { }
    
    async checkSessionToken(token: string){
        try {
            return await lastValueFrom(this.authService.isAuthenticated(token));
        } catch (error) {
            return null
        }
    }

    /**
     * redirects to the main page for log-in
     * currently, this page is /login, but in the future can change
     */
    async redirectToLoginPage(){
        console.log("going to /login")
        await this.router.navigateByUrl('/login');
    }

    /**
     * redirects to the main page after a log-in
     * currently, this page is /tabs/home, but in the future can change
     */
    async redirectToLoggedInPage(){
        console.log("going to /tabs/home")
        await this.router.navigateByUrl('/tabs/home');
    }

    
    /**
     * Allow navigation on certain routes based on session token validation
     */
    async allowAuthNavigation(): Promise<boolean> {
        if (this.authService.offlineMode){
            return true
        }
        const token = localStorage.getItem('auth_token');
        if (!token){
            // without session token navigation is not allowed, send to login
            console.log("without session token navigation is not allowed, send to login")
            await this.redirectToLoginPage()
            return false
        }

        const data = await this.checkSessionToken(token);
        if (!data){
            // without being able the validate token navigation is not allowed
            // send to login
            console.log("without being able the validate token navigation is not allowed")
            await this.redirectToLoginPage()
            return false
        }
        else {
            if (!data.authorized || !data.user){
                // without authorized or user data navigation is not allowed
                // send to login
                console.log(" without authorized or user data navigation is not allowed")
                await this.redirectToLoginPage()
                return false
            }
        }
        
        // otherwise, navigation is allowed
        return true
    }

    /**
     * Check if a session token exists and generates an automatic login
     */
    async automaticSessionLogin(): Promise<boolean>{
        console.log("[automaticSessionLogin] start")
        const token = localStorage.getItem('auth_token');
        if (!token){
            // without session token cannot do automatic login, continue
            console.log("[automaticSessionLogin] without session token cannot do automatic login, continue")
            return true
        }

        const data = await this.checkSessionToken(token);
        if (!data){
            // without being able to validate token cannot do automatic login, continue
            console.log("[automaticSessionLogin] without being able to validate token cannot do automatic login, continue")
            return true
        }
        else {
            if (!data.authorized || !data.user){
                // without authorized or user data cannot do automatic login
                // continue
                console.log("[automaticSessionLogin] without authorized or user data cannot do automatic login")
                return true
            }
        }
        // otherwise, we can do an automatic login and we will redirect to
        console.log("[automaticSessionLogin] done, doing redirect")
        await this.redirectToLoggedInPage()
        return false;
    }
}

export const isAuthGuard: CanActivateFn = (): Promise<boolean> => {
  return inject(AuthGuard).allowAuthNavigation()
}

export const RedirectFromAuthOnActivateGuard: CanActivateFn = (): Promise<boolean> => {
    return inject(AuthGuard).automaticSessionLogin()
  }


import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class RouteHistoryService {
    private history: string[] = [];
    private maxHistory: number = 10;

    constructor (private router: Router, private authService: AuthService) {
    }

    addRoute(url: string){
        console.log("[RouteHistoryService] add url", url)
        this.history.push(url)
        if (this.history.length > this.maxHistory){
            this.history.shift()
        }
    }

    getRouteHistory(): string[]{
        return this.history
    }

    getPrevUrl(): string|null {
        if (this.history.length < 2){
            return null
        }

        /*

        // Previous url is saved in order to access to it after deleting it
        const prevUrl = this.history[this.history.length - 2];

        this.history.pop(); // Delete current url
        this.history.pop(); // Delete previous url (because addRoute function will add it again)

        return prevUrl; // Return the previous url that have been saved.
        */

        return this.history[this.history.length - 2];
    }

    getCurrentUrl(): string|null {
        if (this.history.length < 1){
            return null
        }
        return this.history[this.history.length - 1]
    }

    historyGo(position: number): string|null {
        if (position > this.history.length - 1){
            return null
        }
        return this.history[this.history.length - 1 - position]
    }

    getDefaultPrevUrl(): string {
        if (this.authService.offlineMode && !this.authService.logedIn){
            return "/tabs/profile"
        } else {
            return "/tabs/home"
        }
    }

    getLoggedInPrevUrl(): string {
        if (this.history.length < 2){
            return this.getDefaultPrevUrl()
        } else if ( this.history[this.history.length - 2] === "/login") {
            return this.getDefaultPrevUrl()
        }
        return this.history[this.history.length - 2]
    }
}

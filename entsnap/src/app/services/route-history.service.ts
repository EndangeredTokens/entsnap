import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class RouteHistoryService {
    private history: string[] = [];
    private maxHistory: number = 10;

    constructor (private router: Router) {
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
        return this.history[this.history.length - 2]
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
}
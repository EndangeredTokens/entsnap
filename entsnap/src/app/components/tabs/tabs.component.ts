import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, NavigationEnd, Event } from '@angular/router';
import { IonTabs } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { filter } from 'rxjs/operators';

@Component({
    selector: 'app-tabs',
    templateUrl: './tabs.component.html',
    styleUrls: ['./tabs.component.scss'],
})
export class TabsComponent implements OnInit {
    home = {
        inactive: '../../../assets/icon/house_icon.svg',
        active: '../../../assets/icon/house_icon_select.svg',
    };

    tree = {
        inactive: '../../../assets/icon/tree_icon.svg',
        active: '../../../assets/icon/tree_icon_select.svg',
    };

    map = {
        inactive: '../../../assets/icon/map_icon.svg',
        active: '../../../assets/icon/map_icon_select.svg',
    };

    ents = {
        inactive: '../../../assets/icon/wallet_icon.svg',
        active: '../../../assets/icon/wallet_icon_select.svg',
    };

    profile = {
        inactive: '../../../assets/icon/profile_icon.svg',
        active: '../../../assets/icon/profile_icon_select.svg',
    };

    selectedTab: string = 'tree';
    hideTabs: boolean = false;

    @ViewChild('tabs') tabs!: IonTabs;

    constructor(
        private router: Router,
        private authService: AuthService,
    ) {}

    ngOnInit() {
        console.log('[tabs.component] ngOnInit');
        console.log('[tabs.component] router.url', this.router.url);
        this.hideTabs =
            this.router.url === '/tabs/tree' ||
            this.router.url.includes('/tabs/validate');
        this.router.events
            .pipe(
                filter(
                    (event: Event): event is NavigationEnd =>
                        event instanceof NavigationEnd,
                ),
            )
            .subscribe((event: NavigationEnd) => {
                this.hideTabs = event.urlAfterRedirects === '/tabs/tree' || event.urlAfterRedirects.includes('/tabs/validate')
                console.log(
                    '[tabs.component] urlAfterRedirects',
                    event.urlAfterRedirects,
                );
            });
    }

    goToMap() {
        this.router.navigate(["/tabs/map"], { queryParams: {} });
    }

    setCurrentTab(tabs: IonTabs): void {
        this.selectedTab = tabs.getSelected()!;
    }

    isOfflineMode() {
        return this.authService.offlineMode;
    }
}

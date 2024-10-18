import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { LocationV2Service } from 'src/app/services/location.v2.service';
import { ReportService } from 'src/app/services/report.service';
import { Pipe } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Loader } from '@googlemaps/js-api-loader';
import { MultiLanguageService } from 'src/app/services/multi-language.service';
@Component({
    selector: 'app-home',
    templateUrl: './home.page.html',
    styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
    prevLocation?: google.maps.LatLng | null | undefined;

    user: any;
    isLoading: boolean = true;
    closeMarkersLst: { marker: any; distance: number }[] = [];

    userReportsAmount: number | null = null;
    userReportsCount: number = 0;
    userProofOfLifeCount: number = 0;

    constructor(
        private router: Router,
        private userService: UserService,
        private locationService: LocationV2Service,
        private reportService: ReportService,
        private multiLanguageService: MultiLanguageService
    ) {
        this.user = userService.getCurrentUser();
    }

    async ngOnInit() {
        //   // const markersRange = 100000
        //   // Get user position
        //   await this.locationService.updatePosition()
        //   const result = await this.locationService.getClosestMarkersInRange(environment.treesNearYouRange)
        //   this.closeMarkersLst = result.closeMarkers
        //
        //   console.log(`Close markers in range: ${environment.treesNearYouRange} m`)
        //   console.log(this.closeMarkersLst)
        //   await this.getEntIdData()
        /*  this.loadCloseMarkers(); */
    }
    async loadCloseMarkers() {
        this.isLoading = true;
    }
    async ionViewWillEnter() {
        await this.loadCloseMarkers();
        await this.locationService.updatePosition();
        await this.getUserReportStats();

        const result = await this.locationService.getClosestMarkersInRange(
            environment.treesNearYouRange,
        );
        this.closeMarkersLst = result.closeMarkers;
        console.log(
            `Close markers in range: ${environment.treesNearYouRange} m`,
        );

        this.closeMarkersLst.sort((marker1, marker2) => {
            return marker1.distance - marker2.distance;
        })
        console.log(this.closeMarkersLst);
        console.log('[home.page][ionViewWillEnter]');
        console.log(
            '[home.page][ionViewWillEnter] this.closeMarkersLst:',
            this.closeMarkersLst,
        );
        if (!this.closeMarkersLst) {
            console.log(
                '[home.page][ionViewWillEnter] Missing this.closeMarkersLst ',
            );
            const result = await this.locationService.getClosestMarkersInRange(
                environment.treesNearYouRange,
            );
            console.log(
                '[home.page][ionViewWillEnter] Obtained closeMarkersLst',
            );
            this.closeMarkersLst = result.closeMarkers;
            console.log(
                '[home.page][ionViewWillEnter] this.closeMarkersLst:',
                this.closeMarkersLst,
            );
        }
        this.isLoading = false;
    }

    goToEntOnMap(entId: string) {
        this.router.navigate(
            ['/tabs/map'],
            { queryParams: { entId: entId } }
        );
    }

    async reloadGoogleMapsApi() {
        console.log('Reloading reloadGoogleMapsApi');
        // await this.locationService.waitForGoogleMapsApi()
        const loader = new Loader({
            apiKey: 'AIzaSyDH8wba6-GanXas_Yp0c13G88UkC2aBbOc',
            libraries: ['maps', 'geometry', 'geocoding'],
        });

        loader
            .load()
            .then(async () => {
                console.log('LOADED GOOGLE MAPS API');
            })
            .catch((error) => {
                console.log('RELOAD GOOGLE MAPS API error:', error);
            });
        console.log('Reloading Finished reloadGoogleMapsApi');
    }

    async getUserReportStats() {
        this.userReportsCount = 0;
        this.userProofOfLifeCount = 0;

        try {
            const user = this.userService.getCurrentUser();
            if (!user || !user.id) {
                throw new Error('User not found or user ID is missing.');
            }

            const reports = await this.reportService
                .getReports(user.id)
                .toPromise();
            console.log('[home.page] getUserReportStats reports:', reports);

            if (!reports || reports.length === 0) return;

            reports.forEach((report) => {
                if (report.type_id === 1) this.userReportsCount++;
                else if (report.type_id === 2) this.userProofOfLifeCount++;
            });
        } catch (err) {
            console.log('[home.page] getUserReportStats err:', err);
            throw err;
        }
    }

    formatDistance(num: number) {
        if (num === 0) return '0 m';
        if (num < 1000) {
            return `${num.toFixed(1)} m`;
        } else {
            return `${(num / 1000).toFixed(1)} km`;
        }
    }
}

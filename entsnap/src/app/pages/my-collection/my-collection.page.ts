import { Component, OnInit, ViewChild } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { ReportService } from 'src/app/services/report.service';
import { IonModal } from '@ionic/angular';

import { Platform } from '@ionic/angular';
import { MultiLanguageService } from 'src/app/services/multi-language.service';
@Component({
    selector: 'app-my-collection',
    templateUrl: './my-collection.page.html',
    styleUrls: ['./my-collection.page.scss'],
})
export class MyCollectionPage implements OnInit {
    constructor(
        private userService: UserService,
        private reportService: ReportService,
        public platform: Platform,
        private multiLanguageService: MultiLanguageService
    ) {}

    reports: any[] = [];
    proofOfLifes: any[] = [];

    @ViewChild(IonModal) modal!: IonModal;

    ngOnInit() {}

    ionViewWillEnter() {
        this.getUserReports();
    }

    getUserReports(): void {
        this.reports = [];
        this.proofOfLifes = [];
        const user = this.userService.getCurrentUser();
        console.log('user is', user);
        this.reportService.getReports(user.id!).subscribe(
            (data) => {
                data.forEach((report) => {
                    if (report.type_id === 1) this.reports.push(report);
                    else if (report.type_id === 2)
                        this.proofOfLifes.push(report);
                });
                this.reports = this.reports.slice(0, 5);
                this.proofOfLifes = this.proofOfLifes.slice(0, 5);
                console.log(
                    '[my-collection.page.ts] getUserReports, this.reports:',
                    this.reports,
                );
                console.log(
                    '[my-collection.page.ts] getUserReports, this.proofOfLifes:',
                    this.proofOfLifes,
                );
            },
            (error) => {
                console.error('Error obteniendo reportes:', error);
            },
        );
    }

    openActionsModal() {
        this.modal.present();
    }
}

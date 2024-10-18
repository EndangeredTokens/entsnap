import { Component, OnInit, ViewChild } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { ReportService } from 'src/app/services/report.service';
import { AlertController, IonModal } from '@ionic/angular';
import { Router } from '@angular/router';
import { RouteHistoryService } from 'src/app/services/route-history.service';
import { DraftReportService } from 'src/app/services/draft-report.service';
import { reportDraft } from 'src/app/models/inputReport';
import { FileService } from 'src/app/services/file.service';
import { MultiLanguageService } from 'src/app/services/multi-language.service';
import { TranslateService } from '@ngx-translate/core';
import { LocationV2Service } from 'src/app/services/location.v2.service';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/services/auth.service';
@Component({
    selector: 'app-all-reports',
    templateUrl: './all-reports.page.html',
    styleUrls: ['./all-reports.page.scss'],
})
export class AllReportsPage implements OnInit {
    constructor(
        private userService: UserService,
        private reportService: ReportService,
        private router: Router,
        private routeHistoryService: RouteHistoryService,
        private draftReportService: DraftReportService,
        private fileService: FileService,
        private multiLanguageService: MultiLanguageService,
        private translate: TranslateService,
        private locationService: LocationV2Service,
        private alertController: AlertController,
        private authService: AuthService,
        private translateService: TranslateService,
    ) {}

    reports: any[] = [];
    proofOfLifes: any[] = [];

    reportsToIterate: any[] = [];

    titleText: string = 'MY TREES';

    specificPageToGo: string = '/tabs/specific-proof-of-life';

    draftReports: reportDraft[] = [];

    showDrafts: boolean = false;

    isSelectedReportDraft: boolean = false;

    selectedReportDraft!: string;

    @ViewChild(IonModal) modal!: IonModal;

    ngOnInit() {
        this.getUserReports();
    }

    ionViewWillEnter() {
        this.checkUrl();
        this.loadDrafts();
    }

    checkUrl(): void {
        if (this.router.url === '/tabs/my-proof-of-life') {
            this.reportsToIterate = this.proofOfLifes;
            this.translate.get('all_reports.my_proof_of_life').subscribe((res: string) => {
                this.titleText = res;
            });
        } else if (this.router.url === '/tabs/my-trees') {
            this.reportsToIterate = this.reports;
            this.specificPageToGo = '/tabs/tree-page';
            this.showDrafts = true;
            this.translate.get('all_reports.my_trees').subscribe((res: string) => {
                this.titleText = res;
            });
        }
    }

    getUserReports(): void {
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

    openDraftActionsModal(draft: reportDraft) {
        this.selectedReportDraft = draft.name || '';
        this.isSelectedReportDraft = true;
        this.modal.present();
    }

    openActionsModal() {
        this.isSelectedReportDraft = false;
        this.modal.present();
    }

    goBackUrlHistory() {
        const prevUrl =
            this.routeHistoryService.getLoggedInPrevUrl() || '/tabs/home';
        this.router.navigateByUrl(prevUrl);
    }

    async loadDrafts() {
        this.draftReports = [];
        const draftKeysList = this.draftReportService.getDraftKeysList();
        for (let draftKey of draftKeysList) {
            const draft = this.draftReportService.getDraft(draftKey);
            draft.imagePreview = (await this.fileService.loadPicture(
                draft.draftImages[0],
            )).img
            this.draftReports.push(draft);
            console.log("DRAFT: ", draft);
        }
    }

    async getDraftReportImage(draftImageFileName: string) {
        return (await this.fileService.loadPicture(draftImageFileName)).img;
    }

    async redirectToContinueDraft() {
        this.modal.dismiss();

        console.log(this.authService.isOfflineMode());

        if (this.authService.isOfflineMode()) {
            console.log("[all reports page - redirect to continue draft] showing alert");
            const header = this.translateService.instant('all_reports.offline_alert_header');
            const message = this.translateService.instant('all_reports.offline_alert_message');
            const alert = await this.alertController.create({
                header,
                message,
                buttons: [
                    {
                        text: this.translateService.instant('all_reports.offline_alert_button'),
                        handler: () => {
                            this.router.navigate(
                                ['/tabs/my-trees']
                            );
                            alert.dismiss();
                            return false;
                        }
                    }
                ],
                cssClass: 'outdated-version-alert', // reusing an old css class
            });

            await alert.present();

        } else {
            const currentDraftData = this.draftReportService.getDraft(this.selectedReportDraft);
            const lat = currentDraftData.gps_geocoder.latitude;
            const lng = currentDraftData.gps_geocoder.longitude;
            
            const result = await this.locationService.getClosestMarkersInRange(
                environment.proofOfLifeRange,
                lat,
                lng,
            );
            console.log(result);
            
            if (result.closeMarkers.length > 0) {
                console.log("[all reports page - redirectToContinueDraft] show modal");
                const header = this.translateService.instant('all_reports.confirm_alert_header');
                const message = this.translateService.instant('all_reports.confirm_alert_message');
                const alert = await this.alertController.create({
                    header,
                    message,
                    buttons: [
                        {
                            text: this.translateService.instant('all_reports.confirm_alert_button_proof_of_life'),
                            handler: () => {
                                this.router.navigate(
                                    ['/tabs/map-proof-of-life'],
                                    { queryParams: { lat: lat, lng: lng, draftKey: this.selectedReportDraft } }
                                );
                                alert.dismiss();

                                return false;
                            }
                        },
                        {
                            text: this.translateService.instant('all_reports.confirm_alert_button_report'),
                            handler: () => {
                                this.router.navigateByUrl('/tabs/continue-draft/'+this.selectedReportDraft);
                                alert.dismiss();

                                return false;
                            }
                        }
                    ],
                    cssClass: 'outdated-version-alert', // reusing an old css class
                });
            
            await alert.present();
            } else {
                console.log("[all reports page - redirectToContinueDraft] redirect to edit draft");
                this.router.navigateByUrl('/tabs/continue-draft/'+this.selectedReportDraft);
            }
        }

        
    }

    deleteDraft() {
        this.modal.dismiss();
        this.draftReportService.removeDraft(this.selectedReportDraft);
        this.router.navigateByUrl('/tabs/my-collection')
    }
}

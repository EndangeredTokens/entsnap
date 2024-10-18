import { Component, OnInit } from '@angular/core';
import { ReportStepsService } from 'src/app/services/report-steps.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ReportValidationService } from 'src/app/services/report-validation.service';
import { LocationV2Service } from 'src/app/services/location.v2.service';
import { ReportService } from 'src/app/services/report.service';
import { RouteHistoryService } from 'src/app/services/route-history.service';
import { MultiLanguageService } from 'src/app/services/multi-language.service';
import { DraftReportService } from 'src/app/services/draft-report.service';
import { FileService } from 'src/app/services/file.service';
@Component({
    selector: 'app-confirm-ent-photos',
    templateUrl: './confirm-ent-photos.component.html',
    styleUrls: ['./confirm-ent-photos.component.scss'],
})
export class ConfirmEntPhotosComponent implements OnInit {
    constructor(
        private reportStepsService: ReportStepsService,
        private router: Router,
        private route: ActivatedRoute,
        private reportValidationService: ReportValidationService,
        private locationService: LocationV2Service,
        private reportService: ReportService,
        private routeHistoryService: RouteHistoryService,
        private multiLanguageService: MultiLanguageService,
        private activatedRoute: ActivatedRoute,
        private draftReportService: DraftReportService,
        private fileService: FileService,
    ) {}

    entIdToValidate: any;
    selectedImageStepName: string = 'frontal';
    draftKey: string | undefined;

    allowProofOfLifeSubmit: boolean = false;

    frontal: string | undefined;
    leaf: string | undefined;
    trunk: string | undefined;
    scale: string | undefined;

    stepsDict = {
        "frontal": 0,
        "leaf": 1,
        "trunk": 2,
        "scale": 3,
    }

    ngOnInit() {
        this.entIdToValidate = this.route.snapshot.paramMap.get('id');
        this.draftKey = this.activatedRoute.snapshot.queryParams['draftKey'];

        this.getEntImage('frontal').then(
            (data) => {
                if (data) {
                    console.log(data);
                    this.frontal = data.img;
                    if (this.frontal) {
                        localStorage.setItem('frontal', JSON.stringify(data));
                    } else {
                        localStorage.removeItem('frontal');
                    }
                }
                
            }
        );

        this.getEntImage('leaf').then(
            (data) => {
                if (data) {
                    this.leaf = data.img;
                    if (this.leaf) {
                        localStorage.setItem('leaf', JSON.stringify(data));
                    } else {
                        localStorage.removeItem('leaf');
                    }
                }
            }
        );

        this.getEntImage('trunk').then(
            (data) => {
                if (data) {
                    this.trunk = data.img;
                    if (this.trunk) {
                        localStorage.setItem('trunk', JSON.stringify(data));
                    } else {
                        localStorage.removeItem('trunk');
                    }
                }
                
            }
        );

        this.getEntImage('scale').then(
            (data) => {
                if (data) {
                    this.scale = data.img;
                    if (this.scale) {
                        localStorage.setItem('scale', JSON.stringify(data));
                    } else {
                        localStorage.removeItem('scale');
                    }
                }
            }
        );

        
    }

    ionViewWillEnter() {
        // console.log("ENTRO A CONFIRM ENT PHOTO")
        // console.log("Setting report position")
        this.setReportPosition();
        console.log(this.frontal, this.leaf, this.trunk, this.scale);
    }

    setSelectedImageStepName(stepName: string) {
        this.selectedImageStepName = stepName;
        console.log(
            'setSelectedImageStepName, this.selectedImageStepName:',
            this.selectedImageStepName,
        );
    }

    getSelectedImage() {
        if (this.selectedImageStepName == 'frontal') return this.frontal;
        else if (this.selectedImageStepName == 'leaf') return this.leaf;
        else if (this.selectedImageStepName == 'trunk') return this.trunk;
        else return this.scale;
    }

    async setReportPosition(): Promise<void> {
        await this.locationService.updatePosition().then(() => {
            this.reportStepsService.setReportLatLon([
                this.locationService.position.coords.latitude,
                this.locationService.position.coords.longitude,
            ]);
            this.reportStepsService.setReportAddress(
                this.locationService.address,
            );
            // this.report = this.reportStepsService.getPreview()!
        });
    }

    // retrySpecificStep(step: number) {
    //     this.reportStepsService.retrySpecificStep(step);
    //     this.router.navigateByUrl(
    //         `tabs/validate/${this.reportStepsService.getPreview()?.report_id}`,
    //     );
    // }

    retrySpecificStep() {
        // Define a mapping of image keys to their corresponding integer values
        const imageKeyMap: { [key: string]: number } = {
            frontal: 0,
            leaf: 1,
            trunk: 2,
            scale: 3,
        };

        // Retrieve the integer value based on the imageKey
        const step = imageKeyMap[this.selectedImageStepName];

        if (step !== undefined) {
            // Call the service method with the step value
            this.reportStepsService.retrySpecificStep(step);
            // Navigate to the desired URL
            this.router.navigateByUrl(
                `tabs/validate/${this.reportStepsService.proofOfLifeReportId}`,
            );
        } else {
            console.error('Invalid imageKey:', this.selectedImageStepName);
            // Handle invalid imageKey if needed
        }
    }

    goToValidateSuccessful() {
        this.submitValidation();
        // this.router.navigateByUrl("/tabs/profile")
    }

    getLocalStorageItem(key: string): string {
        return localStorage.getItem(key)!;
    }

    getStepLocalStorageKey(step: number): string {
        return this.reportStepsService.getStepLocalStorageKey(step);
    }

    async getEntImage(imageName: string) {
        if (this.draftKey) {
            console.log("[Confirm ent photos - getEntImage] Draft key detected");
            const draftReport = this.draftReportService.getDraft(this.draftKey); 
            console.log(draftReport);
            const step = this.stepsDict[imageName as keyof typeof this.stepsDict];
            //console.log(step);
            if (!draftReport.draftImages[step]) return undefined;
            const img = await this.fileService.loadPicture(draftReport.draftImages[step]);
            console.log(step);
            return img;
        } else {
            if (!this.getLocalStorageItem(imageName)) return undefined;
            return JSON.parse(this.getLocalStorageItem(imageName));
        }
    }

    async checkAllowProofOfLife() {
        this.reportService.checkProofOfLifeTimer(this.entIdToValidate).subscribe({
            next: (response: any) => {
                console.log("[submitValidation] response:", response)
                if (response.timer == 0) {
                    this.allowProofOfLifeSubmit = true;
                    console.log("[submitValidation] Proof of Life is now allowed");
                }

                if (!this.allowProofOfLifeSubmit) {
                    console.log("[confirm-ent-photos submitValidation] Proof of Life submit is not allowed")
                    this.router.navigateByUrl('/tabs/map');
                    return
                }
            },
            error: (err) => {
                console.log('error:', err);
                this.allowProofOfLifeSubmit = false;
            }
        })
    }

    async submitValidation() {

        this.checkAllowProofOfLife().then(
            async () => {
                const { allUploaded, imageIds } = await this.reportStepsService.uploadImagesV3();

                if (allUploaded) {
                    this.reportStepsService.updateStoredReportImages(imageIds);
                    const inputProofOfLife = this.reportStepsService.getStoredReport();
                    const parentReportId = this.entIdToValidate;

                    inputProofOfLife.parent_report_id = Number(parentReportId);
                    console.log(
                        '[confirm-ent-photos] submitValidation, input report:',
                        this.reportStepsService.getStoredReport(),
                    );

                    this.reportService
                        .submitProofOfLife(inputProofOfLife)
                        .subscribe({
                            next: (result: any) => {
                                console.log('result: ', result);
                                this.reportStepsService.resetSteps();
                                this.router.navigateByUrl('/tabs/form-submitted/proof-of-life/'+result.data.id);
                            },
                            error: (e) =>
                                console.log('failed to add proof of life, err:', e),
                            complete: () => console.log('complete'),
                        });
                }
                this.reportStepsService.skip = false;
            }
        )

        
    }

    goBackUrlHistory() {
        const prevUrl =
            this.routeHistoryService.getLoggedInPrevUrl() || '/tabs/home';
        this.router.navigateByUrl(prevUrl);
    }
}

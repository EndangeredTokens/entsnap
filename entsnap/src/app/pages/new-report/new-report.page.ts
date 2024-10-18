import {
    ViewChild,
    Component,
    OnInit,
    OnDestroy,
    NgZone,
    ViewChildren,
} from '@angular/core';
import { ReportService } from 'src/app/services/report.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { ImageService } from 'src/app/services/image.service';
import { Base64Img } from 'src/app/models/base64img';
import { AlertController } from '@ionic/angular';
import { Observable, Subscription, interval, timestamp } from 'rxjs';
import { ReportStepsService } from 'src/app/services/report-steps.service';
import { LoadingService } from 'src/app/services/loading.service';
import { CameraOverlayService } from 'src/app/services/camera-overlay.service';
import { LocationV2Service } from 'src/app/services/location.v2.service';
import { Position } from '@capacitor/geolocation';
import { ConfirmEntPhotosComponent } from 'src/app/components/confirm-ent-photos/confirm-ent-photos.component';
import { environment } from 'src/environments/environment';
import { RouteHistoryService } from 'src/app/services/route-history.service';
import { IonAlert } from '@ionic/angular';
import { MultiLanguageService } from 'src/app/services/multi-language.service';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
@Component({
    selector: 'app-new-report',
    templateUrl: './new-report.page.html',
    styleUrls: ['./new-report.page.scss'],
})
export class NewReportPage implements OnInit, OnDestroy {
    public alertButtons = [
        {
            text: '',
            cssClass: 'alert-button-cancel',
            handler: () => {
                console.log('reset and leave');
                console.log(
                    'localstorage variable nextUrlAfterLeave',
                    localStorage.getItem('nextUrlAfterLeave'),
                );
                this.reportSteps.resetSteps();
                this.reportSteps.deactivateTriggerAlertFlag();
            },
        },
        {
            text: '',
            cssClass: 'alert-button-confirm',
            handler: () => {
                console.log('continue editing');
                console.log(
                    'localstorage variable nextUrlAfterLeave',
                    localStorage.getItem('nextUrlAfterLeave'),
                );
                this.reportSteps.deactivateTriggerAlertFlag();
                // for some reason this produce troubles!!
                // if (this.reportSteps.isLastStep() && this.reportSteps.isCurrentStepCaptured()){
                //   this.finishPhotoSteps()
                // }
            },
        },
    ];

    alertGoBackButtons = [
        {   
           
            text: '',
            cssClass: 'alert-button-cancel',
        },
        {
            text: '',
            cssClass: 'alert-button-confirm',
            handler: () => {
                this.goBackUrlHistory();
            },
        },
    ];

    topLeftFrame: string = '../../../assets/camera/top-left-frame.svg';
    topRightFrame: string = '../../../assets/camera/top-right-frame.svg';
    bottomLeftFrame: string = '../../../assets/camera/bottom-left-frame.svg';
    bottomRightFrame: string = '../../../assets/camera/bottom-right-frame.svg';
    takePictureIcon: string = '../../../assets/camera/button.svg';
    backIcon = '../../../assets/icon/back_button.svg';

    isCameraActive: boolean = false;
    currentStep: number = 0;
    reportSaved: boolean = false;
    reportPosition?: Position;
    private subscription: Subscription | undefined;
    captureRelatedData: string[] = [];

    isValidate: boolean = false;
    entIdToValidate: any;

    retrySubscription?: Subscription;
    specificStepToRetry?: number;

    disableCaptureImageButton: boolean = false;

    // allowReportWithIntersection: boolean = false;

    markersIntersectionsLst: { marker: any; distance: number }[] = [];

    @ViewChild(ConfirmEntPhotosComponent)
    confirmEntPhotosComponent?: ConfirmEntPhotosComponent;

    headerTitle: string = 'new_report.title';

    @ViewChild('alertLeave') alertLeave!: IonAlert;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private imageService: ImageService,
        private reportSteps: ReportStepsService,
        private loadingService: LoadingService,
        private cameraOverlayService: CameraOverlayService,
        private locationService: LocationV2Service,
        private ngZone: NgZone,
        private routeHistoryService: RouteHistoryService,
        private multiLanguageService: MultiLanguageService,
        private translate: TranslateService
        // private confirmEntPhotosComponent: ConfirmEntPhotosComponent,
    ) {}

    shouldTriggerAlert() {
        // console.log("SHOULD TRIGGER ALERT? ", this.reportSteps.shouldTriggerAlert())
        return this.reportSteps.shouldTriggerAlert();
    }

    async ngOnInit() {
        // await this.locationService.initMap("map", true, false).then(() => {
        // })
        this.isValidate = this.route.snapshot.data['isValidate'];
        if (this.isValidate) this.headerTitle = this.translate.instant('new_report.PROOF_OF_LIFE');
        // if (this.isValidate === true) {
        //   this.reportSteps.skip = true
        // } else {
        this.reportSteps.skip = false;
        // }
        this.reportSteps.initializePreview();
        // this.reportSteps.resetSteps()
        
        // this.retrySubscription = this.reportSteps.specificStepRetryEvent.subscribe(step => {
        // console.log("funcoina el subscription")
        // this.specificStepToRetry = step
        // })
    }

    async ionViewWillEnter() {
        console.log('obteniendo markers');
        // await this.locationService.getMapMarkers(this.locationService.position.coords.latitude, this.locationService.position.coords.longitude)
        // Obtain markers that conflict with current user position
        this.alertButtons[0].text = await firstValueFrom(this.translate.get('new_report.reset'));
        this.alertButtons[1].text = await firstValueFrom(this.translate.get('new_report.confirm'));

        this.alertGoBackButtons[0].text = await firstValueFrom(this.translate.get('new_report.continue'));
        this.alertGoBackButtons[1].text = await firstValueFrom(this.translate.get('new_report.exit'));
        const result =
            await this.locationService.getClosestMarkersInRange(1000);
        this.markersIntersectionsLst = result.intersectingMarkers;

        // console.log(this.confirmEntPhotosComponent)
        console.log('will enter');
        console.log('this.specificStepToRetry', this.specificStepToRetry);

        // Update every second
        const source: Observable<number> = interval(1000);

        // Subscribe to the observable and update counter
        // console.log('start subscription to update captureRelatedData');
        this.subscription = source.subscribe(() => {
            const coords = this.locationService.position.coords;
            if (
                this.reportSteps.currentStep == 0 &&
                !this.reportSteps.isCurrentStepCaptured()
            ) {
                this.reportPosition = undefined;
            }
            let iou = 1;
            let dist = 0;
            if (this.reportPosition) {
                iou = this.locationService.twoPositionsIoU(
                    this.reportPosition!,
                    this.locationService.position,
                );
                dist = this.locationService.twoPositionsDistance(
                    this.reportPosition,
                    this.locationService.position,
                );
            }
            let newCaptureRelatedData: string[] = [];
            newCaptureRelatedData.push(new Date().toLocaleString());
            // newCaptureRelatedData.push(`heading: ${coords.heading}`)
            newCaptureRelatedData.push(
                `${coords.latitude}, ${coords.longitude} (± ${Math.floor(coords.accuracy)} m)`,
            );
            // newCaptureRelatedData.push(this.reportSteps.getReportAddress())
            // newCaptureRelatedData.push(`IoU: ${Math.round(iou * 100) / 100} | dist: ${dist}`)
            // update the data
            // console.log(
            // 'update capture related data to',
            // newCaptureRelatedData,
            // );
            this.captureRelatedData = newCaptureRelatedData;
        });
    }

    ionViewWillLeave() {
        console.log('will leave');
        if (this.subscription) {
            console.log('stop subscription');
            this.subscription.unsubscribe();
        }
    }

    async ionViewDidEnter() {
        this.entIdToValidate = +this.route.snapshot.paramMap.get('id')!;
        await this.cameraOverlayService.startCamera(); // try to start the camera if is not already running
        console.log('Entro a tomar nuevo reporte');
        console.log('Puede validar:', this.isValidate, this.entIdToValidate);
    }

    async ngOnDestroy() {
        console.log('ngOnDestroy');
        await this.cameraOverlayService.stopCamera();
        // this.reportSteps.resetSteps()
    }

    async finishPhotoSteps() {
        // this.allowReportWithIntersection = false
        await this.cameraOverlayService.stopCamera();
        // const type = +this.route.snapshot.paramMap.get('id')!;
        // this.reportSteps.setReportType(type)
        if (this.isValidate) {
            this.reportSteps.setReportIdToProof(this.entIdToValidate);
            // this.reportSteps.setReportIdToProof(266)
        }
        this.reportSteps.previewToCache();
        if (this.isValidate === true) {
            this.router.navigateByUrl(`/tabs/confirm/${this.entIdToValidate}`)
        } else {
            this.router.navigateByUrl('/tabs/register-tree-input');
        }
    }

    async previousStep() {
        if (this.reportSteps.isFirstStep()) return;
        this.reportSteps.previousStep();

        if (this.isCameraActive && this.reportSteps.isCurrentStepCaptured()) {
            await this.cameraOverlayService.stopCamera();
        }
    }

    async nextStep() {
        console.log('nextstep, skip', this.reportSteps.skip);
        if (this.reportSteps.isLastStep() || this.reportSteps.skip) {
            await this.finishPhotoSteps();
            return;
        }
        this.reportSteps.nextStep();

        if (!this.isCameraActive && !this.reportSteps.isCurrentStepCaptured()) {
            await this.cameraOverlayService.startCamera();
        }
    }

    isFirstStep(): boolean {
        return this.reportSteps.isFirstStep();
    }

    getCurrentStep(): number {
        return this.reportSteps.getCurrentStep();
    }

    isCurrentStepCaptured(): boolean {
        return this.reportSteps.isCurrentStepCaptured();
    }

    getCurrentStepImage(): string {
        // return this.reportSteps.getCurrentStepImage()
        const localStorageKey = this.reportSteps.getStepLocalStorageKey(
            this.reportSteps.getCurrentStep(),
        );
        const image = JSON.parse(localStorage.getItem(localStorageKey)!);
        if (!image) {
            return '';
        }
        return image.img;
    }

    getCurrentStepTitle(): string {
        return this.reportSteps.getCurrentStepTitle();
    }

    getCurrentStepIcon(): string {
        return this.reportSteps.getCurrentStepIcon();
    }

    getCurrentStepText(): string {
        return this.reportSteps.getCurrentStepText();
    }

    getCurrentStepNumber(): number {
        return this.reportSteps.getCurrentStepNumber();
    }

    async captureImage() {
        console.log('Hola');
        this.disableCaptureImageButton = true;
        // accuracy checker
        const acc = this.locationService.position.coords.accuracy;
        if (acc > environment.accuracyTolerance) {
            console.log(
                '[captureImage] cannot capture. GPS accuracy is too wide',
            );
            alert(
                `GPS accuracy (${acc}) is too wide, reposition and try again!!`,
            );
            this.disableCaptureImageButton = false;
            return;
        }
        // console.log("Existe ent cercano con interseccion:",await this.locationService.checkClosestMarkerIntersection())
        console.log('Intersecting markers list:', this.markersIntersectionsLst);
        this.markersIntersectionsLst = [];
        if (this.markersIntersectionsLst.length > 0 && !this.isValidate) {
            // if (!this.allowReportWithIntersection) {
            this.loadingService.showNotificationReportIntersection();
            // }
            // this.allowReportWithIntersection = true
            // alert("Ent report exists too close to create a new report!")
            // return
        } else if (this.reportPosition) {
            //dist checker
            const dist = this.locationService.twoPositionsDistance(
                this.reportPosition,
                this.locationService.position,
            );
            if (dist > 10) {
                console.log(
                    '[captureImage] cannot capture. Distance is higher than 10 m',
                );
                alert(
                    `distance ${dist} is higher than 10m, please reposition and try again!`,
                );
            }

            // iou checker
            // const iou = this.locationService.twoPositionsIoU(this.reportPosition, this.locationService.position)
            // if (iou <= 0.5){// for now we will use a hardcoded condition of ioU > 0.5
            //   console.log("[captureImage] cannot capture image, IoU lower than threshold", iou)
            //   alert("GPS moved!! cannot capture image, please reposition yourself and try again!")
            //   return
        }
        const base64Image = await this.cameraOverlayService.captureImage();
        this.disableCaptureImageButton = false;
        if (base64Image) {
            const lat = this.locationService.position.coords.latitude;
            const lng = this.locationService.position.coords.longitude;
            const date = Date.now();
            this.reportSteps.captureStep(base64Image, lat, lng, date);
            if (this.reportSteps.currentStep === 0) {
                console.log('[captureImage] set the initial position');
                this.reportPosition = this.locationService.position;
            }
        }
    }

    async retryImage() {
        this.reportSteps.retryStep();
        await this.cameraOverlayService.startCamera();
    }

    // async retrySpecificImage(step: number) {
    //   // console.log(this.confirmEntPhotosComponent?.getRetryStep())
    //   // console.log(this.confirmEntPhotosComponent?.retryStep)
    //   await this.cameraOverlayService.stopCamera()
    //   console.log("REINTENTANDO IMAGEN:", step)
    //   this.reportSteps.retrySpecificStep(step)
    //   await this.cameraOverlayService.startCamera()
    //   this.reportSteps.photoSteps[step].isImageCaptured = true
    //   if (this.reportSteps.photoSteps[step].isImageCaptured === true) {
    //     console.log("RETRY TOMADO")
    //     this.reportSteps.currentStep = 3
    //     this.reportSteps.photoSteps[3].isImageCaptured = true
    //     this.router.navigateByUrl("/tabs/confirm")
    //   }
    // }

    displayData(): any {
        let iou = 1;
        if (this.reportPosition) {
            iou = this.locationService.twoPositionsIoU(
                this.reportPosition!,
                this.locationService.position,
            );
        }

        return {
            lat: this.locationService.position.coords.latitude,
            lon: this.locationService.position.coords.longitude,
            acc: Math.floor(this.locationService.position.coords.accuracy),
            dir: this.locationService.position.coords.heading,
            date: new Date().toLocaleString(),
            addr: this.reportSteps.getReportAddress(),
            iou: iou,
        };
    }

    goBackUrlHistory() {
        this.router.navigateByUrl(this.routeHistoryService.getLoggedInPrevUrl());
    }

    presentAbandonReportAlert() {
        this.alertLeave.present()
    }
}

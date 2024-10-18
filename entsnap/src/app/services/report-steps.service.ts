import {
    HttpClient,
    HttpHeaders,
    HttpRequest,
    HttpResponse,
} from '@angular/common/http';
import { Injectable, EventEmitter } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { Report } from '../models/report';
import { catchError, map, retry, tap } from 'rxjs/operators';
import { UserService } from './user.service';
import { User } from '../models/user';
import { routes } from './routes';
import { ImageService } from './image.service';
import { ReportService } from './report.service';
import { Address } from '../models/address';
import { LoadingService } from './loading.service';
import { TreeDetection } from '../models/treeDetection';
// import { DraftReportService } from './draft-report.service';
import { GeneralUtilityService } from './general-utility.service';
import { AuthService } from './auth.service';
import { FileService } from './file.service';
import { ReportImage } from '../models/report';
import { Router } from '@angular/router';
import { CameraOverlayService } from './camera-overlay.service';
import { AddressV2 } from '../models/addressV2';
import { inputReport } from '../models/inputReport';
import { GpsGeocoder } from '../models/gpsGeocoder';
import { ReportData } from '../models/reportData';
import { Base64Img } from '../models/base64img';

@Injectable({
    providedIn: 'root',
})
export class ReportStepsService {
    photoSteps = [
        {
            title: 'frontal',
            isImageCaptured: false,
            reportColName: 'frontal_image',
            image: '',
            localStorage: 'frontal_storage',
            localStorageRandom: '',
            icon: '../../assets/icon/example_frontal.svg',
            text: '../../assets/icon/FRONTAL.svg',
            type_id: 4,
        },
        {
            title: 'leaf',
            isImageCaptured: false,
            reportColName: 'leaf_image',
            image: '',
            localStorage: 'leaf_storage',
            localStorageRandom: '',
            icon: '../../assets/icon/example_leaf.svg',
            text: '../../assets/icon/LEAF.svg',
            type_id: 3,
        },
        {
            title: 'trunk',
            isImageCaptured: false,
            reportColName: 'trunk_image',
            image: '',
            localStorage: 'trunk_storage',
            localStorageRandom: '',
            icon: '../../assets/icon/example_trunk.svg',
            text: '../../assets/icon/TRUNK.svg',
            type_id: 1,
        },
        {
            title: 'scale',
            isImageCaptured: false,
            reportColName: 'scale_image',
            image: '',
            localStorage: 'scale_storage',
            localStorageRandom: '',
            icon: '../../assets/icon/example_scale.png',
            text: '../../assets/icon/SCALE.svg',
            type_id: 2,
        },
    ];

    storedReport: inputReport = this.report.intializeReport();

    proofOfLifeReportId!: number;

    reportInfoStep = {
        stage_id: 0,
        foliage_id: 0,
        treeType: '',
        trunkDiameter: 123,
        description: '',
        poem: '',
    };
    currentStep: number = 0;
    skip: boolean = false;

    triggerAlert: boolean = false;
    preview?: Report;

    formData = {
        stage_id: 0,
        foliage_id: 0,
        treeType: '',
        trunkDiameter: 123,
        description: '',
        poem: '',
    };

    constructor(
        private report: ReportService,
        private imageService: ImageService,
        private loadingService: LoadingService,
        // private draftReportService: DraftReportService,
        private generalUtilityService: GeneralUtilityService,
        private authService: AuthService,
        private router: Router,
        private cameraOverlayService: CameraOverlayService,
        private fileService: FileService,
    ) {}

    updateStoredReportGpsGeocoder(gpsGeocoderData: GpsGeocoder) {
        console.log('[updateStoredReportGpsGeocoder] input:', gpsGeocoderData);
        // Remove blank values
        const filteredData: GpsGeocoder = Object.fromEntries(
            Object.entries(gpsGeocoderData).filter(
                ([_, value]) =>
                    value !== null && value !== undefined && value !== '',
            ),
        );
        // console.log(
        //     '[updateStoredReportGpsGeocoder] filteredData:',
        //     filteredData,
        // );

        // Merge new gps geocoder values into existing gps geovoder values
        this.storedReport.gps_geocoder = {
            ...this.storedReport.gps_geocoder,
            ...filteredData,
        };

        // console.log(
        //     '[updateStoredReportGpsGeocoder] this.storedReport:',
        //     this.storedReport,
        // );
    }

    updateStoredReportData(reportData: ReportData) {
        // console.log('[updateStoredReportData] input:', reportData);
        // Remove blank values
        console.log('[reportsteps.service - updateStoredReportData], reportdata:', reportData)
        const filteredData: ReportData = Object.fromEntries(
            Object.entries(reportData).filter(
                ([_, value]) =>
                    value !== null && value !== undefined && value !== '',
            ),
        );
        // console.log('[updateStoredReportData] filteredData:', filteredData);

        // Merge new report data values into existing report data values
        this.storedReport.report_data = {
            ...this.storedReport.report_data,
            ...filteredData,
        };

        // console.log(
        //     '[updateStoredReportData] this.storedReport:',
        //     this.storedReport,
        // );
    }

    updateStoredReportImages(imageIds: number[]) {
        this.storedReport.image_ids = imageIds;
    }

    setProofOfLIfeReportId(reportId: number) {
        this.proofOfLifeReportId = reportId;
    }

    getStoredReport() {
        if (!this.storedReport)
            this.storedReport = this.report.intializeReport();
        return this.storedReport;
    }

    activateTriggerAlertFlag(): void {
        this.triggerAlert = true;
        localStorage.setItem('triggerAlert', 'true');
    }

    deactivateTriggerAlertFlag(): void {
        this.triggerAlert = false;
        localStorage.setItem('triggerAlert', 'false');
    }

    shouldTriggerAlert(): boolean {
        // return localStorage.getItem("triggerAlert") === "true"
        return this.triggerAlert;
    }

    nextStep(skip?: boolean) {
        if (skip) {
            this.currentStep = 3;
        }
        if (this.currentStep === this.photoSteps.length - 1) {
            return;
        }
        this.currentStep++;

        // localStorage.setItem("reportImageStep", this.currentStep.toString())
    }

    previousStep() {
        if (this.currentStep === 0) return;
        this.currentStep--;
    }

    getCurrentStep(): number {
        return this.currentStep;
    }

    resetSteps(
        isDraft?: boolean,
        draftKey?: any,
        isProofOfLife?: boolean,
    ): void {
        let offlineMode = this.authService.offlineMode;
        console.log('RESETSTEPS, OFFLINE MODE:', offlineMode);
        for (let step of this.photoSteps) {
            step.isImageCaptured = false;
            step.image = '';
            // if (!offlineMode) {
            localStorage.removeItem(step.localStorage);
            // }
            localStorage.removeItem(step.localStorageRandom);
            localStorage.removeItem(step.title);
        }
        this.currentStep = 0;
        this.skip = false;
        this.storedReport = this.report.intializeReport();
        this.deactivateTriggerAlertFlag();
        localStorage.removeItem('report');
        if (isDraft) {
            localStorage.removeItem(draftKey);
        }
        // localStorage.setItem("reportImageStep", this.currentStep.toString())
    }

    isFirstStep(): boolean {
        return this.currentStep === 0;
    }

    captureStep(base64Image: string, lat: number, lng: number, date: number): string {
        // const storageImageKey = this.photoSteps[this.currentStep].title + this.generalUtilityService.generateRandomInteger()
        const storageImageKey = this.photoSteps[this.currentStep].title;
        const data = {
            img: base64Image,
            lat: lat,
            lng: lng,
            date: date,
        }
        localStorage.setItem(storageImageKey, JSON.stringify(data));
        // this.draftReportService.addImageKeyToList(storageImageKey)
        this.photoSteps[this.currentStep].isImageCaptured = true;
        this.photoSteps[this.currentStep].localStorage = storageImageKey;
        return this.photoSteps[this.currentStep].title;
    }

    retryStep(): void {
        this.photoSteps[this.currentStep].isImageCaptured = false;
    }

    setSpecificStep(step: number): void {
        this.currentStep = step;
    }

    retrySpecificStep(step: number): void {
        console.log('[retrySpecificStep] @step:', step);
        this.currentStep = step;
        console.log('[retrySpecificStep] this.currentStep:', this.currentStep);
        this.skip = true;
        console.log('retry specific step skip,', this.skip);
        this.photoSteps[this.currentStep].isImageCaptured = false;
        // if (this.photoSteps[this.currentStep].isImageCaptured === true) {
        //   this.router.navigateByUrl("tabs/confirm")
        // }
    }

    isCurrentStepCaptured(): boolean {
        return this.photoSteps[this.currentStep].isImageCaptured;
    }

    getCurrentStepImage(): string {
        return this.photoSteps[this.currentStep].image;
    }

    getCurrentStepTitle(): string {
        return this.photoSteps[this.currentStep].title;
    }

    getCurrentStepIcon(): string {
        return this.photoSteps[this.currentStep].icon;
    }

    getCurrentStepText(): string {
        return this.photoSteps[this.currentStep].text;
    }

    getCurrentStepNumber(): number {
        return this.currentStep;
    }

    isLastStep(): boolean {
        console.log(
            'isLastStep:',
            this.currentStep,
            this.photoSteps.length - 1,
        );
        return this.currentStep === this.photoSteps.length - 1;
    }

    checkCanLeaveReportTreePreview(nextUrl: string): boolean {
        return (
            (this.getCurrentStep() === 0 && !this.isCurrentStepCaptured()) ||
            nextUrl === '/tabs/tree'
        );
    }

    checkCanActivate(prevUrl: string): boolean {
        return (
            (this.getCurrentStep() !== 0 || this.isCurrentStepCaptured()) &&
            ['/tabs/tree', '/tabs/preview'].includes(prevUrl)
        );
    }

    checkCanLeaveReportTreeImage(nextUrl: string): boolean {
        return (
            (this.getCurrentStep() === 0 && !this.isCurrentStepCaptured()) ||
            nextUrl === '/tabs/preview'
        );
    }

    canCapture(): boolean {
        return this.photoSteps[this.currentStep].title !== 'preview';
    }

    initializePreview(): void {
        this.preview = this.report.generateEmptyReport();
    }

    previewIsInitialized(): boolean {
        return this.preview !== undefined;
    }

    getPreview(): Report | undefined {
        return this.preview;
    }

    completeReportImages(): void {
        if (!this.previewIsInitialized()) return;

        this.preview!.frontal_image = this.photoSteps[0].image;
        this.preview!.leaf_image = this.photoSteps[1].image;
        this.preview!.trunk_image = this.photoSteps[2].image;
        this.preview!.scale_image = this.photoSteps[3].image;
    }

    async addLocalHostImagesToDraftReport() {
        // Generate random keys for localStorage images
        const images = [
            ReportImage.FRONTAL_IMAGE,
            ReportImage.LEAF_IMAGE,
            ReportImage.TRUNK_IMAGE,
            ReportImage.SCALE_IMAGE,
        ];
        const idxs = [0, 1, 2, 3];
        for (let i of idxs) {
            let draftImgKey =
                images[i] +
                this.generalUtilityService.generateRandomInteger() +
                '.jpg';
            let data = localStorage.getItem(this.photoSteps[i].localStorage)!;
            this.preview![images[i]] = await this.fileService.savePicture(
                data,
                draftImgKey,
            );
        }

        //   let draftFrontalImageKey = "frontal_image" + this.generalUtilityService.generateRandomInteger() + ".jpg"
        //   let draftLeafImageKey = "leaf_image" + this.generalUtilityService.generateRandomInteger() + ".jpg"
        //   let draftTrunkImageKey = "trunk_image" + this.generalUtilityService.generateRandomInteger() + ".jpg"
        //   let draftScaleImageKey = "scale_image" + this.generalUtilityService.generateRandomInteger() + ".jpg"

        //   let frontData = localStorage.getItem(this.photoSteps[0].localStorage)!
        //   let leaftData = localStorage.getItem(this.photoSteps[1].localStorage)!
        //   let trunkData = localStorage.getItem(this.photoSteps[2].localStorage)!
        //   let scaleData = localStorage.getItem(this.photoSteps[3].localStorage)!

        // create files too
        //   this.preview!.frontal_image = await this.fileService.savePicture(frontData, draftFrontalImageKey)
        //   this.preview!.leaf_image = await this.fileService.savePicture(leaftData, draftLeafImageKey)
        //   this.preview!.trunk_image = await this.fileService.savePicture(trunkData, draftTrunkImageKey)
        //   this.preview!.scale_image = await this.fileService.savePicture(scaleData, draftScaleImageKey)
    }

    async setDraftImages() {
        this.photoSteps[0].localStorageRandom = this.preview!.frontal_image;
        this.photoSteps[1].localStorageRandom = this.preview!.leaf_image;
        this.photoSteps[2].localStorageRandom = this.preview!.trunk_image;
        this.photoSteps[3].localStorageRandom = this.preview!.scale_image;
    }

    updatePreviewWithDraft(draft: any) {
        this.preview = draft;
    }

    async submitDraftImages(): Promise<any> {
        this.setDraftImages();
        let allUploaded = false;
        let imageIds: any = [];
        try {
            const result = await this.uploadImagesV3(true);
            allUploaded = result.allUploaded;
            imageIds = result.imageIds;
            return { allUploaded, imageIds };
        } catch (error) {
            console.log('SubmitDraftImages Error:', error);
        }
        return { allUploaded, imageIds };
    }

    async uploadImages(draft?: boolean): Promise<boolean> {
        let allUploaded = true;
        await this.loadingService.show();
        for (let step of this.photoSteps) {
            let base64Image;
            if (draft) {
                base64Image = await this.fileService.loadPicture(
                    step.localStorageRandom,
                );
            } else {
                base64Image = JSON.parse(localStorage.getItem(step.localStorage)!);
            }
            if (base64Image) {
                // upload
                try {
                    let imageUrl = await this.uploadImage(base64Image.img);
                    imageUrl = this.imageService.addUrl(imageUrl);
                    step.image = imageUrl;
                    console.log(
                        'uploaded ',
                        step.title,
                        'produced url',
                        imageUrl,
                    );
                    console.log('PREVIEW AFTER URL');
                    console.log(this.getPreview());
                } catch (error) {
                    console.error(
                        '[UploadImages] failed to upload, error:',
                        error,
                    );
                    allUploaded = false;
                }
            }
        }
        if (allUploaded) {
            this.completeReportImages();
        }
        await this.loadingService.dismiss();
        return allUploaded;
    }

    async uploadImagesV3(draft: boolean = false): Promise<any> {
        console.log('uploadImagesV3');
        let allUploaded = true;
        await this.loadingService.show();
        const imageIds: number[] = [];
        for (let step of this.photoSteps) {
            let base64Image;
            if (draft) {
                console.log("[report steps service - uploadImagesV3] getting draft metadata...");
                base64Image = await this.fileService.loadPicture(
                    step.localStorageRandom,
                );
                console.log("[report steps service - uploadImagesV3] draft metadata retrieved:", base64Image);
            } else {
                console.log("[report steps service - uploadImagesV3] getting current report metadata...");
                base64Image = JSON.parse(localStorage.getItem(step.title)!);
                console.log(
                    '[uploadImagesV3] step.localStorage:',
                    step.localStorage,
                );
                console.log(
                    '[uploadImagesV3] step.title:',
                    step.title,
                );
                console.log(
                    '[uploadImagesV3] localStorage.getItem(step.localStorage):',
                    localStorage.getItem(step.localStorage),
                );
                console.log('[uploadImagesV3] base64Image:', base64Image);
            }
            if (base64Image) {
                // upload
                try {
                    let imageObject = await this.uploadImageV3(
                        base64Image,
                        step.type_id,
                    );
                    console.log('imageObject:', imageObject);
                    imageIds.push(imageObject.image.id);
                    // console.log("imgaUrl", imageObject.image)
                    // imageUrl = this.imageService.addUrl(imageUrl)
                    // step.image = imageUrl
                    // console.log("uploaded ", step.title, "produced url", imageUrl)
                    console.log('PREVIEW AFTER URL');
                    console.log(this.getPreview());
                } catch (error) {
                    console.error(
                        '[UploadImages] failed to upload, error:',
                        error,
                    );
                    allUploaded = false;
                }
            }
        }
        console.log('UploadImagesV3 return:', allUploaded, imageIds);
        if (allUploaded) {
            this.completeReportImages();
        }
        await this.loadingService.dismiss();
        return { allUploaded, imageIds };
    }

    uploadImage(base64Image: string): Promise<string> {
        return new Promise((resolve, reject) => {
            this.imageService.newUploadImage({ img: base64Image }).subscribe({
                next: (res) => {
                    console.log('Image uploaded', res.filename);
                    resolve(res.filename);
                },
                error: (err) => {
                    console.error('[UploadImage] ERROR', err);
                    reject(err);
                },
            });
        });
    }

    uploadImageV3(base64Image: Base64Img, type_id: number): Promise<any> {
        console.log("[report steps service - uploadImageV3]");
        return new Promise((resolve, reject) => {
            this.imageService
                .newUploadImageV3(base64Image, type_id)
                .subscribe({
                    next: (res: any) => {
                        // console.log('Image uploaded', res.filename);
                        console.log('Image uploaded', res);
                        resolve(res);
                    },
                    error: (err: any) => {
                        console.error('[UploadImage] ERROR', err);
                        reject(err);
                    },
                });
        });
    }

    async identifyTree(draftImageSrc?: string): Promise<TreeDetection[]> {
        let frontal = this.photoSteps[0];
        let base64Image: string | null = '';
        if (!draftImageSrc) base64Image = JSON.parse(localStorage.getItem('frontal')!).img;
        else if (draftImageSrc) base64Image = draftImageSrc

        if (!base64Image) {
            return [];
        }

        return new Promise((resolve, reject) => {
            this.imageService.identifyTree({ img: base64Image! }).subscribe({
                next: (res) => {
                    console.log('Tree identify', res);
                    resolve(res);
                },
                error: (err) => {
                    console.error('[UploadImage] ERROR', err);
                    reject(err);
                },
            });
        });
    }

    setReportType(newType: number): void {
        if (!this.previewIsInitialized()) return;
        this.preview!.type = newType;
    }

    updateReportInfo(formData: any): void {
        console.log('[updateReportInfo] formData', formData);
        this.reportInfoStep = formData;

        if (!this.previewIsInitialized()) return;
        this.preview!.tree_type = formData.tree_type;
        this.preview!.trunk_diameter = formData.trunk_diameter;
        this.preview!.surrounding_desc = formData.surrounding_desc;
        this.preview!.poem = formData.poem;
        this.preview!.stage_id = formData.stage_id;
        this.preview!.foliage_id = formData.foliage_id;
    }

    updateReportDraftCondition(isDraft: boolean) {
        this.preview!.is_draft = isDraft;
    }

    getReportInfo(): any {
        return this.reportInfoStep;
    }

    setReportLatLon(location: number[]) {
        this.preview!.latitude = location[0];
        this.preview!.longitude = location[1];
    }

    setPreviewGpsGeocoderLatLng(location: number[]) {
        console.log('[setPreviewGpsGeocoderLatLng] location input:', location);
        this.preview!.gps_geocoder!.latitude = location[0];
        this.preview!.gps_geocoder!.longitude = location[1];
    }

    setReportAddress(address: Address | undefined) {
        if (!address) return;
        // console.log("Address is: ", address);
        this.preview!.address_type = address!.type;
        this.preview!.address = address!.formatted;
        this.preview!.street_number = address!.number;
        this.preview!.street_name = address!.street;
        this.preview!.city = address!.city;
        this.preview!.province = address!.province;
        this.preview!.county = address!.county;
        this.preview!.country = address!.country;
    }

    setPreviewGpsGeocoderAddress(address: any | undefined) {
        console.log('[setPreviewGpsGeocoderAddress] address input:', address);
        if (!address) return;
        if (this.preview?.gps_geocoder) {
            console.log('this.preview.gps_geocoder exists!');
            this.preview!.gps_geocoder.street_address = address!.street_address;
            this.preview!.gps_geocoder.route = address.route;
            this.preview!.gps_geocoder.locality = address.locality;
            this.preview!.gps_geocoder.country = address.country;
            this.preview!.gps_geocoder.administrative_area_level_1 =
                address.administrative_area_level_1;
            this.preview!.gps_geocoder.administrative_area_level_2 =
                address.administrative_area_level_2;
            this.preview!.gps_geocoder.administrative_area_level_3 =
                address.administrative_area_level_3;
        }
    }

    setPreviewGpsGeocoderAccHead(positionCoords: any) {
        if (!positionCoords) return;
        if (!this.preview?.gps_geocoder) return;
        this.preview!.gps_geocoder.accuracy = positionCoords.accuracy;
        this.preview!.gps_geocoder.heading = positionCoords.heading;
    }

    getReportAddress(): string {
        if (!this.preview || this.authService.offlineMode) return '';
        return `${this.preview.street_name} ${this.preview.street_number}, ${this.preview.city}, ${this.preview.country}`;
    }

    previewToCache() {
        try {
            localStorage.setItem('report', JSON.stringify(this.preview!));
        } catch (error) {
            console.log('[PreviewToCache]  ERROR:', error);
        }
    }

    previewFromCache() {
        try {
            this.preview = JSON.parse(localStorage.getItem('report')!);
        } catch (error) {
            console.log('[PreviewFromCache]  ERROR:', error);
        }
    }

    photoCompleted(): boolean {
        return this.currentStep >= this.photoSteps.length;
    }

    getStepLocalStorageKey(step: number): string {
        return this.photoSteps[step].localStorage;
    }

    submitDraftReport(): Observable<any> {
        return this.report.addReport(this.preview!);
    }

    submitDraftReportV3(
        user_id: number,
        image_ids: any,
        gps_geocoder: any,
        report_data: any,
    ): Observable<any> {
        return this.report.addReportV3(
            user_id,
            image_ids,
            gps_geocoder,
            report_data,
        );
    }

    setReportIdToProof(reportId: any) {
        this.preview!.report_id = reportId;
    }
}

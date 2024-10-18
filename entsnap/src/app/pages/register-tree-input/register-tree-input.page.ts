import { Component, OnInit, ViewChild } from '@angular/core';
import { RouteHistoryService } from 'src/app/services/route-history.service';
import { Router } from '@angular/router';
import { Report } from '../../models/report';
import { ActionSheetController, AlertController } from '@ionic/angular';
import { ReportService } from 'src/app/services/report.service';
import { ImageService } from 'src/app/services/image.service';
import { Comment } from 'src/app/models/comment';
import { User } from 'src/app/models/user';
import { UserService } from 'src/app/services/user.service';
import { ReportStepsService } from 'src/app/services/report-steps.service';
import { Address } from 'src/app/models/address';
import { LoadingService } from 'src/app/services/loading.service';
import { Position } from '@capacitor/geolocation';
import { LocationV2Service } from 'src/app/services/location.v2.service';
import { GeneralUtilityService } from 'src/app/services/general-utility.service';
import { DraftReportService } from 'src/app/services/draft-report.service';
import { AuthService } from 'src/app/services/auth.service';
import { TreePropertiesService } from 'src/app/services/tree-properties.service';
import { TreeSelectionService } from '../../services/tree-selection.service';

import { inputReport } from 'src/app/models/inputReport';
import { ReportData } from 'src/app/models/reportData';
import { GpsGeocoder } from 'src/app/models/gpsGeocoder';
import { IdentifiedTreeOption } from 'src/app/models/identifiedTreeOption';

import { ModalController } from '@ionic/angular';
import { IonModal } from '@ionic/angular';
import { MultiLanguageService } from 'src/app/services/multi-language.service';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
@Component({
    selector: 'app-register-tree-input',
    templateUrl: './register-tree-input.page.html',
    styleUrls: ['./register-tree-input.page.scss'],
})
export class RegisterTreeInputPage implements OnInit {
    constructor(
        private routeHistoryService: RouteHistoryService,
        private router: Router,
        public actionSheetController: ActionSheetController,
        private imageService: ImageService,
        // private location: Location,
        private reportService: ReportService,
        private reportStepsService: ReportStepsService,
        private userService: UserService,
        private locationService: LocationV2Service,
        private loadingService: LoadingService,
        private generalUtilityService: GeneralUtilityService,
        private draftReportService: DraftReportService,
        private authService: AuthService,
        private treePropertiesService: TreePropertiesService,
        private treeSelectionService: TreeSelectionService,
        private modalCtrl: ModalController,
        private multiLanguageService: MultiLanguageService,
        private alertController: AlertController,
        private translate: TranslateService,
    ) {}

    @ViewChild(IonModal) modal!: IonModal; // this will match the first modal, being the ai options modal


    showStageOptions: boolean = false;

    showEcosystemOptions: boolean = false;

    identifiedTreeOptions: IdentifiedTreeOption[] = [];

    allowDraftSave: boolean = true;

    stages = [
        {
            stage_name: 'Elder',
            id: 3,
            img_src: '../../../assets/icons/tree-stages/Elder icon.png',
            img_green_src:
                '../../../assets/icons/tree-stages/elder-icon-green.svg',
        },
        {
            stage_name: 'Adult',
            id: 4,
            img_src: '../../../assets/icons/tree-stages/Adult icon.png',
            img_green_src:
                '../../../assets/icons/tree-stages/adult-icon-green.svg',
        },
        {
            stage_name: 'Young',
            id: 5,
            img_src: '../../../assets/icons/tree-stages/Young icon.png',
            img_green_src: '../../../assets/icons/tree-stages/Young icon.svg',
        },
        {
            stage_name: 'Sapling',
            id: 6,
            img_src: '../../../assets/icons/tree-stages/Sapling icon.png',
            img_green_src:
                '../../../assets/icons/tree-stages/sapling-icon-green.svg',
        },
        {
            stage_name: 'Recently planted',
            id: 7,
            img_src: '../../../assets/icons/tree-stages/just planted icon.png',
            img_green_src:
                '../../../assets/icons/tree-stages/recently-planted-icon-green.svg',
        },
    ];

    ecosystems = [
        { name: 'Open field', id: 1, img_src: '' },
        { name: 'Non-native forest', id: 2, img_src: '' },
        { name: 'Small native forest', id: 3, img_src: '' },
        { name: 'Urban area', id: 4, img_src: '' },
        { name: 'Other field', id: 5, img_src: '' },
    ];

    environmentExpositionOptions = [
        { name: 'exposed', id: 1 },
        { name: 'protected', id: 2 },
    ];

    specieOfTree: string = '';
    commonName: string | null = null;
    aiSpecie: string = ''; 

    selectedStage: {
        name?: string;
        imageSrc?: string;
        imageGreenSrc?: string;
        id?: number;
    } = {};

    selectedEcosystem: {
        name?: string;
        imageSrc?: string;
        id?: number;
    } = {};

    selectedEnvironmentExpositionId?: number;

    selectedEcosystemName: string = '';

    selectedImage: string = '';

    isSelectedImageModalOpen: boolean = false;

    public get storedReport(){ 
        return this.reportStepsService.getStoredReport();
    }
    async ngOnInit() {
        await this.setReportPosition().catch((error) =>
            console.log('error in setReportPosition:', error),
        );
        /* this.resetCommonName(); */
        this.initializeCommonName();
    }

    ionViewWillEnter() {
        if (this.authService.isOfflineMode()) {
            this.saveReportAsDraft();
        }
        this.checkUrl()
        this.locationService.setNewReportPosition(this.reportStepsService.getStoredReport().gps_geocoder!)
        /* this.resetCommonName(); */
        this.initializeCommonName();
    }
    initializeCommonName() {
        if (!this.commonName) {
            this.commonName = null;
            this.reportStepsService.updateStoredReportData({
                common_name: null
            });
        }
    }

    getLocalStorageImage(imageKey: string): string {
        const imgData = localStorage.getItem(imageKey);
        return imgData ? JSON.parse(imgData).img : '';
    }

    getSelectedLocalStorageImage(): string {
        return localStorage.getItem(this.selectedImage)!;
    }

    selectImage(imageKey: string) {
        this.selectedImage = imageKey;
        console.log('[selectImage] this.selectedImage:', this.selectedImage);
        this.isSelectedImageModalOpen = true;
    }

    closeModal() {
        this.isSelectedImageModalOpen = false;
        console.log('XDD');
    }

    openStageDropdown() {
        this.showStageOptions = !this.showStageOptions;
        console.log('Selected stage');
    }

    openEcosystemDropdown() {
        this.showEcosystemOptions = !this.showEcosystemOptions;
    }

    selectStageOption(stage: {
        stage_name: string;
        id: number;
        img_src: string;
        img_green_src: string;
    }) {
        console.log('selectedStageOPtion:', stage);
        this.selectedStage = {
            name: stage.stage_name,
            id: stage.id,
            imageSrc: stage.img_src,
            imageGreenSrc: stage.img_green_src,
        };
        this.reportStepsService.updateStoredReportData({ stage_id: stage.id });
        this.showStageOptions = false;
    }

    selectEcosystemOption(ecosystem: {
        name: string;
        id: number;
        img_src: string;
    }) {
        this.selectedEcosystem = { name: ecosystem.name, id: ecosystem.id };
        this.reportStepsService.updateStoredReportData({
            ecosystem_surrounding_id: ecosystem.id,
        });
        this.showEcosystemOptions = false;
    }

    selectEnvironmentExposition(option: { name: string; id: number }) {
        this.selectedEnvironmentExpositionId = option.id;
        this.reportStepsService.updateStoredReportData({
            environment_exposition_id: option.id,
        });
    }

    updateStoredSpecie(newSpecie: string) {
        if (!newSpecie || newSpecie.trim() === '') {
            this.specieOfTree = '';
            this.aiSpecie = ''; 
        } else {
            this.specieOfTree = newSpecie;
        }
        this.reportStepsService.updateStoredReportData({
          specie: newSpecie,
          ai_specie: this.aiSpecie,
        });
    }

    async setReportPosition(): Promise<void> {
        await this.locationService.updatePosition().then(() => {
            console.log('REPORTE CON POSITION ACTUALIZADO', this.reportStepsService.getStoredReport());
        });
    }

    goBackUrlHistory() {
        const prevUrl =
            this.routeHistoryService.getPrevUrl() || '/tabs/home';
        this.router.navigateByUrl(prevUrl);
    }

    async registerBtn() {
        // alert 
        const translations = await firstValueFrom(this.translate.get([
            'registertree.HEADER',
            'registertree.MESSAGE',
            'registertree.SAVE_DRAFT',
            'registertree.REGISTER'
          ]));
        const header = translations['registertree.HEADER'];
        const message = translations['registertree.MESSAGE'];
        const alert = await this.alertController.create({
            header,
            message,
            buttons: [
                {
                    text: translations['registertree.SAVE_DRAFT'],
                    handler: () => {
                        this.saveReportAsDraft();
                        alert.dismiss();

                        return false;
                    }
                },
                {
                    text: translations['registertree.REGISTER'],
                    handler: () => {
                        this.registerTreeReport();
                        alert.dismiss();

                        return false;
                    }
                }
            ],
            cssClass: 'outdated-version-alert', // reusing an old css class
        });
        
        await alert.present();
        // for Save as a draft, execute function
        // for Register, execute function
    }
    /* resetCommonName() {
        this.commonName = '';
        this.reportStepsService.updateStoredReportData({
            common_name: ''
        });
    } */
    updateCommonName(newCommonName: string) {
        this.commonName = newCommonName.trim() || null;
        console.log('commonName actualizado a:', this.commonName);
        this.reportStepsService.updateStoredReportData({
            common_name: this.commonName
        });
    }
    

    async registerTreeReport() {
        let { allUploaded, imageIds } =
            await this.reportStepsService.uploadImagesV3();
        if (allUploaded) {
            // Update report with image ids
            this.reportStepsService.updateStoredReportImages(imageIds);
            console.log('commonName before sending:', this.commonName);
            this.reportStepsService.updateStoredReportData({
                common_name: this.commonName,
                ai_specie: this.aiSpecie,
                specie: this.specieOfTree
            });
            console.log('this.commonNane now:', this.commonName);
            // submit report
            this.reportService.submitReport(this.reportStepsService.getStoredReport()).subscribe({
                next: (result: any) => {
                    this.reportStepsService.resetSteps();
                    this.resetValues();
                    console.log('pushReport');
                    console.log('result: ', result);
                    this.router.navigateByUrl('/tabs/form-submitted/new-tree/'+result.data.id);
                },
                error: (e) => console.log('failed to add report, err:', e),
                complete: () => console.log('complete'),
            });
        }
        console.log('[registerTreeReport] - this.reportStepsService.getStoredReport():', this.reportStepsService.getStoredReport());
    }

    async saveReportAsDraft() {
        await this.draftReportService.storeReportAsDraft(this.reportStepsService.getStoredReport())
        this.reportStepsService.resetSteps();
        this.resetValues();
        this.router.navigateByUrl(`/tabs/form-submitted/draft/`);
    }

    retrySpecificStep() {
        this.isSelectedImageModalOpen = false;
        setTimeout(() => {
            // Define a mapping of image keys to their corresponding integer values
            const imageKeyMap: { [key: string]: number } = {
                frontal: 0,
                leaf: 1,
                trunk: 2,
                scale: 3,
            };

            // Retrieve the integer value based on the imageKey
            const step = imageKeyMap[this.selectedImage];

            if (step !== undefined) {
                // Call the service method with the step value
                this.reportStepsService.retrySpecificStep(step);
                // Navigate to the desired URL
                this.router.navigateByUrl(`tabs/tree`);
            } else {
                console.error('Invalid imageKey:', this.selectedImage);
                // Handle invalid imageKey if needed
            }
        }, 1000);
    }

    resetValues() {
        this.specieOfTree = '';
        this.commonName = null;
        this.reportStepsService.updateStoredReportData({
            common_name: null
        });
        /* this.resetCommonName(); */
        this.selectedStage = {};
        this.selectedEcosystem = {};
        this.selectedEnvironmentExpositionId = undefined;

        localStorage.removeItem('front'); // sometimes a 'front' key is generated, delete it in that case

        localStorage.removeItem('frontal');
        localStorage.removeItem('leaf');
        localStorage.removeItem('scale');
        localStorage.removeItem('trunk');
    }

    async getTreeAiOptions() {
        try {
            await this.loadingService.showCustomTextLoadingAnimation(
                this.translate.instant('registertree.fetching')
            );
            let treeDetections = await this.reportStepsService.identifyTree();
            await this.loadingService.dismiss();
            console.log('[getTreeAiOptions] treeDetections:', treeDetections);
            if (!treeDetections || treeDetections.length === 0) {
                this.loadingService.notificationErrorShow(
                    this.translate.instant('registertree.No_trees')
                );
                return;
            }
            this.identifiedTreeOptions = treeDetections.slice(0, 5);
            this.modal.present();
            console.log('Tree detections:', this.identifiedTreeOptions);
        } catch (error) {
            console.error('failed to identify tree, error:', error);
            this.loadingService.dismiss();
            this.loadingService.notificationErrorShow(
                this.translate.instant('registertree.failed_identify_tree')
            );
        }
    }
    
    
    setAiOptionAsSpecie(aiOption: string, commonName: string | undefined) {
        this.specieOfTree = aiOption;
        this.aiSpecie = aiOption;
        this.updateStoredSpecie(aiOption);
        if (commonName) {
            this.updateCommonName(commonName);
        }
        this.modal.dismiss();
    }
    
    

    checkUrl(): void {
        if (this.router.url === '/tabs/continue-draft') {
            this.allowDraftSave = false;
        }
    }

    specifyLocation() {
        this.router.navigateByUrl('/tabs/report-map-new');
    }


    isOfflineMode() {
        return this.authService.offlineMode
    }

    allFieldsComplete() {
        return !(
            this.specieOfTree && 
            Object.keys(this.selectedStage).length !== 0 && 
            this.selectedEnvironmentExpositionId && 
            Object.keys(this.selectedEcosystem).length !== 0
        );
    }
    
}

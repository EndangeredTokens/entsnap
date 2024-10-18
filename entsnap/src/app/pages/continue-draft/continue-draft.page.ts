import { Component, OnInit, ViewChild } from '@angular/core';
import { RouteHistoryService } from 'src/app/services/route-history.service';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { Report } from '../../models/report';
import { ActionSheetController } from '@ionic/angular';
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

import { inputReport, reportDraft } from 'src/app/models/inputReport';
import { ReportData } from 'src/app/models/reportData';
import { GpsGeocoder } from 'src/app/models/gpsGeocoder';
import { IdentifiedTreeOption } from 'src/app/models/identifiedTreeOption';

import { ModalController } from '@ionic/angular';
import { IonModal } from '@ionic/angular';
import { FileService } from 'src/app/services/file.service';
import { MultiLanguageService } from 'src/app/services/multi-language.service';
import { Base64Img } from 'src/app/models/base64img';

@Component({
    selector: 'app-continue-draft',
    templateUrl: './continue-draft.page.html',
    styleUrls: ['./continue-draft.page.scss'],
})
export class ContinueDraftPage {
    constructor(
        private routeHistoryService: RouteHistoryService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
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
        private fileService: FileService,
        private multiLanguageService: MultiLanguageService,
    ) {}

    @ViewChild(IonModal) modal!: IonModal; // this will match the first modal, being the ai options modal

    inputReport: inputReport = this.reportStepsService.getStoredReport();

    showStageOptions: boolean = false;

    showEcosystemOptions: boolean = false;

    identifiedTreeOptions: IdentifiedTreeOption[] = [];

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
        stage_name?: string;
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

    selectedImageName: string = '';

    isSelectedImageModalOpen: boolean = false;

    passedReportDraft: reportDraft | undefined = {}; // Passed from my-trees

    draftFrontalImageSrc: Base64Img | undefined;
    draftLeafImageSrc: Base64Img | undefined;
    draftTrunkImageSrc: Base64Img | undefined;
    draftScaleImageSrc: Base64Img | undefined;

    async ionViewWillEnter() {
        this.checkUrl();
        const draftName = this.activatedRoute.snapshot.paramMap.get('draftName') || 'N/A';
        this.passedReportDraft = this.draftReportService.getDraft(draftName);
        console.log('Report Draft from my-trees:', this.passedReportDraft);

        // Extract initial draft report data
        this.selectedEnvironmentExpositionId =
            this.passedReportDraft?.report_data?.environment_exposition_id;

        this.selectedStage = this.stages.find(
            (stage) =>
                stage.id === this.passedReportDraft?.report_data?.stage_id,
        )!;

        this.selectedEcosystem = this.ecosystems.find(
            (ecosystem) =>
                ecosystem.id ===
                this.passedReportDraft?.report_data?.ecosystem_surrounding_id,
        )!;

        this.specieOfTree = this.passedReportDraft?.report_data?.specie!;

        await this.loadDraftImages();

        // Disabled, we don't want to update a draft position
        // await this.setReportPosition().catch((error) =>
        //     console.log('error in setReportPosition:', error),
        // );
    }

    updateDraft() {
        this.draftReportService.updateDraftReport(this.passedReportDraft!);
        this.router.navigateByUrl('/tabs/my-collection')
    }

    async loadDraftImages() {
        if (this.passedReportDraft) {
            this.draftFrontalImageSrc = this.passedReportDraft.draftImages![0] ? (await this.fileService.loadPicture(this.passedReportDraft!.draftImages![0])) : undefined;
            this.draftLeafImageSrc = this.passedReportDraft.draftImages![1] ? (await this.fileService.loadPicture(this.passedReportDraft!.draftImages![1])) : undefined;
            this.draftTrunkImageSrc = this.passedReportDraft.draftImages![2] ? (await this.fileService.loadPicture(this.passedReportDraft!.draftImages![2])) : undefined;
            this.draftScaleImageSrc = this.passedReportDraft.draftImages![3] ? (await this.fileService.loadPicture(this.passedReportDraft!.draftImages![3])) : undefined;
            localStorage.setItem('frontal', JSON.stringify(this.draftFrontalImageSrc));
            localStorage.setItem('leaf', JSON.stringify(this.draftFrontalImageSrc));
            localStorage.setItem('front', JSON.stringify(this.draftFrontalImageSrc));
            localStorage.setItem('scale', JSON.stringify(this.draftFrontalImageSrc));
            
            console.log("Images loaded");
        }
      }



    //debug
    printPassedReport() {
        console.log('PASSED REPORT:', this.passedReportDraft);
    }

    getReportDraftStageName(stageId?: number) {
        if (stageId === undefined || stageId < 3 || stageId > 7) {
            // return 'select stage of tree';
        }

        const stage = this.stages.find((stage) => stage.id === stageId);
        this.selectStageOption(stage!);
        // const stage = this.stages[stageId];
        // return stage?.stage_name;
    }

    getLocalStorageImage(imageKey: string): string {
        return localStorage.getItem(imageKey)!;
    }

    getSelectedLocalStorageImage(): string {
        return localStorage.getItem(this.selectedImage)!;
    }

    selectImage(imageKey: string, imageName: string) {
        this.selectedImage = imageKey;
        this.selectedImageName = imageName;
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
            stage_name: stage.stage_name,
            id: stage.id,
            imageSrc: stage.img_src,
            imageGreenSrc: stage.img_green_src,
        };
        this.passedReportDraft!.report_data!.stage_id = stage.id;
        this.showStageOptions = false;
    }

    selectEcosystemOption(ecosystem: {
        name: string;
        id: number;
        img_src: string;
    }) {
        this.selectedEcosystem = { name: ecosystem.name, id: ecosystem.id };
        this.passedReportDraft!.report_data!.ecosystem_surrounding_id =
            ecosystem.id;
        this.showEcosystemOptions = false;
    }

    selectEnvironmentExposition(option: { name: string; id: number }) {
        this.selectedEnvironmentExpositionId = option.id;
        this.passedReportDraft!.report_data!.environment_exposition_id =
            option.id;
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
            console.log('REPORTE CON POSITION ACTUALIZADO', this.inputReport);
        });
    }

    goBackUrlHistory() {
        const prevUrl =
            this.routeHistoryService.getPrevUrl() || '/tabs/home';
        this.router.navigateByUrl(prevUrl);
    }

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
            const newReport = this.reportStepsService.getStoredReport();

            newReport.gps_geocoder = this.passedReportDraft?.gps_geocoder;
            newReport.report_data!.specie = this.specieOfTree;
            newReport.report_data!.stage_id = this.selectedStage.id;
            newReport.report_data!.ecosystem_surrounding_id = this.selectedEcosystem.id;
            newReport.report_data!.environment_exposition_id = this.selectedEnvironmentExpositionId;
            newReport.image_ids = imageIds;

            this.reportStepsService.updateStoredReportData({
                common_name: this.commonName,
                ai_specie: this.aiSpecie,
                specie: this.specieOfTree,
            });

            console.log(newReport);
            // submit report
            this.reportService.submitReport(this.reportStepsService.getStoredReport()).subscribe({
                next: (result: any) => {
                    this.reportStepsService.resetSteps();
                    this.resetValues(); 
                    this.draftReportService.removeDraft(this.activatedRoute.snapshot.paramMap.get('draftName')!);
                    console.log('pushReport');
                    console.log('result: ', result);
                    this.router.navigateByUrl('/tabs/form-submitted/new-tree/'+result.data.id);
                },
                error: (e) => console.log('failed to add report, err:', e),
                complete: () => console.log('complete'),
            });
        }
        console.log('[registerTreeReport] this.inputReport:', this.inputReport);
    }

    async saveReportAsDraft() {
        await this.draftReportService.storeReportAsDraft(
            this.reportStepsService.getStoredReport(),
        );
        this.reportStepsService.resetSteps();
        this.resetValues();
        this.router.navigateByUrl(`/form-submitted`);
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
                'Fetching detections',
            );
            let treeDetections = await this.reportStepsService.identifyTree(this.draftFrontalImageSrc?.img);
            await this.loadingService.dismiss();
            console.log('[getTreeAiOptions] treeDetections:', treeDetections);
            if (!treeDetections || treeDetections.length === 0) {
                this.loadingService.notificationErrorShow(
                    'No trees identified',
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
                'Failed to identify tree',
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
            // this.allowDraftSave = false;
        }
    }

    allFieldsComplete() {
        return !(
            this.specieOfTree && 
            (this.selectedStage && Object.keys(this.selectedStage).length !== 0) && 
            this.selectedEnvironmentExpositionId && 
            (this.selectedEcosystem && Object.keys(this.selectedEcosystem).length !== 0)
        );
    }
}

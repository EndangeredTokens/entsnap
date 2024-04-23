import { HttpClient, HttpHeaders, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
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


@Injectable({
    providedIn: 'root'
  })
export class ReportStepsService {
    photoSteps = [
        {
            title: 'frontal',
            isImageCaptured: false,
            reportColName: 'frontal_image',
            image: "",
            localStorage: "frontal_storage",
            localStorageRandom: "",
            icon: "../../assets/icon/example_frontal.svg",
            text: "../../assets/icon/FRONTAL.svg",
        },
        {
            title: 'leaf',
            isImageCaptured: false,
            reportColName: 'leaf_image',
            image: "",
            localStorage: "leaf_storage",
            localStorageRandom: "",
            icon: "../../assets/icon/example_leaf.svg",
            text: "../../assets/icon/LEAF.svg",
        },
        {
            title: 'trunk',
            isImageCaptured: false,
            reportColName: 'trunk_image',
            image: "",
            localStorage: "trunk_storage",
            localStorageRandom: "",
            icon: "../../assets/icon/example_trunk.svg",
            text: "../../assets/icon/TRUNK.svg",
        },
        {
            title: 'scale',
            isImageCaptured: false,
            reportColName: 'scale_image',
            image: "",
            localStorage: "scale_storage",
            localStorageRandom: "",
            icon: "../../assets/icon/example_scale.png",
            text: "../../assets/icon/SCALE.svg",
        }
    ]

    reportInfoStep = {
        stage: '',
        foliage: '',
        treeType: '',
        trunkDiameter: '',
        description: '',
        poem: ''
    }
    currentStep: number = 0;

    triggerAlert: boolean = false
    preview?: Report
    
    formData = {
        stage: '',
        foliage: '',
        treeType: '',
        trunkDiameter: '',
        description: '',
        poem: ''
    }


    constructor(
        private report: ReportService,
        private imageService: ImageService,
        private loadingService: LoadingService,
        // private draftReportService: DraftReportService,
        private generalUtilityService: GeneralUtilityService,
        private authService: AuthService,
        private fileService: FileService
        ) {}

    activateTriggerAlertFlag(): void {
        this.triggerAlert = true
        localStorage.setItem("triggerAlert", "true")
    }

    deactivateTriggerAlertFlag(): void {
        this.triggerAlert = false
        localStorage.setItem("triggerAlert", "false")
    }

    shouldTriggerAlert(): boolean {
        // return localStorage.getItem("triggerAlert") === "true"
        return this.triggerAlert;
    }

    nextStep() {
        if( this.currentStep === this.photoSteps.length - 1 ) {
            return
        }
        this.currentStep++;
        // localStorage.setItem("reportImageStep", this.currentStep.toString())
    }

    previousStep() {
        if( this.currentStep === 0 ) return;
        this.currentStep--;
    }

    getCurrentStep(): number{
        return this.currentStep
    }

    resetSteps(isDraft?: boolean, draftKey?: any): void {
      let offlineMode = this.authService.offlineMode
      console.log("RESETSTEPS, OFFLINE MODE:", offlineMode)
      for (let step of this.photoSteps){
        step.isImageCaptured = false
        step.image = ""
        // if (!offlineMode) {
        localStorage.removeItem(step.localStorage)
        // }
        localStorage.removeItem(step.localStorageRandom)
      }
      this.currentStep = 0
      this.initializePreview()
      this.deactivateTriggerAlertFlag()
      localStorage.removeItem("report")
      if (isDraft) {
        localStorage.removeItem(draftKey)
      }
      // localStorage.setItem("reportImageStep", this.currentStep.toString())
    }

    isFirstStep(): boolean {
        return this.currentStep === 0
    }

    captureStep(base64Image: string): string {
        // const storageImageKey = this.photoSteps[this.currentStep].title + this.generalUtilityService.generateRandomInteger()
        const storageImageKey = this.photoSteps[this.currentStep].title
        localStorage.setItem(storageImageKey, base64Image)
        // this.draftReportService.addImageKeyToList(storageImageKey)
        this.photoSteps[this.currentStep].isImageCaptured = true
        this.photoSteps[this.currentStep].localStorage = storageImageKey
        return this.photoSteps[this.currentStep].title
    }

    retryStep(): void {
        this.photoSteps[this.currentStep].isImageCaptured = false
    }

    isCurrentStepCaptured(): boolean {
        return this.photoSteps[this.currentStep].isImageCaptured
    }

    getCurrentStepImage(): string {
        return this.photoSteps[this.currentStep].image
    }

    getCurrentStepTitle(): string {
        return this.photoSteps[this.currentStep].title
    }

    getCurrentStepIcon(): string {
        return this.photoSteps[this.currentStep].icon
    }

    getCurrentStepText(): string {
        return this.photoSteps[this.currentStep].text
    }

    isLastStep(): boolean {
        return this.currentStep == this.photoSteps.length - 1
    }

    checkCanLeaveReportTreePreview(nextUrl: string): boolean {
        return (this.getCurrentStep() === 0 && !this.isCurrentStepCaptured()) || nextUrl === "/tabs/tree";
    }

    checkCanActivate(prevUrl: string): boolean {
        return (this.getCurrentStep() !== 0 || this.isCurrentStepCaptured()) && ["/tabs/tree", "/tabs/preview"].includes(prevUrl);
    }

    checkCanLeaveReportTreeImage(nextUrl: string): boolean {
        return (this.getCurrentStep() === 0 && !this.isCurrentStepCaptured()) || nextUrl === "/tabs/preview";
    }

    canCapture(): boolean {
        return this.photoSteps[this.currentStep].title !== "preview"
    }

    initializePreview(): void {
        this.preview = this.report.generateEmptyReport()
    }

    previewIsInitialized(): boolean {
        return this.preview !== undefined
    }

    getPreview(): Report | undefined{
        return this.preview
    }

    completeReportImages(): void {
        if (!this.previewIsInitialized()) return

        this.preview!.frontal_image = this.photoSteps[0].image
        this.preview!.leaf_image = this.photoSteps[1].image
        this.preview!.trunk_image = this.photoSteps[2].image
        this.preview!.scale_image = this.photoSteps[3].image

    }

    async addLocalHostImagesToDraftReport() {
      // Generate random keys for localStorage images
      const images = [
        ReportImage.FRONTAL_IMAGE, 
        ReportImage.LEAF_IMAGE, 
        ReportImage.TRUNK_IMAGE, 
        ReportImage.SCALE_IMAGE
    ]
      const idxs = [0,1,2,3]
      for (let i of idxs){
        let draftImgKey = images[i] + this.generalUtilityService.generateRandomInteger() + ".jpg"
        let data = localStorage.getItem(this.photoSteps[i].localStorage)!
        this.preview![images[i]] = await this.fileService.savePicture(data, draftImgKey)
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
      this.photoSteps[0].localStorageRandom = this.preview!.frontal_image
      this.photoSteps[1].localStorageRandom = this.preview!.leaf_image
      this.photoSteps[2].localStorageRandom = this.preview!.trunk_image
      this.photoSteps[3].localStorageRandom = this.preview!.scale_image
    }

    updatePreviewWithDraft(draft: any) {
      this.preview = draft
    }

    async submitDraftImages(): Promise<boolean>{
        this.setDraftImages()
        let allUploaded = false;
        try {
          allUploaded = await this.uploadImages(true)
        } catch (error) {
          console.log("SubmitDraftImages Error:", error)
        }
        return allUploaded
      }

    async uploadImages(draft?: boolean): Promise<boolean> {
        let allUploaded = true;
        await this.loadingService.show()
        for (let step of this.photoSteps){
            let base64Image
            if (draft) {
              base64Image = await this.fileService.loadPicture(step.localStorageRandom)
            } else {
              base64Image = localStorage.getItem(step.localStorage)
            }
            if (base64Image){
                // upload
                try {
                    let imageUrl = await this.uploadImage(base64Image)
                    imageUrl = this.imageService.addUrl(imageUrl)
                    step.image = imageUrl
                    console.log("uploaded ", step.title, "produced url", imageUrl)
                } catch (error) {
                    console.error("[UploadImages] failed to upload, error:", error)
                    allUploaded = false;
                }
            }
        }
        if (allUploaded){
            this.completeReportImages()
        }
        await this.loadingService.dismiss()
        return allUploaded;
    }

    uploadImage(base64Image: string): Promise<string> {
        return new Promise( ( resolve, reject ) => {
            this.imageService.newUploadImage( {img: base64Image} ).subscribe({
                next: ( res ) => {
                    console.log('Image uploaded', res.filename);
                    resolve( res.filename );
                },
                error: ( err ) => {
                    console.error('[UploadImage] ERROR', err);
                    reject( err );
                }
            })
        });
    }

    async identifyTree(): Promise<TreeDetection[]> {
        let frontal = this.photoSteps[0]
        let base64Image = localStorage.getItem(frontal.localStorage)
        if (!base64Image){
            return []
        }

        return new Promise ((resolve, reject) => {
            this.imageService.identifyTree({img: base64Image!}).subscribe({
                next: ( res ) => {
                    console.log('Tree identify', res);
                    resolve( res );
                },
                error: ( err ) => {
                    console.error('[UploadImage] ERROR', err);
                    reject( err );
                }
              })
        })
    }




    setReportType(newType: number): void {
        if (!this.previewIsInitialized()) return
        this.preview!.type = newType
    }

    updateReportInfo(formData: any): void {
        this.reportInfoStep = formData

        if (!this.previewIsInitialized()) return
        this.preview!.tree_type = this.reportInfoStep.treeType;
        this.preview!.trunk_diameter = this.reportInfoStep.trunkDiameter;
        this.preview!.surrounding_desc = this.reportInfoStep.description;
        this.preview!.poem = this.reportInfoStep.poem;
    }

    updateReportDraftCondition(isDraft: boolean) {
      this.preview!.is_draft = isDraft
    }

    getReportInfo(): any {
        return this.reportInfoStep
    }

    setReportLatLon(location: number[]) {
        this.preview!.latitude = location[0]
        this.preview!.longitude = location[1]
    }

    setReportAddress(address: Address|undefined) {
        if (!address) return
        console.log("Address is: ", address);
        this.preview!.address_type = address!.type;
        this.preview!.address = address!.formatted;
        this.preview!.street_number = address!.number;
        this.preview!.street_name = address!.street;
        this.preview!.city = address!.city;
        this.preview!.province = address!.province;
        this.preview!.county = address!.county;
        this.preview!.country = address!.country;
    }

    previewToCache() {
        try {
            localStorage.setItem("report", JSON.stringify(this.preview!))
        } catch (error) {
            console.log("[PreviewToCache]  ERROR:", error)
        }
    }

    previewFromCache() {
        try {
            this.preview = JSON.parse(localStorage.getItem("report")!)
        } catch (error) {
            console.log("[PreviewFromCache]  ERROR:", error)
        }
    }

    photoCompleted(): boolean {
        return this.currentStep >= this.photoSteps.length
    }

    getStepLocalStorageKey(step: number): string {
        return this.photoSteps[step].localStorage
    }

    submitDraftReport(): Observable<any> {
        return this.report.addReport(this.preview!)
      }
}

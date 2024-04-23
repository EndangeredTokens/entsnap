import { Component, OnInit, OnDestroy } from '@angular/core';
import { ReportService } from 'src/app/services/report.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { ImageService } from 'src/app/services/image.service';
import { Base64Img } from 'src/app/models/base64img';
import { AlertController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { ReportStepsService } from 'src/app/services/report-steps.service';
import { LoadingService } from 'src/app/services/loading.service';
import { CameraOverlayService } from 'src/app/services/camera-overlay.service';
@Component({
  selector: 'app-new-report',
  templateUrl: './new-report.page.html',
  styleUrls: ['./new-report.page.scss'],
})
export class NewReportPage implements OnInit, OnDestroy {
    public alertButtons = [
    {
      text: 'Reset',
      role: 'cancel',
      handler: () => {
        console.log("reset and leave")
        console.log("localstorage variable nextUrlAfterLeave", localStorage.getItem("nextUrlAfterLeave"))
        this.reportSteps.resetSteps()
        this.reportSteps.deactivateTriggerAlertFlag()
      },
    },
    {
      text: 'Continue',
      role: 'confirm',
      handler: () => {
        console.log("continue editing")
        console.log("localstorage variable nextUrlAfterLeave", localStorage.getItem("nextUrlAfterLeave"))
        this.reportSteps.deactivateTriggerAlertFlag()
        // for some reason this produce troubles!!
        // if (this.reportSteps.isLastStep() && this.reportSteps.isCurrentStepCaptured()){
        //   this.finishPhotoSteps()
        // }
              },
    },
  ];

  topLeftFrame: string = "../../../assets/icon/top-left-frame.svg";
  topRightFrame: string = "../../../assets/icon/top-right-frame.svg";
  bottomLeftFrame: string = "../../../assets/icon/bottom-left-frame.svg";
  bottomRightFrame: string = "../../../assets/icon/bottom-right-frame.svg";
  takePictureIcon: string = "../../../assets/icon/logo_ents_images.svg";
  backIcon = "../../../assets/icon/back_button.svg";

  isCameraActive: boolean = false;
  currentStep: number = 0;
  reportSaved: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private imageService: ImageService,
    private reportSteps: ReportStepsService,
    private loadingService: LoadingService,
    private cameraOverlayService: CameraOverlayService
  ) { }

  shouldTriggerAlert() {
    // console.log("SHOULD TRIGGER ALERT? ", this.reportSteps.shouldTriggerAlert())
    return this.reportSteps.shouldTriggerAlert()
  }

  async ngOnInit() {
    this.reportSteps.resetSteps()
  }

  async ionViewDidEnter() {
    await this.cameraOverlayService.startCamera() // try to start the camera if is not already running
  }

  async ngOnDestroy() {
    console.log("ngOnDestroy")
    await this.cameraOverlayService.stopCamera()
    this.reportSteps.resetSteps()
  }

  async finishPhotoSteps() {
    await this.cameraOverlayService.stopCamera();
    const type = +this.route.snapshot.paramMap.get('id')!;
    this.reportSteps.setReportType(type)
    this.reportSteps.previewToCache()
    this.router.navigateByUrl('/tabs/preview');
  }

  async previousStep() {
    if( this.reportSteps.isFirstStep() ) return;
    this.reportSteps.previousStep()

    if( this.isCameraActive && this.reportSteps.isCurrentStepCaptured() ) {
      await this.cameraOverlayService.stopCamera();
    }
  }

  async nextStep() {
    if( this.reportSteps.isLastStep() ) {
      await this.finishPhotoSteps()
      return;
    }
    this.reportSteps.nextStep()

    if( !this.isCameraActive && !this.reportSteps.isCurrentStepCaptured() ) {
      await this.cameraOverlayService.startCamera();
    }
  }

  isFirstStep(): boolean {
    return this.reportSteps.isFirstStep()
  }

  getCurrentStep(): number {
    return this.reportSteps.getCurrentStep()
  }

  isCurrentStepCaptured(): boolean {
    return this.reportSteps.isCurrentStepCaptured()
  }

  getCurrentStepImage(): string {
    // return this.reportSteps.getCurrentStepImage()
    const localStorageKey = this.reportSteps.getStepLocalStorageKey(this.reportSteps.getCurrentStep())
    const image = localStorage.getItem(localStorageKey)
    if (!image){
      return ""
    }
    return image
  }

  getCurrentStepTitle(): string {
    return this.reportSteps.getCurrentStepTitle()
  }

  getCurrentStepIcon(): string {
    return this.reportSteps.getCurrentStepIcon()
  }

  getCurrentStepText(): string {
    return this.reportSteps.getCurrentStepText()
  }

  async captureImage() {
    const base64Image = await this.cameraOverlayService.captureImage()
    if (base64Image){
      this.reportSteps.captureStep(base64Image)
    }
  }

  async retryImage() {
    this.reportSteps.retryStep()
    await this.cameraOverlayService.startCamera()
  }

}

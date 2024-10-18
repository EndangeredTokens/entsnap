import { Component, OnInit, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
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
import { TreeOptionsModalComponent } from '../tree-options-modal/tree-options-modal.component';
import { TreeSelectionService } from '../../services/tree-selection.service';

@Component({
  selector: 'app-report-detail',
  templateUrl: './report-detail.component.html',
  styleUrls: ['./report-detail.component.scss'],
})
export class ReportDetailComponent implements OnInit {

  public alertButtons = [
    {
      text: 'Reset',
      role: 'cancel',
      handler: () => {
        console.log("reset and leave")
        console.log("localstorage variable nextUrlAfterLeave", localStorage.getItem("nextUrlAfterLeave"))
        localStorage.setItem("triggerAlert", "false")
        this.reportStepsService.resetSteps()
        this.reportStepsService.deactivateTriggerAlertFlag()
      },
    },
    {
      text: 'Continue',
      role: 'confirm',
      handler: () => {
        console.log("continue editing")
        console.log("localstorage variable nextUrlAfterLeave", localStorage.getItem("nextUrlAfterLeave"))
        this.reportStepsService.deactivateTriggerAlertFlag()
      },
    },
  ];

  @ViewChild (TreeOptionsModalComponent) treeOptionsModalComponent!: TreeOptionsModalComponent;

  comments?: Comment[];
  report: Report = this.reportService.generateEmptyReport()!;
  icon: string = "assets/icon/forest-fire-icon.svg";
  image?: string;
  preview?: boolean;
  users?: User[];
  stage?: Number;
  foliage?: Number;
  treeType?: String;
  trunkDiameter?: String;
  description?: String;
  poem?: String;
  isDisableButton: boolean = false;
  treeOption = "../../../assets/icon/tree_option.svg";
  saplingOption = "../../../assets/icon/sapling_option.svg";
  evergreenOption = "../../../assets/icon/evergreen_option.svg";
  decidiousOption = "../../../assets/icon/decidious_option.svg";

  formData = {
    stage_id: '',
    foliage_id: '',
    tree_type: '',
    trunk_diameter: '',
    surrounding_desc: '',
    poem: ''
  };

  stages: any[] = []
  foliages: any[] = []


  constructor(
    public actionSheetController: ActionSheetController,
    private imageService: ImageService,
    private location: Location,
    private reportService: ReportService,
    private reportStepsService: ReportStepsService,
    private router: Router,
    private userService: UserService,
    private locationService: LocationV2Service,
    private loadingService: LoadingService,
    private generalUtilityService: GeneralUtilityService,
    private draftReportService: DraftReportService,
    private authService: AuthService,
    private treePropertiesService: TreePropertiesService,
    private treeSelectionService: TreeSelectionService
  ) { }

  async ngOnInit() {
    this.reportStepsService.previewFromCache()
    this.report = this.reportStepsService.getPreview()!
    this.getStages()
    this.getFoliages()

    this.treeSelectionService.selectedTree.subscribe(tree => {
      if (tree) {

        this.formData.tree_type = tree.scientificName;
      }
    });
    // await this.setReportPosition().catch((error) => console.log("error in setReportPosition:", error))
  }

  shouldTriggerAlert() {
    // console.log("SHOULD TRIGGER ALERT? ", this.reportStepsService.shouldTriggerAlert())
    return this.reportStepsService.shouldTriggerAlert()
  }

  addUrl(image: string): string {
    if (image) {
      if(image.includes("http://") || image.includes("https://")) return image;
      return this.imageService.addUrl(image);
    } else {
      return this.imageService.addUrlDefault();
    }
  }

  getLocalStorageItem(key: string): string {
    return localStorage.getItem(key)!
  }

  daysElapsed(date: string): number {
    var d = new Date(date);
    var current = new Date();
    var diff = (current.getTime() - d.getTime()) / (1000 * 3600 * 24);
    return isNaN(diff) ? 0 : Math.floor(diff)
  }

  // async denounce(): Promise<void> {
  //   const actionSheet = await this.actionSheetController.create({
  //     cssClass: 'action-sheet',
  //     mode: 'ios',
  //     buttons: [
  //       {
  //         text: 'Denunciar reporte',
  //         role: 'destructive',
  //         handler: () => {
  //           console.log('Reported');
  //         }
  //       },
  //       {
  //         text: 'Cancelar',
  //         role: 'cancel',
  //         handler: () => {
  //           console.log("Cancelled");
  //         }
  //       }
  //     ]
  //   });
  //   await actionSheet.present();
  // }

  // getUpdatedUsers(): void {
  //   this.userService.getUsers()
  //     .subscribe(users => {
  //       this.users = users;
  //       this.updateData();
  //     })
  // }

  // goBack(): void {
  //   if (this.router.url == '/preview') {
  //     this.location.back();
  //   } else {
  //     this.router.navigateByUrl('/tabs/profile');
  //   }
  // }

  // goMenu(): void {
  //   if (this.router.url == '/tabs/home') {
  //     this.location.back();
  //   } else {
  //     this.router.navigateByUrl('/tabs/home');
  //   }
  // }

  // setPreview(): void {
  //   this.preview = true;
  // }

  // updateData(): void {
    // console.log("deprecated updateData")
    // var user = this.users!.find(user => user.id == this.report.UserId);
    // this.report.user_name = user!.name!;
    // this.report.user_avatar = user!.avatar;
  // }

  viewMap(): void {
    this.router.navigateByUrl('/report-map-new');
  }

  async identifyTree() {
    let showTreeOptionsModal = true
    try {
      let treeDetections = await this.reportStepsService.identifyTree()
      if (treeDetections) {
        if (treeDetections[0].score > 0.5) {
          this.formData.tree_type = treeDetections[0].scientificName
          showTreeOptionsModal = false
        }
      }
      console.log("Tree detections:", treeDetections)
      this.treeOptionsModalComponent.setTreeMatches(treeDetections.slice(0, 4))
    } catch (error) {
      console.error("failed to identify tree, error:", error)
      this.loadingService.dismiss()
      this.loadingService.notificationErrorShow("Failed to identify tree")
    }
    if (showTreeOptionsModal) {
      await this.treeOptionsModalComponent.presentModal()
    }
    // this.getStages()
    // call the endpoint to identify the tree
    // this.loadingService.show()
    // try {
    //   let treeDetections = await this.reportStepsService.identifyTree()
    //   console.log("Tree Detections:", treeDetections)
    //
    //   // tree detections is a list of possible objects with image examples
    //   // in the future we could produce a modal that displays the possible options and let the user decide
    //   // which fit best, since the detection model is not the best
    //   // but for now we will just use the first (highest score) detection
    //   this.formData.treeType = treeDetections[0].scientificName
    //   this.loadingService.dismiss()
    // } catch (error) {
    //   console.error("failed to identify tree, error:", error)
    //   this.loadingService.dismiss()
    //   this.loadingService.notificationErrorShow("Failed to identify tree")
    // }
  }

  validateForm(): boolean {
    // add some form validations if needed
    return true
  }

  async submitForm() {
    // this.isDisableButton = true;  // disable button
    console.log("details: ", this.formData);
    if (this.validateForm()) {
      // this.stage = 1;
      // if (this.formData.stage === 'sapling') {
      //   this.stage = 2;
      // }
      // this.foliage = 1;
      // if (this.formData.foliage === 'decidous') {
      //   this.foliage = 2;
      // }
      this.reportStepsService.updateReportInfo(this.formData)
      this.report = this.reportStepsService.getPreview()!
      this.reportStepsService.updateReportDraftCondition(false)
      const reportData = this.formData
      const street_adress = this.report.address
      const country = this.report.country
      console.log("reporte luego de actualizar condicion draft", this.reportStepsService.getPreview()!)
      // first upload all the images from memory

      let {allUploaded, imageIds} = await this.reportStepsService.uploadImagesV3()
      if (allUploaded) {
        console.log("After upload")
        console.log("Uploaded images ids:", imageIds)
        this.reportService.addReportV3(
          this.reportStepsService.getPreview()!.user_id, imageIds,
          this.report.gps_geocoder,
          reportData
        )
          .subscribe({
            next: (result) => {
              console.log("pushReport");
              console.log("result: ", result);
              this.reportStepsService.resetSteps()
              this.resetFormData()
              this.treeSelectionService.setSelectedTree("")
              this.router.navigateByUrl(`/form-submitted`);
            },
            error: (e) => console.log("failed to add report, err:", e),
            complete: () => console.log("complete")
          })
      }
    }
    this.resetFormData()
  }

  resetFormData() {
    this.formData = {
      stage_id: '',
      foliage_id: '',
      tree_type: '',
      trunk_diameter: '',
      poem: '',
      surrounding_desc: ''
    };
  }

  async saveAsDraft() {
    // Validate form
    if (!this.validateForm()) {
      return
    }

    // Assign proper values to stage and foliage
    // this.stage = this.formData.stage === "sapling" ? 2 : 1
    // this.foliage = this.formData.foliage === "decidous" ? 2 : 1

    // this.formData contains tree_type, trunk_diameter, surrounding_desc, poem
    this.reportStepsService.updateReportInfo(this.formData) // Update report with formData values

    // Adds key names of local host images to the respective attributes of the draft
    await this.reportStepsService.addLocalHostImagesToDraftReport().then(() => {
      this.reportStepsService.updateReportDraftCondition(true)

      // Update report
      this.report = this.reportStepsService.getPreview()!

      // Store draft key
      let draftName = "draft" + this.generalUtilityService.generateRandomInteger()
      localStorage.setItem(draftName, JSON.stringify(this.report))

      // Add draft key to list of draft keys
      this.draftReportService.addDraftKeyToList(draftName)

      // Reset form for next report
      this.resetFormData()

      this.reportStepsService.resetSteps()

      this.router.navigateByUrl(`/tabs/ents`);
    })
  }

  async setReportPosition(): Promise<void> {
    await this.locationService.updatePosition()
    .then(() => {
      this.reportStepsService.setReportLatLon(
        [
          this.locationService.position.coords.latitude,
          this.locationService.position.coords.longitude
        ]
      )
      this.reportStepsService.setReportAddress(this.locationService.address)
      this.report = this.reportStepsService.getPreview()!
    })
    console.log("REPORTE CON POSITION ACTUALIZADO", this.reportStepsService.getPreview()!)
  };

  getStepLocalStorageKey(step: number): string {
    return this.reportStepsService.getStepLocalStorageKey(step)
  }

  isOfflineMode() {
    return this.authService.isOfflineMode()
  }

  getStages(): void {
    this.treePropertiesService.getStages().subscribe(
      data => {
        this.stages = data
        console.log("Obtenido stages", this.stages)
      },
      error => {
        console.error('Error obteniendo stages:', error);
      }
    )
  }

  getFoliages(): void {
    this.treePropertiesService.getFoliages().subscribe(
      data => {
        this.foliages = data
        console.log("Obtenido foliages", this.stages)
      },
      error => {
        console.error('Error obteniendo foliages:', error);
      }
    )
  }

}

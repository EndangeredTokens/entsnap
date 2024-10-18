import { Component, OnInit, ViewChild} from '@angular/core';
import { MyEntsComponent } from 'src/app/components/my-ents/my-ents.component';
import { DraftReportService } from 'src/app/services/draft-report.service';
import { ReportStepsService } from 'src/app/services/report-steps.service';
import { AuthService } from 'src/app/services/auth.service';
import { FileService } from 'src/app/services/file.service';
import { Router } from '@angular/router';
import { ReportService } from 'src/app/services/report.service';

@Component({
  selector: 'app-ents',
  templateUrl: './ents.page.html',
  styleUrls: ['./ents.page.scss'],
})
export class EntsPage implements OnInit {

  @ViewChild('feed') feed!: MyEntsComponent;

  backIcon = "../../../assets/icon/back_button.svg";
  backIconBackground = "../../../assets/icon/esquina_izq.svg";
  draftsData: any[] = []
  currentDraft: any;
  currentDraftLocalStorageKey: any;

  constructor(
    private draftReportService: DraftReportService,
    private reportStepsService: ReportStepsService,
    private authService: AuthService,
    private fileService: FileService,
    private router: Router,
    private reportService: ReportService,
  ) {
  }

  ngOnInit() {
  }

  async ionViewDidEnter(): Promise<void> {
    this.feed.refreshFeed();
    await this.loadDrafts()
  }

  printEnts(): void {
    this.draftReportService.printDrafts()
  }

  isUserOffline(): boolean {
    // console.log("User offline?")
    // console.log(this.authService.offlineMode)
    return this.authService.offlineMode
  }

  checkIfDraftsExist(): any {
    let draftKeysList = this.draftReportService.getDraftKeysList()
    if (draftKeysList.length === 0) {
      return false
    } else {
      return true
    }
  }

  async loadDrafts() {
    let draftKeysList = this.draftReportService.getDraftKeysList()
    this.draftsData = []
    console.log("LOAD DRAFTS")
    for ( let draftKey of draftKeysList) {
      let draft = this.draftReportService.getDraft(draftKey)
      draft.localStorageKey = draftKey
      console.log("Draft frontail image", draft.frontal_image)
      draft.localStorageImageUrl = (await this.fileService.loadPicture(draft.frontal_image)).img
      console.log("draft localstorage image url fileservice:", draft.localStorageImageUrl)
      // draft.localStorageImageUrl = this.draftReportService.getImageFromKeyList(draft.scale_image)
      // draft.isDraft = true
      this.draftsData.push(draft)
      // console.log(draft.localStorageImageUrl)
      // console.log(draft.localStorageKey)
    }
  }

  setCurrentDraft(draft: any) {
    this.currentDraft = {...draft}
    this.currentDraftLocalStorageKey = this.currentDraft.localStorageKey
    // Remove attribute used as direct acces to scale_image
    delete this.currentDraft.localStorageImageUrl
    delete this.currentDraft.localStorageKey

    if (this.authService.logedIn) {
      this.currentDraft.user_id = this.authService.user.id
      // console.log("Added user id to offline draft!", this.authService.user.id)
    } else {
      // console.log("Offline mode current draft id is -1")
      this.currentDraft.user_id = -1
    }

    this.printCurrentDraft(this.currentDraft)
    this.reportStepsService.updatePreviewWithDraft(this.currentDraft)
    console.log("Ents page updatePreviewWithDraft:", this.reportStepsService.getPreview())

    // check current user and user id
    // console.log("Current user id:",this.authService.user.id)
    // console.log("steps service preview:",this.reportStepsService.getPreview())

  }

  async submitDraft(draft:any){
    this.setCurrentDraft(draft)
    console.log("[submitDraft] draft", draft)
    console.log("Entra entspage submitdraft")
    console.log("Draft a submit:", draft)
    await this.reportStepsService.submitDraftImages().then(({allUploaded, imageIds}) => {
      if (allUploaded){
        console.log("[submitDraft] imageIds:", imageIds)
        this.reportStepsService.submitDraftReportV3(this.authService.user.id!, imageIds, draft.gps_geocoder, {stage_id: draft.stage_id, foliage_id: draft.foliage_id, poem: draft.poem, tree_type: draft.tree_type, trunk_diameter: draft.trunk_diameter, surrounding_desc: draft.surrounding_desc}).subscribe({
          next: async (result) => {
            console.log("pushReport");
            console.log("result: ", result);
            this.reportStepsService.resetSteps(true, this.currentDraftLocalStorageKey)
            this.draftReportService.removeDraftKeyFromList(this.currentDraftLocalStorageKey)
            this.feed.refreshFeed();
            await this.loadDrafts()
          },
          error: (e) => console.log("failed to add report, err:", e),
                                    complete: () => console.log("complete")
        })
      }
    })
  }

  // async submitDraftV3(draft:any){
  //   this.setCurrentDraft(draft)
  //   // console.log("Entra entspage submitdraft")
  //   // console.log("Draft a submit:", draft)
  //   await this.reportStepsService.submitDraftImages().then((allUploaded: boolean) => {
  //     if (allUploaded){
  //       this.reportStepsService.submitDraftReport().subscribe({
  //         next: async (result) => {
  //           console.log("pushReport");
  //           console.log("result: ", result);
  //           // this.reportStepsService.resetSteps(true, this.currentDraftLocalStorageKey)
  //           // this.draftReportService.removeDraftKeyFromList(this.currentDraftLocalStorageKey)
  //           // this.feed.refreshFeed();
  //           await this.loadDrafts()
  //         },
  //         error: (e) => console.log("failed to add report, err:", e),
  //                                   complete: () => console.log("complete")
  //       })
  //     }
  //   })
  // }

  async removeDraft(draft: any) {
    this.setCurrentDraft(draft)
    // console.log("Removing draft!")
    // console.log("Draft a remover:", draft)
    this.reportStepsService.setDraftImages()
    this.reportStepsService.resetSteps(true, this.currentDraftLocalStorageKey)
    this.draftReportService.removeDraft(this.currentDraftLocalStorageKey)
    await this.loadDrafts()
  }

  printCurrentDraft(draft: any) {
    console.log("draft clickeado:",draft)
  }

  goToDraft(draft: any) {
    this.setCurrentDraft(draft)
    this.router.navigateByUrl("/tabs/draft")
  }

}

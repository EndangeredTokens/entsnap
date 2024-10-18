import { Injectable } from '@angular/core';
import { GeneralUtilityService } from './general-utility.service';
import { inputReport, reportDraft } from '../models/inputReport';
import { FileService } from './file.service';

@Injectable({
  providedIn: 'root'
})
export class DraftReportService {

  constructor(
      private generalUtilityService: GeneralUtilityService,
      private fileService: FileService,

  ) { }

  async storeReportAsDraft(report: inputReport) {
      console.log("[draft-report.service: storeReportAsDraft]")
      const draftImages: [string?, string?, string?, string?] = [];

      const imageSteps = ['frontal', 'leaf', 'trunk', 'scale'];

      for (let i = 0; i < imageSteps.length; i++) {
          const imageStep = imageSteps[i];
          const draftImageName = imageStep + this.generalUtilityService.generateRandomInteger() + ".jpg";
          let imageData = localStorage.getItem(imageStep);
          if (!imageData) {
            continue;
          } else {
            imageData = imageData.replace(/^data:image\/(png|jpg|jpeg);base64,/, '');
          }

          try {
              const fileName = await this.fileService.savePicture(imageData, draftImageName);
              draftImages[i] = fileName;
          } catch (error) {
              console.error(`Error saving image for ${imageStep}:`, error);
              draftImages[i] = ''; // Or handle the error as needed
          }
      }

      const draftReport: reportDraft = {
          ...report,
      }

      draftReport.draftImages = draftImages

      console.log("[draft-report.service: storeReportAsDraft] draftReport:", draftReport)

      const draftReportName = 'draft' + this.generalUtilityService.generateRandomInteger();

      draftReport.name = draftReportName
      localStorage.setItem(draftReportName, JSON.stringify(draftReport)); // store draft report in localstorage

      // debug
      const localStorageDraftReport = localStorage.getItem(draftReportName)
      if (localStorageDraftReport ) {
          console.log("[draft-report.service: storeReportAsDraft] local storage draft report:", JSON.stringify(JSON.parse(localStorageDraftReport), null, 2));
      } else {
          console.log("[draft-report.service: storeReportAsDraft] No local storage draft report found.");
      }

      this.addDraftKeyToList(draftReportName);
  }

  updateDraftReport(reportDraft: reportDraft) {
      if (!reportDraft.name) return

      this.removeDraftKeyFromList(reportDraft.name); // remove current draft
      localStorage.setItem(reportDraft.name, JSON.stringify(reportDraft)); // update draft in localstorage
      this.addDraftKeyToList(reportDraft.name); // add updated draft back to list
  }

  // Image key
  initializeLocalImageKeysList() {
    if (!localStorage.getItem("imageKeysList")) {
      localStorage.setItem("imageKeysList", JSON.stringify([]))
      console.log("Initialized a new imageList")
    }
  }

  getLocalImageKeysList() {
    if (!localStorage.getItem("imageKeysList")){
      this.initializeLocalImageKeysList()
    }
    return JSON.parse(localStorage.getItem("imageKeysList")!)
  }

  addImageKeyToList(image_key: string) {
    let imageList = this.getLocalImageKeysList()
    imageList.push(image_key)
    localStorage.setItem("imageKeysList", JSON.stringify(imageList))
    console.log("Added image key to list")
  }

  clearImageKeysList() {
    let imageList = this.getLocalImageKeysList()
    for (let imageKey of imageList) {
      localStorage.removeItem(imageKey)
    }
    localStorage.setItem("imageKeysList", JSON.stringify([]))
    console.log("Local Storage images deleted!")
  }

  getImageFromKeyList(imageKey: string) {
    return localStorage.getItem(imageKey)!
  }


  // Draft keys
  initializeDraftKeysList() {
    if (!localStorage.getItem("draftKeysList")) {
      localStorage.setItem("draftKeysList", JSON.stringify([]))
      console.log("Initialized a new draft keys list")
    }
  }

  getDraftKeysList() {
    if (!localStorage.getItem("draftKeysList")) {
      this.initializeDraftKeysList()
    }
    return JSON.parse(localStorage.getItem("draftKeysList")!)
  }

  addDraftKeyToList(draftKey: string) {
    let draftKeysList = this.getDraftKeysList()
    draftKeysList.push(draftKey)
    localStorage.setItem("draftKeysList", JSON.stringify(draftKeysList))
    console.log("Added draft key to list")
  }

  clearDraftKeys() {
    let draftKeysList = this.getLocalImageKeysList()
    for (let draftKey of draftKeysList) {
      localStorage.removeItem(draftKey)
    }
    localStorage.setItem("draftKeysList", JSON.stringify([]))
    console.log("Local storage drafts deleted!")
  }

  getDraft(draftKey: string) {
    //console.log("getDraft")
    return JSON.parse(localStorage.getItem(draftKey)!)
  }

  removeDraftKeyFromList(draftKey: string) {
    let draftKeyList = this.getDraftKeysList()
    let newDraftKeyList = draftKeyList.filter((item: string) => item !== draftKey)
    localStorage.setItem("draftKeysList", JSON.stringify(newDraftKeyList))
  }

  printDrafts() {
    console.log("printDrafts")
    let draftKeysList = this.getDraftKeysList()
    for (let draftKey of draftKeysList) {
      console.log("forLoop")
      let draft = this.getDraft(draftKey)
      console.log(draft)
      console.log(draft.scale_image)
    }
  }

  removeDraft(draftLocalStorageKey?: string) {
      this.removeDraftKeyFromList(draftLocalStorageKey!);
      localStorage.removeItem(draftLocalStorageKey!);
      console.log("Removed draft", draftLocalStorageKey);
  }

  async clearDraftPictures() {
        const draftKeyList = this.getDraftKeysList()
        const dirFiles = await this.fileService.readPicturesDir()
        let usedFiles = []
        for (let draftKey of draftKeyList){
            let draft = this.getDraft(draftKey)
            usedFiles.push(draft.frontal_image)
            usedFiles.push(draft.leaf_image)
            usedFiles.push(draft.scale_image)
            usedFiles.push(draft.trunk_image)
        }

        for (let file of dirFiles.files){
            if (!usedFiles.includes(file.name)){
                // remove
                console.log("[clearNotUsedPictures] removing file", file.name)
                this.fileService.deletePicture(file.name)
            }
        }

  }
}

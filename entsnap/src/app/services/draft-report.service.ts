import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DraftReportService {

  constructor() { }

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
    console.log("getDraft")
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
    this.removeDraftKeyFromList(draftLocalStorageKey!)
    console.log("Removed draft", draftLocalStorageKey)
  }
}

import { Injectable } from '@angular/core';
import { Filesystem, Directory, ReadFileResult, ReaddirResult, Encoding} from '@capacitor/filesystem';
import { Base64Img } from '../models/base64img';
//import { DraftReportService } from './draft-report.service';
// import { DraftReportService } from './draft-report.service';

@Injectable({
  providedIn: 'root'
})
export class FileService {
    directory = Directory.Library
    basePath = "pictures/"

    constructor(
    ){}

    async savePicture(pictureBase64: string, filename: string): Promise<string>{
        console.log("[file service - save picture] base64 picture:", pictureBase64);
        const savedFile = await Filesystem.writeFile({
            path: this.basePath + filename,
            data: pictureBase64,
            directory: this.directory,
            recursive: true,
            encoding: Encoding.UTF8
        }).catch((err) => {
            console.log("[savePicture] failed to save picture to file, error:", err)
            return {uri: "default.jpg"} // this file does not exist now
        })
        console.log("savedFile DATA:", savedFile);
        console.log("picture saved to file", filename, "with filepath uri", savedFile.uri)
        return filename
    }

    async loadPicture(filename: string): Promise<Base64Img>{
        const readFile: ReadFileResult = await Filesystem.readFile({
            path: this.basePath + filename,
            directory: this.directory,
            encoding: Encoding.UTF8
        }).catch((err) => {
            console.log("[loadPicture] failed to load picture from file, error:", err)
            return {data: ""}
        })

        console.log("[File service - loadPicture] loading data: ", readFile);

        const data = JSON.parse(readFile.data.toString());
        console.log("img is", data.img);
        // check if the data has the header 'data:image/jpeg;base64, '
        // it seems is deleting this header
        try {
            if (!data.img.startsWith('data:image/jpeg;base64, ')){
                readFile.data = 'data:image/jpeg;base64, ' + readFile.data.toString()
            }
        } catch (error) {
            console.log("failed to fix header of saved picture, error:", error)
        }
        return data;
    }

    async deletePicture(filename: string){
        await Filesystem.deleteFile({
            path: this.basePath + filename,
            directory: this.directory
        }).catch((err) => {
            console.log("[deletePicture] failed to delete picture from file, error:", err)
        })
    }

    async renamePicture(oldFilename: string, newFilename: string){
        // we could use this function if we store the initial picture in file
        // then rename them when saving a draft
        await Filesystem.rename({
            from: this.basePath + oldFilename,
            to: this.basePath + newFilename,
            directory: this.directory,
            toDirectory: this.directory
        }).catch((err) => {
            console.log("[renamePicture] failed to rename picture, error:", err)
        })
    }

    async readPicturesDir(): Promise<ReaddirResult>{
        return await Filesystem.readdir({
            path: this.basePath,
            directory: this.directory
        }).catch((err) => {
            console.log("[readPicturesDir] failed to read pictures, error:", err)
            return {files: []}
        })
    }

    async mkPicturesDir(){
        await Filesystem.mkdir({
            path: this.basePath,
            directory: this.directory,
            recursive: true
        }).catch((err) => {
            console.log("[mkPicturesDir] failed to create dir, error:", err)
        })
    }

    async rmPicturesDir(){
        // optional, we do not use for now
        await Filesystem.rmdir({
            path: this.basePath,
            directory: this.directory,
            recursive: true
        }).catch((err) => {
            console.log("[rmPicturesDir] failed to remove pictures dir, error:", err)
        })
    }

    async requestPermission(): Promise<boolean>{
        const permission = await Filesystem.requestPermissions()
        return permission.publicStorage === "granted"
    }

    async checkPermission(): Promise<boolean>{
        const permission = await Filesystem.checkPermissions()
        return permission.publicStorage === "granted"
    }

    private initializeDraftKeysList() {
        if (!localStorage.getItem("draftKeysList")) {
        localStorage.setItem("draftKeysList", JSON.stringify([]))
        console.log("Initialized a new draft keys list")
        }
    }

    private getDraftKeysList() {
        if (!localStorage.getItem("draftKeysList")) {
            this.initializeDraftKeysList()
        }
        return JSON.parse(localStorage.getItem("draftKeysList")!)
    }

    private getDraft(draftKey: string) {
        console.log("getDraft")
        return JSON.parse(localStorage.getItem(draftKey)!)
    }

    async clearNotUsedPictures(){
        // scan the folder for pictures that are not being used
        // and remove them.
        // a picture is being used if is path is stored in local storage
        // we should call this function in specific times.
        // maybe every time a user log in with valid credentials
        const draftKeyList = this.getDraftKeysList()
        const dirFiles = await this.readPicturesDir()
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
                this.deletePicture(file.name)
            }
        }
        }
}

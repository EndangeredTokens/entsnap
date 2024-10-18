import { Injectable } from '@angular/core';
import { ImageService } from "./image.service";
// import { Plugins } from '@capacitor/core';

// const { CameraPreview } = Plugins

// import { CameraPreview, CameraPreviewOptions, CameraPreviewPictureOptions } from '@capacitor-community/camera-preview';

import {Camera, CameraResultType, CameraSource, CameraPluginPermissions} from '@capacitor/camera';

// const { Camera, Filesystem, Storage } = Plugins

@Injectable({
  providedIn: 'root'
})
export class CameraService {

  image?: string;
  cameraActive = false;

  constructor(
    private imageService: ImageService,
  ) { }

  async takePicture(): Promise<void> {
    const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.Base64,
      quality: 90,
      source: CameraSource.Camera

    });
    // const logoCentral = document.createElement("ion-img");
    // logoCentral.classList.add('logoCentral');
    // logoCentral.innerHTML = '<img id="logoCentral" [src]="frontalIcon" />'

    this.image = `data:image/jpeg;base64, ${capturedPhoto.base64String}`;
    this.imageService.uploadBase64Image({img: this.image});
  }

  async requestPermission(): Promise<void> {
    let perm: CameraPluginPermissions = {
      permissions: ["camera"]
    }
    await Camera.requestPermissions(perm)
  }

  // async openCamera() {
  //   const cameraPreviewOptions: CameraPreviewOptions = {
  //     position: 'rear',
  //     parent: "cameraPreview",
  //     className: "cameraPreview",
  //   };
  //   await CameraPreview.start(cameraPreviewOptions);
  //   this.cameraActive = true;
  // }

  // async stopCamera() {
  //   await CameraPreview.stop();
  //   this.cameraActive = false;
  // }

  // async captureImage() {
  //   const CameraPreviewPictureOptions: CameraPreviewPictureOptions = {
  //     quality: 90,
  //   }
  //   const result = await CameraPreview.capture(CameraPreviewPictureOptions);
  //   this.image = `data:image/jpeg;base64, ${result.value}`;
  //   this.imageService.uploadBase64Image({img: this.image});
  //   // await this.imageService.uploadPhotoNew(this.image);
  //   this.stopCamera()
  // }

  // async flipCamera() {
  //   await CameraPreview.flip()
  // }

  blobToFile(blob: Blob, fileName: string): File {
    var file: any = blob;
    file.lastModifiedDate = new Date();
    file.name = fileName;
    return <File>file;
  }
}

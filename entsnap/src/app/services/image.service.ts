import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
// import { CameraPhoto } from '@capacitor/camera';
import { routes } from './routes';
import { Base64Img } from '../models/base64img';
import { Observable } from 'rxjs';
import { TreeDetection } from '../models/treeDetection';

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  base64data?: string;
  defaultAvatar = 'Firecatch_defaultAvatar.svg';
  defaultImage = 'Firecatch_blankImage.png';
  lastUploadedName?: string;

  constructor(
    private http: HttpClient,
    private routes: routes
  ) { }

  addUrl(image: string): string {
    return `${this.routes.imagesUrl()}/${image}`
  }

  addUrlDefault(): string {
    return `${this.routes.imagesUrl()}/${this.defaultImage}`
  }

  fileToBase64(file: File): string {
    const reader = new FileReader();
    reader.onload = this.handleReaderLoaded.bind(this);
    reader.readAsBinaryString(file)
    return this.base64data!;
  }

  getBase64Data(): string {
    return this.base64data!;
  }

  getDefaultAvatar(): string {
    return this.defaultAvatar;
  }

  getDefaultImage(): string {
    return this.defaultImage;
  }

  getLastUploadedName(): string {
    return this.lastUploadedName!;
  }

  handleReaderLoaded(readEvent: any): void {
    var binaryString = readEvent.target.result;
    this.base64data = btoa(binaryString).split(',')[1];
    console.log(this.base64data);
  }

  SVGtoBase64(source: string): void {
    this.toDataURL(source)
      .then(dataUrl => {
        let url = dataUrl as string
        this.base64data = url.split(',')[1];
      })
  }

  toDataURL = (url: any) => fetch(url)
    .then(res => res.blob())
    .then(blob => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    }));

  uploadImage(file: File): void {
    const formData = new FormData();
    formData.append('file', file);
    this.http.post<any>(this.routes.imagesUrl(), formData)
      .subscribe(
        (res) => {
          console.log("Filename", res.filename);
          this.lastUploadedName = res.filename;
        },
        (err) => console.log(err)
      )
  }
  // // TODO new function
  // async uploadPhoto(cameraPhoto: CameraPhoto): Promise<void> {
  //   const response = await fetch(cameraPhoto.webPath!);
  //   const blob = await response.blob();
  //   const formData = new FormData();
  //   formData.append('file', blob);
  //   console.log("formData", formData.getAll('file'));
  //   this.http.post<any>(this.routes.imagesUrl(), formData)
  //     .subscribe(
  //       (res) => {
  //         console.log("Filename", res.filename);
  //         this.lastUploadedName = res.filename;
  //       },
  //       (err) => console.log(err)
  //     )
  // }

  uploadBase64Image(base64img: Base64Img): void {
    this.http.post<any>(`${this.routes.imagesUrl()}/base64`, base64img)
      .subscribe(
        (res) => {
          console.log("Filename", res.filename);
          this.lastUploadedName = res.filename;
        },
        (err) => console.log(err)
      )
  }

  newUploadImage( base64img: Base64Img ): Observable<any> {
    return this.http.post<any>(`${this.routes.imagesUrl()}/base64`, base64img);
  }

  identifyTree(base64img: Base64Img): Observable<TreeDetection[]>{
    return this.http.post<TreeDetection[]>(`${this.routes.plantnetUrl()}/detect`, base64img)
  }

  async uploadPhotoNew(imageData: string): Promise<void> {
    const blob = await this.convertImageToBlob(imageData);
    const formData = new FormData();
    formData.append('file', blob);
    this.http.post<any>(this.routes.imagesUrl(), formData)
      .subscribe(
        (res) => {
          console.log("Filename", res.filename);
          this.lastUploadedName = res.filename;
        },
        (err) => console.log(err)
      )
  }

  async convertImageToBlob(imageData: string): Promise<Blob> {
    const response = await fetch(imageData);
    return response.blob();
  }

}

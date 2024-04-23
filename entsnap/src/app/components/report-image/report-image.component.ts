import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Address } from 'src/app/models/address';
import { CameraService } from 'src/app/services/camera.service';
import { ImageService } from 'src/app/services/image.service';
import { ReportService } from "src/app/services/report.service";
import { UserService } from 'src/app/services/user.service';
// import { NativeStorage } from '@ionic-native/native-storage/ngx';

@Component({
  selector: 'app-report-image',
  templateUrl: './report-image.component.html',
  styleUrls: ['./report-image.component.scss'],
})
export class ReportImageComponent implements OnInit {

  address?: Address;
  file?: File;
  image?: string;
  imageFrontal?: string;
  imageLeaf?: string;
  imageTrunk?: string;
  imageScale?: string;
  imageUrl?: string;
  lat?: number;
  locName?: string;
  lng?: number;
  uploaded?: boolean;
  uploadedFrontal?: boolean;
  uploadedLeaf?: boolean;
  uploadedTrunk?: boolean;
  uploadedScale?: boolean;
  backIcon = "../../../assets/icon/back_button.svg";
  logo = "../../../assets/icon/logo_ents_images.svg";
  frontalIcon = "../../../assets/icon/example_frontal.svg";
  frontalText = "../../../assets/icon/FRONTAL.svg";
  leafIcon = "../../../assets/icon/example_leaf.svg";
  leafText = "../../../assets/icon/LEAF.svg";
  trunkIcon = "../../../assets/icon/example_trunk.svg";
  trunkText = "../../../assets/icon/TRUNK.svg";
  scaleIcon = "../../../assets/icon/example_scale.png";
  scaleText = "../../../assets/icon/SCALE.svg";

  cameraActive = false;

  constructor(
    private cameraService: CameraService,
    private imageService: ImageService,
    private reportService: ReportService,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    // private nativeStorage: NativeStorage
  ) { }

  async ngOnInit() {
    // this.cameraActive = this.cameraService.cameraActive;
    var user = this.userService.getCurrentUser();
    console.log(user);
    // var position = this.locservice.getMarkedLoc();
    // this.lat = position[0];
    // this.lng = position[1];
    // this.locservice.clearRepMarker();
    // this.locservice.geocodeLatLng(this.lat, this.lng);
    // setTimeout(_ => {
    //   console.log(this.locservice.getLocName());
    //   this.address = this.locservice.address;
    //   console.log("Addres is: ", this.address);
    // }, 3000)
    this.uploadedFrontal = false;
    this.uploadedLeaf = false;
    this.uploadedTrunk = false;
    this.uploadedScale = false;
    await this.openCamera();
  }

  addUrl(image: string): string {
    return this.imageService.addUrl(image);
  }

  addUrlNew(type: string): any {
    const image = localStorage.getItem(type);
    return this.imageService.addUrl(image!);
  }

  postReport(): void {
    var user = this.userService.getCurrentUser();
    console.log(user);
    if (user.is_blocked) {
      alert('Este usuario se encuentra bloqueado');
      this.router.navigateByUrl('/tabs/home');
    }
    const type = +this.route.snapshot.paramMap.get('id')!;
    const report = {
      id: undefined,
      UserId: user.id!,
      acot_validation: 0,
      conaf_validation: 0,
      type: type,
      user_name: user.name!,
      user_avatar: user.avatar!,
      short_description: "",
      description: "",
      date: undefined,
      latitude: 0.0,
      longitude: 0.0,
      address_type: 0,
      address: "",
      street_number: "",
      street_name: "",
      city: "",
      province: "",
      county: "",
      country: "",
      map: "",
      frontal_image: this.imageFrontal!,
      leaf_image: this.imageLeaf!,
      trunk_image: this.imageTrunk!,
      scale_image: this.imageScale!,
      stage: 0,
      foliage: 0,
      tree_type: "",
      trunk_diameter: "",
      surrounding_desc: "",
      poem: "",
      completed: false,
      validated: false,
      minted: false,
      endangered: false,
      hidden: false,
      comments: []
    };
    localStorage.setItem('report', JSON.stringify(report));
    // this.reportService.setPreview(report);
    console.log("DISABLED this.reportService.setPreview(report) BECAUSE IS NOT SOPORTED ANYMORE")
    this.router.navigateByUrl('/tabs/preview');
  }

  async processFile(event: any, type: any) {
    this.file = event.target.files[0];
    console.log("File: ", this.file);

    this.imageService.uploadImage(this.file!);
    setTimeout( (_: any) => {
      const imageName = this.imageService.getLastUploadedName();
      console.log(imageName);
      switch (type) {
        case 'frontal':
          console.log("case frontal");
          this.imageFrontal = imageName;
          this.uploadedFrontal = true;
          localStorage.setItem('frontal', imageName);
          break;
        case 'leaf':
          console.log("case leaf");
          this.imageLeaf = imageName;
          this.uploadedLeaf = true;
          localStorage.setItem('leaf', imageName);
          break;
        case 'trunk':
          console.log("case trunk");
          this.imageTrunk = imageName;
          this.uploadedTrunk = true;
          localStorage.setItem('trunk', imageName);
          break;
        case 'scale':
          console.log("case scale");
          this.imageScale = imageName;
          this.uploadedScale = true;
          localStorage.setItem('scale', imageName);
          break;
        default:
          break;
      }
    }, 3000);
  }

  async takePicture(type: string): Promise<void> {
    console.log("Comenzando a tomar foto")
    await this.cameraService.takePicture()
    console.log("Foto tomada")
    setTimeout( (_ : any) => {
      const imageName = this.imageService.getLastUploadedName();
      console.log(imageName);
      switch (type) {
        case 'frontal':
          console.log("case frontal");
          this.imageFrontal = imageName;
          this.uploadedFrontal = true;
          this.cameraActive = this.cameraService.cameraActive;
          localStorage.setItem('frontal', imageName);
          break;
        case 'leaf':
          console.log("case leaf");
          this.imageLeaf = imageName;
          this.uploadedLeaf = true;
          this.cameraActive = this.cameraService.cameraActive;
          localStorage.setItem('leaf', imageName);
          break;
        case 'trunk':
          console.log("case trunk");
          this.imageTrunk = imageName;
          this.uploadedTrunk = true;
          this.cameraActive = this.cameraService.cameraActive;
          localStorage.setItem('trunk', imageName);
          break;
        case 'scale':
          console.log("case scale");
          this.imageScale = imageName;
          this.uploadedScale = true;
          this.cameraActive = this.cameraService.cameraActive;
          localStorage.setItem('scale', imageName);
          break;
        default:
          break;
      }
    }, 3000)
  }

  async openCamera() {
    // await this.cameraService.openCamera();
    // this.cameraActive = this.cameraService.cameraActive;
  }

  async stopCamera() {
    // await this.cameraService.stopCamera();
    // this.cameraActive = this.cameraService.cameraActive;
  }

  async captureImage() {
    // await this.cameraService.captureImage();
    // this.cameraActive = this.cameraService.cameraActive;
  }

  async flipCamera() {
    // await this.cameraService.flipCamera();
    // this.cameraActive = this.cameraService.cameraActive;
  }

  back(type: string): any {
    switch (type) {
      case 'frontal':
        this.uploadedFrontal = false;
        this.stopCamera();
        break;
      case 'leaf':
        this.uploadedLeaf = false;
        this.stopCamera();
        break;
      case 'trunk':
        this.uploadedTrunk = false;
        this.stopCamera();
        break;
      case 'scale':
        this.uploadedScale = false;
        this.stopCamera();
        break;
      default:
        break;
    }
  }

}

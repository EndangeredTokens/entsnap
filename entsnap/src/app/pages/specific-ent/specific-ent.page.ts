import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ReportService } from 'src/app/services/report.service';
import { Report } from "../../models/report";
import { ImageService } from 'src/app/services/image.service';
import { ReportStepsService } from 'src/app/services/report-steps.service';
import { FileService } from 'src/app/services/file.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-specific-ent',
  templateUrl: './specific-ent.page.html',
  styleUrls: ['./specific-ent.page.scss'],
})
export class SpecificEntPage implements OnInit {
  id!: string;
  // report!: Report;
  report!: any;
  loaded!: boolean;
  tree_type: string = "No tree type specified";
  trunk_diameter: number | string = "No trunk Diameter";
  surrounding_desc: string = "No surrounding desciption";
  poem: string = "No poem";
  frontal_image!: string;
  leaf_image!: string;
  trunk_image!: string;
  scale_image!: string;

  draftFrontalImage!: string;
  draftLeafImage!: string;
  draftTrunkImage!: string;
  draftScaleImage!: string;


  backIcon = "../../../assets/icon/back_button.svg";
  backIconBackground = "../../../assets/icon/esquina_izq.svg";

  isDraft: any;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private reportService: ReportService,
    private imageService: ImageService,
    private reportStepsService: ReportStepsService,
    private fileService: FileService,
    private location: Location,
  ) { }

  async ngOnInit() {
    // this.isDraft = this.route.snapshot.data["isDraft"];
    this.loaded = false;
    // if (this.isDraft) {
    //   console.log("DRAFT SPECIFIC ENT")
    //   this.report = this.reportStepsService.getPreview()!
    //   console.log("Report draft", this.report)
    // }
    //
    // if (!this.isDraft) {
    //   this.route.params.subscribe(params => {
    //     this.id = params['id'].toString().padStart(4, '0');
    //     console.log(this.id);
    //   });
    //   try {
    //     this.reportService.getReportById(parseInt(this.id)).subscribe(
    //       (res: any) => {
    //         console.log('getRepport', res)
    //         const report = res;
    //         this.report = report;
    //
    //         this.tree_type = this.report.tree_type;
    //         this.trunk_diameter = this.report.trunk_diameter;
    //         this.surrounding_desc = this.report.surrounding_desc;
    //         this.poem = this.report.poem;
    //         this.frontal_image = this.report.frontal_image;
    //         this.leaf_image = this.report.leaf_image;
    //         this.trunk_image = this.report.trunk_image;
    //         this.scale_image = this.report.scale_image;
    //         this.loaded = true;
    //       }
    //     );
    //   } catch (error) {
    //     console.error('Error obteniendo reporte:', error);
    //   }
    // }
  }

  async ionViewWillEnter() {
    this.isDraft = this.router.url.includes("/draft")
    // this.isDraft = this.route.snapshot.data["isDraft"];
    console.log("IS DRAFT,", this.isDraft)
    // console.log("ENTRO a SPECIFIC ENT")
    if (this.isDraft) {
      console.log("DRAFT SPECIFIC ENT")
      this.report = this.reportStepsService.getPreview()!
      this.tree_type = this.report.tree_type;
      this.trunk_diameter = this.report.trunk_diameter;
      this.surrounding_desc = this.report.surrounding_desc;
      this.poem = this.report.poem;
      this.loaded = true;
      this.draftFrontalImage = (await this.fileService.loadPicture(this.report.frontal_image)).img
      this.draftLeafImage = (await this.fileService.loadPicture(this.report.leaf_image)).img
      this.draftTrunkImage = (await this.fileService.loadPicture(this.report.trunk_image)).img
      this.draftScaleImage = (await this.fileService.loadPicture(this.report.scale_image)).img
      console.log("Report draft", this.report)
    } else if (!this.isDraft) {
      this.route.params.subscribe(params => {
        this.id = params['id'].toString().padStart(4, '0');
        console.log(this.id);
      });
      try {
        this.reportService.getReportById(parseInt(this.id)).subscribe(
          (res: any) => {
            console.log('getRepport', res)
            const report = res;
            this.report = report;

            if (this.report.data) {
              this.tree_type = this.report.data.tree_type;
              this.trunk_diameter = this.report.data.trunk_diameter;
              this.surrounding_desc = this.report.data.surrounding_desc;
              this.poem = this.report.data.poem;
            }

            this.frontal_image = this.report.images![0].image.image;
            this.leaf_image = this.report.images![1].image.image;
            this.trunk_image = this.report.images![2].image.image;
            this.scale_image = this.report.images![3].image.image;
            this.loaded = true;
          }
        );
      } catch (error) {
        console.error('Error obteniendo reporte:', error);
      }
    }
  }

  getDraftImage() {
    console.log(this.report.frontal_image)
    return this.report.frontal_image
  }

  back() {
    this.location.back();
  }

  // addUrl(image: string): string {
  //   console.log('images', image)
  //   if (image && image.includes("http://") || image.includes("https://")) return image;
  //   let image_v = this.imageService.addUrl(image);
  //   return image_v;
  // }

}

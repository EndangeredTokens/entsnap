import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ReportService } from 'src/app/services/report.service';
import { Report } from "../../models/report";
import { ImageService } from 'src/app/services/image.service';

@Component({
  selector: 'app-specific-ent',
  templateUrl: './specific-ent.page.html',
  styleUrls: ['./specific-ent.page.scss'],
})
export class SpecificEntPage implements OnInit {
  id!: string;
  report!: Report;
  loaded!: boolean;
  tree_type!: string;
  trunk_diameter!: string;
  surrounding_desc!: string;
  poem!: string;
  frontal_image!: string;
  leaf_image!: string;
  trunk_image!: string;
  scale_image!: string;


  backIcon = "../../../assets/icon/back_button.svg";
  backIconBackground = "../../../assets/icon/esquina_izq.svg";

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private reportService: ReportService,
    private imageService: ImageService,
  ) { }

  async ngOnInit() {
    this.loaded = false;
    this.route.params.subscribe(params => {
      this.id = params['id'].toString().padStart(4, '0');
      console.log(this.id);
    });
    try {
      this.reportService.getReportById(parseInt(this.id)).subscribe(
        (data) => {
          this.report = data!;
          this.tree_type = this.report.tree_type;
          this.trunk_diameter = this.report.trunk_diameter;
          this.surrounding_desc = this.report.surrounding_desc;
          this.poem = this.report.poem;
          this.frontal_image = this.report.frontal_image;
          this.leaf_image = this.report.leaf_image;
          this.trunk_image = this.report.trunk_image;
          this.scale_image = this.report.scale_image;
          this.loaded = true;
        }
      );
    } catch (error) {
      console.error('Error obteniendo reporte:', error);
    }
  }

  back() {
    this.router.navigateByUrl(`/tabs/ents`);
  }

  // addUrl(image: string): string {
  //   console.log('images', image)
  //   if (image && image.includes("http://") || image.includes("https://")) return image;
  //   let image_v = this.imageService.addUrl(image);
  //   return image_v;
  // }

}

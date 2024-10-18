import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Report } from 'src/app/models/report';
import { LocationV2Service } from 'src/app/services/location.v2.service';
import { ReportService } from 'src/app/services/report.service';
import { UserService } from 'src/app/services/user.service';
import { environment } from 'src/environments/environment';
import { MultiLanguageService } from 'src/app/services/multi-language.service';

@Component({
  selector: 'app-public-profile',
  templateUrl: './public-profile.page.html',
  styleUrls: ['./public-profile.page.scss'],
})
export class PublicProfilePage implements OnInit {

  backIcon = "../../../assets/icon/back_button.svg";
  backIconBackground = "../../../assets/icon/esquina_izq.svg";
  logo = "../../../assets/img/account-logo.svg";

  userEmail!: string;

  user: any;

  countries: any[] = [];

  userReports: any[] = [];

  constructor(
    private userService: UserService,
    private route: ActivatedRoute,
    private locationService: LocationV2Service,
    private reportService: ReportService,
    private location: Location,
    private multiLanguageService: MultiLanguageService,
  ) { }

  ngOnInit() {
    this.userService.getCountryList().subscribe(
      res => {
        this.countries = res.data;
      }
    );

    this.route.queryParams.subscribe(
      params => {
        this.userEmail = params['userEmail'];
        console.log("[Public Profile Page OnInit] userEmail:", this.userEmail);
      }
    )

    this.userService.getUserByEmail(this.userEmail).subscribe(
      userData => {
        this.user = userData.data;
        this.loadEnts();
      }
    )
    
    console.log("[Public Profile Page OnInit] user:", this.user);
  }

  async loadEnts() {
    this.reportService.getReports(this.user.id).subscribe(
      res => {
        res.forEach((report: Report) => {
          this.userReports.push(report);
        });
      }
    );
  }

  goBack() {
    this.location.back();
  }

  getFrontalImg(images: any) {
    return images.find((imageElement: { image: any; }) => imageElement.image.type_id == 4).image.image_small;
  }
}
  

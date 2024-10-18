import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GpsGeocoder } from 'src/app/models/gpsGeocoder';
import { LocationV2Service } from 'src/app/services/location.v2.service';
import { ReportStepsService } from 'src/app/services/report-steps.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-report-map-new',
  templateUrl: './report-map-new.page.html',
  styleUrls: ['./report-map-new.page.scss'],
})
export class ReportMapNewPage implements OnInit {

  prevLocation?: GpsGeocoder | null | undefined
  currentTreePosition = "";
  newTreePosition= "";
  name = "mapreport";
  active = false;

  orientationAngle: number | null = 0;

  constructor(
    private locationService: LocationV2Service,
    private userService: UserService,
    private reportStepsService: ReportStepsService,
    private router: Router,
  ) { }

  async ngOnInit() {
    // await this.initMap()
    console.log("[report-map-new.page ngOnInit] initMap", this.name)
    await this.locationService.initMap(this.name, false, true, this.userService.getCurrentUser().id!, true, undefined).then(() => {
      this.active = true
    })
  }

  ngOnDestroy() {
    console.log("[report-map-new.page ngOnDestroy] set inactive the map")
    this.active = false
  }

  goToReportInput() {
    this.router.navigateByUrl("/tabs/register-tree-input")
  }

  @HostListener('window:deviceorientationabsolute', ['$event'])
  handleOrientation(event: DeviceOrientationEvent) {
    const alpha = event.alpha;
    
    this.orientationAngle = alpha;
  }
}

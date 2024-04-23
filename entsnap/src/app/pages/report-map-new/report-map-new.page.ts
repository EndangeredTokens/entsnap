import { Component, OnInit } from '@angular/core';
import { LocationV2Service } from 'src/app/services/location.v2.service';

@Component({
  selector: 'app-report-map-new',
  templateUrl: './report-map-new.page.html',
  styleUrls: ['./report-map-new.page.scss'],
})
export class ReportMapNewPage implements OnInit {

  prevLocation?: google.maps.LatLng | null | undefined
  name = "mapreport";
  active = false;

  constructor(
    private locationService: LocationV2Service
  ) { }

  async ngOnInit() {
    // await this.initMap()
    console.log("[report-map-new.page ngOnInit] initMap", this.name)
    await this.locationService.initMap(this.name, false, true).then(() => {
      this.active = true
    })
  }

  async ionViewWillEnter() {
    console.log("[report-map-new.page ionViewWillEnter] enable the watcher")
    await this.locationService.startPositionWatcher().then(() => {
      console.log("[report-map-new.page ionViewWillEnter] watcher started")
    })
  }

  async ionViewWillLeave() {
    console.log("[report-map-new.page ionViewWillLeave] disable the watcher")
    await this.locationService.stopPositionWatcher().then(() => {
      console.log("[report-map-new.page ionViewWillLeave] watcher stopped")
    })
  }

  ngOnDestroy() {
    console.log("[report-map-new.page ngOnDestroy] set inactive the map")
    this.active = false
  }
}

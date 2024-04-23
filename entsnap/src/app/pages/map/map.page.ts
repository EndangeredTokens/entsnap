import { Component, OnInit } from '@angular/core';
import { LocationV2Service } from 'src/app/services/location.v2.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
})
export class MapPage implements OnInit {

  prevLocation?: google.maps.LatLng | null | undefined
  name = "map";
  active = false;

  constructor(
    private locationService: LocationV2Service
  ) { }

  async ngOnInit() {
    // await this.initMap()
    console.log("[report-map-new.page ngOnInit] initMap")
    await this.locationService.initMap(this.name, true, false).then(() => {
      this.active = true
    })
  }

  async ionViewWillEnter() {
    console.log("[report-map-new.page ionViewWillEnter] enable the watcher")
    await this.locationService.startPositionWatcher().then(() => {
      console.log("[report-map-new.page ionViewWillEnter] watcher started")
    })
    console.log("[report-map-new.page ionViewWillEnter] center map")
    let mapData = this.locationService.findMapDataByName(this.name)
    if (mapData) {
      this.locationService.fitMapToCircle(mapData)
    }

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

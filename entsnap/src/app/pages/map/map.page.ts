import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { LocationV2Service } from 'src/app/services/location.v2.service';
import { EntModalComponent } from 'src/app/components/ent-modal/ent-modal.component';
import { UserService } from 'src/app/services/user.service';
import { ActivatedRoute } from '@angular/router';


// @Injectable({
//     providedIn: 'root'
// })
@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
})
export class MapPage implements OnInit {

  prevLocation?: google.maps.LatLng | null | undefined
  name = "map";
  active = false;

  userId?: number;

  orientationAngle: number | null = 0;

  selectedEntId?: number | null;

  markerClickSubscription?: Subscription
  markerDismissSubscription?: Subscription;

  @ViewChild(EntModalComponent) EntModalComponent?: EntModalComponent;

  constructor(
    private locationService: LocationV2Service,
    private userService: UserService,
    private activatedRoute: ActivatedRoute,
  ) { }

  async openModal(entId: any, allowValidateEnt: any) {
    try {
      this.EntModalComponent?.dismissModal();
    } catch {
      console.log("There is no pane opened.")
    } finally {
      this.EntModalComponent?.setEntId(entId)
      this.EntModalComponent?.presentModal();
    }
    
    // console.log(entId)
  }
  
  async ngOnInit() {
    // await this.initMap()
    // console.log("[report-map-new.page ngOnInit] initMap")
    // await this.locationService.initMap(this.name, true, false).then(() => {
    //   this.active = true
    // })

    this.userId = this.userService.getCurrentUser().id;
    this.markerClickSubscription = this.locationService.markerClickEvent.subscribe((markerData) => {
      console.log("MARKER CLICK: ", markerData.entId)
      if (this.EntModalComponent?.modal?.isPanePresented()) {
        this.EntModalComponent?.dismissModal();
        console.log("Pane was closed");
      }
      this.openModal(markerData.entId, markerData.allowEntValidation)
    })
    this.markerDismissSubscription = this.locationService.mapClickEvent.subscribe(() => {
      console.log("Modal dismiss");
      try {
        this.EntModalComponent?.dismissModal();
      } catch {
        console.log("There is no pane opened.")
      }
    })
    // this.listenForOutsideClicks()
  }

  async ionViewWillEnter() {
    this.selectedEntId = this.activatedRoute.snapshot.queryParams['entId'];
    console.log("[map.page ionViewWillEnter] center map")
    this.active = false
    await this.locationService.initMap(this.name, true, false, this.userId!, false, this.selectedEntId ? this.selectedEntId : undefined).then(() => {
      this.active = true;
    })
    
  }

  ionViewDidLeave() {
    console.log("[map page - ionViewDidLeave] leaving map page");
    this.EntModalComponent?.modal?.destroyResets();
  }

  ngOnDestroy() {
    console.log("[report-map-new.page ngOnDestroy] set inactive the map")
    this.active = false
  }


  @HostListener('window:deviceorientationabsolute', ['$event'])
  handleOrientation(event: DeviceOrientationEvent) {
    const alpha = event.alpha;
    
    this.orientationAngle = alpha;
  }
  // listenForOutsideClicks() {
  //   // Add event listener to document body to detect clicks outside the modal
  //   document.body.addEventListener('click', (event) => {
  //     console.log("click bodu")
  //     // Check if the click occurred outside the modal
  //     if (!this.elementRef.nativeElement.contains(event.target)) {
  //       // Set isModalOpen to false when clicked outside the modal
  //       // this.closeModal();
  //       this.isModalOpen = false
  //     }
  //   });
  // }
}

import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { LocationV2Service } from 'src/app/services/location.v2.service';
import { EntModalComponent } from 'src/app/components/ent-modal/ent-modal.component';
import { UserService } from 'src/app/services/user.service';
import { ActivatedRoute, Router } from '@angular/router';


// @Injectable({
//     providedIn: 'root'
// })
@Component({
  selector: 'app-map-proof-of-life',
  templateUrl: './map-proof-of-life.page.html',
  styleUrls: ['./map-proof-of-life.page.scss'],
})
export class MapPage implements OnInit {

  prevLocation?: google.maps.LatLng | null | undefined
  name = "mapProofOfLife";
  active = false;

  userId?: number;

  orientationAngle: number | null = 0;

  lat?: number | null;
  lng?: number | null;
  draftKey?: string | null;

  markerClickSubscription?: Subscription
  markerDismissSubscription?: Subscription;

  @ViewChild(EntModalComponent) EntModalComponent?: EntModalComponent;

  constructor(
    private locationService: LocationV2Service,
    private userService: UserService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
  ) { }

  async openModal(entId: any, allowValidateEnt: any) {
    try {
      this.EntModalComponent?.dismissModal();
    } catch {
      console.log("There is no pane opened.")
    } finally {
      this.EntModalComponent?.setEntId(entId);
      if (this.draftKey) {
        this.EntModalComponent?.setDraftKey(this.draftKey);
      }
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
    this.lat = this.activatedRoute.snapshot.queryParams['lat'];
    this.lng = this.activatedRoute.snapshot.queryParams['lng'];
    this.draftKey = this.activatedRoute.snapshot.queryParams['draftKey'];
    console.log("[map.page ionViewWillEnter] center map")
    this.active = false
    await this.locationService.initMap(this.name, true, false, this.userId!, false, undefined).then(() => {
      this.active = true;
    })

    if (this.lat && this.lng) {
      this.locationService.setCenter(this.lat, this.lng);
    }
  }

  ngOnDestroy() {
    console.log("[report-map-new.page ngOnDestroy] set inactive the map")
    this.active = false
  }

  goToMyTrees() {
    this.router.navigateByUrl("/tabs/my-trees");
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

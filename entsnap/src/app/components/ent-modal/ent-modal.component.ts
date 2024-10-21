import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { IonModal } from '@ionic/angular';
import { ReportService } from 'src/app/services/report.service';
import { Router } from '@angular/router';
import { LocationV2Service } from 'src/app/services/location.v2.service';
import { LoadingService } from 'src/app/services/loading.service';
import { environment } from 'src/environments/environment';
import { UserService } from 'src/app/services/user.service';
import { ProofOfLifePopUpComponent } from '../proof-of-life-pop-up/proof-of-life-pop-up.component';
import { ReportStepsService } from 'src/app/services/report-steps.service';
import { CupertinoPane } from 'cupertino-pane';
import { Platform } from '@ionic/angular';

@Component({
    selector: 'app-ent-modal',
    templateUrl: './ent-modal.component.html',
    styleUrls: ['./ent-modal.component.scss'],
})
export class EntModalComponent implements OnInit {
    @Input() title!: string;
    @Input() content!: string;

  @ViewChild(CupertinoPane) modal?: CupertinoPane;
  @ViewChild(ProofOfLifePopUpComponent) ProofOfLifePopUpComponent?: ProofOfLifePopUpComponent;

  isOpen: boolean = false;
  entId: any;
  report: any;
  entName: string = 'Unknown';
  draftKey: string | undefined;
  proofOfLifeInRange = false;

  timerInCooldown = false;

  inPopupRange = false;

  popupAlreadyShowed = false;

    constructor(
        private reportService: ReportService,
        private router: Router,
        private locationService: LocationV2Service,
        private loadingService: LoadingService,
        private reportStepsService: ReportStepsService,
        private platform: Platform
    ) {}

    ngOnInit() {
        console.log('Ent modal inicializado');
        
    }

    ionViewDidEnter() {
        console.log('Ent Modal did Enter');
    }

    setEntId(entId: any) {
        console.log('setEntId', entId);
        this.entId = entId;
    }

    setDraftKey(draftKey: string) {
      this.draftKey = draftKey;
    }

  dismissModal() {
    this.locationService.changeMarkerIcon();
    this.modal?.hide();
    this.report = null
  }

  changeMarkerIcon() {
    console.log("[Ent modal component - changeMarkerIcon] closing modal...");
    this.locationService.changeMarkerIcon();
  }

  async presentModal() {
    if (!this.modal) {
      this.modal = new CupertinoPane('.modal-container', { 
        modal: true,
        backdrop: false,
        buttonDestroy: false,
        cssClass: 'ent-modal-pane'
      });
    }

    this.report = null
    await this.getEntIdData().catch(error => {
      console.log("presentModal error:", error)
    })
    console.log("Obtieniendo datos ent")
    this.modal!.present({animate: true});

    console.log("Presentado modal")
  }
  

  async getEntIdData() {
    return new Promise((resolve, reject) => {
      this.reportService.getReportById(parseInt(this.entId)).subscribe({
        error: (err: any) => {
          reject(err)
        }, next: (data) => {
          this.report = data
          console.log("[getEntIdData] report: ", this.report)
          
          resolve(data)
        }
      })
      
    })
    

  }
  updateEntName() {
    return this.reportService.updateEntName(this.report);
  }
  

    goToEnt() {
        this.dismissModal();
        this.router.navigateByUrl(`/tabs/tree-page/${this.entId}`);
    }

    validateEnt() {
        console.log('ir a validar ent / perfil');
        const accuracy = 999;
        this.reportStepsService.setProofOfLIfeReportId(this.entId);
        console.log(
            '[validateEnt] reportStepsService.proofOfLifeReportId:',
            this.reportStepsService.proofOfLifeReportId,
        );

        if (this.draftKey) {
          this.dismissModal();
          this.router.navigate(
            [`tabs/confirm/${this.entId}`],
            { queryParams: { draftKey: this.draftKey } }
          );
        }

        if (
            this.locationService.position.coords.accuracy >
            environment.accuracyTolerance
        ) {
            this.loadingService.showNotificationBadGpsPrecision();
            setTimeout(() => {
                this.loadingService.dismissNotification();
            }, 1000);
        } else if (!this.locationService.allowValidateEnt) {
            this.loadingService.showNotificatinNonIntersection();
            setTimeout(() => {
                this.loadingService.dismissNotification();
            }, 1000);
        } else {
            this.dismissModal();
            this.router.navigateByUrl(`tabs/validate/${this.entId}`);
        }
    }

  isProofOfLifeButtonDisabled() {
    return this.locationService.position.coords.accuracy > 10 || !this.locationService.allowValidateEnt
  }

  getEntImage() {
    if (!this.report) return

    const image = this.report?.images.find((imageElement: { image: any; }) => imageElement.image.type_id == 4).image.image_small; 

    return image;
  }

  async openPopup() {
    if (this.inPopupRange && !this.timerInCooldown && !this.popupAlreadyShowed && this.platform.is("ios")) {
      await this.ProofOfLifePopUpComponent?.presentModal().then(() => {
        this.popupAlreadyShowed = true;
        this.timerInCooldown = true;
      })
      navigator.vibrate(1000);

      setTimeout(() => {
        this.timerInCooldown = false;
      }, 10000);
    }

    if (!this.inPopupRange) {
      this.popupAlreadyShowed = false;
    }
  }
  
  getEntDistance() : string{
    const entPostion = {
      lat: this.report?.gps_geocoder.latitude,
      lon: this.report?.gps_geocoder.longitude 
    };

    const currentPosition = {
      lat: this.locationService.currentPosition.lat,
      lon: this.locationService.currentPosition.lon,
    };

    let distance = this.locationService.distance(
      entPostion.lat, entPostion.lon,
      currentPosition.lat, currentPosition.lon
    );

    distance = Math.round(distance * 10) / 10;

    if (this.draftKey) {
      this.proofOfLifeInRange = true;
    } else {
      this.proofOfLifeInRange = distance <= environment.proofOfLifeRange;
    }

    this.inPopupRange = distance > environment.proofOfLifeRange && distance <= environment.proofOfLifeRange * 1.5;

    this.openPopup();

    if (distance >= 1000) {
      distance = Math.round((distance / 1000) * 10) / 10;
      return distance+" km";
    } else {
      return distance+" m";
    }
  }

  goToPublicProfile() {
    this.router.navigateByUrl(`/tabs/public-profile?userEmail=${this.report?.user.email}`);
    this.dismissModal();
  }
}

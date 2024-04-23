import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ReportStepsService } from 'src/app/services/report-steps.service';
import { ReportDetailComponent } from 'src/app/components/report-detail/report-detail.component';
import { LocationV2Service } from 'src/app/services/location.v2.service';

@Component({
  selector: 'app-preview',
  templateUrl: './preview.page.html',
  styleUrls: ['./preview.page.scss'],
})
export class PreviewPage {

  backIcon = "../../../assets/icon/back_button.svg";
  backIconBackground = "../../../assets/icon/esquina_izq.svg";

  public alertButtons = [
    {
      text: 'Reset',
      role: 'cancel',
      handler: () => {
        console.log("reset and leave")
        console.log("localstorage variable nextUrlAfterLeave", localStorage.getItem("nextUrlAfterLeave"))
        localStorage.setItem("triggerAlert", "false")
        this.reportStepsService.resetSteps()
        this.reportStepsService.deactivateTriggerAlertFlag()
      },
    },
    {
      text: 'Continue',
      role: 'confirm',
      handler: () => {
        console.log("continue editing")
        console.log("localstorage variable nextUrlAfterLeave", localStorage.getItem("nextUrlAfterLeave"))
        this.reportStepsService.deactivateTriggerAlertFlag()
      },
    },
  ];

  constructor(
    private reportStepsService: ReportStepsService,
    private router: Router,

    private locationService: LocationV2Service
  ) { }

  shouldTriggerAlert() {
    return this.reportStepsService.shouldTriggerAlert()
  }

  async ionViewWillEnter() {
    await this.locationService.startPositionWatcher()
  }

  async ionViewWillLeave() {
    await this.locationService.stopPositionWatcher()
  }

}

import { ActivatedRouteSnapshot, CanActivateFn, CanDeactivateFn, Route, Router, RouterStateSnapshot} from '@angular/router';
import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ICanComponentDeactivate } from '../utils/candeactivate.interface';
import { ReportService } from '../services/report.service';
import { ReportStepsService } from '../services/report-steps.service';
import { CameraOverlayService } from '../services/camera-overlay.service';
import { RouteHistoryService } from '../services/route-history.service';
import { Location, LocationStrategy, PathLocationStrategy } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
class LeaveTreeImageGuard {

  constructor(
      private reportSteps: ReportStepsService,
      private routeHistoryService: RouteHistoryService,
  ) { }

  canDeactivate(nextUrl: string): Observable<boolean> {
      // console.log("LeaveTreeGuard canDeactivate without component")
      // console.log("LeaveTreePreviewGuard reportService.currentStep", this.reportSteps.getCurrentStep())

      if (this.reportSteps.checkCanLeaveReportTreeImage(nextUrl)){
        // no need to trigger alert
        this.reportSteps.deactivateTriggerAlertFlag()
      } else {
        // should trigger alert 
        this.reportSteps.activateTriggerAlertFlag()
      }
      return of(true) // and will always allow to leave the page
  }

  canActivate(): Observable<boolean>{
    console.log("[should trigger alert guard]", this.routeHistoryService.getPrevUrl(), this.reportSteps.checkCanActivate(this.routeHistoryService.getPrevUrl()!))
    if (this.reportSteps.checkCanActivate(this.routeHistoryService.getPrevUrl()!)){
      this.reportSteps.activateTriggerAlertFlag()
    } else {
      this.reportSteps.deactivateTriggerAlertFlag()
    }
    return of(true)
  }
}

@Injectable({
  providedIn: 'root'
})
class LeaveTreePreviewGuard {

  constructor(
      private reportSteps: ReportStepsService
  ) { }

  canDeactivate(nextUrl: string): Observable<boolean> {
      // console.log("LeaveTreePreviewGuard canDeactivate without component")
      // console.log("LeaveTreePreviewGuard reportService.currentStep", this.reportSteps.getCurrentStep())

      if (this.reportSteps.checkCanLeaveReportTreePreview(nextUrl)){
        // can leave, probable because the report was submitted
        // disable the trigger
        this.reportSteps.deactivateTriggerAlertFlag()
        return of(true)
      } else {
        // cannot leave, probably because is still in progress
        // trigger the allert
        this.reportSteps.activateTriggerAlertFlag()
        // this.reportSteps.setNextUrlAfterLeave(nextUrl)
        return of(true)
      }
  }
}

export const canLeaveTreeImageGuard: CanDeactivateFn<ICanComponentDeactivate> = (
  component: ICanComponentDeactivate, 
  currentRoute: ActivatedRouteSnapshot,
  currentState: RouterStateSnapshot,
  nextState: RouterStateSnapshot): Observable<boolean> => {
  return inject(LeaveTreeImageGuard).canDeactivate(nextState.url);
}

export const canLeaveTreePreviewGuard: CanDeactivateFn<ICanComponentDeactivate> = (
  component: ICanComponentDeactivate, 
  currentRoute: ActivatedRouteSnapshot,
  currentState: RouterStateSnapshot,
  nextState: RouterStateSnapshot): Observable<boolean> => {
  return inject(LeaveTreePreviewGuard).canDeactivate(nextState.url);
}

export const shouldTriggerAlert: CanActivateFn = (): Observable<boolean> => {
  return inject(LeaveTreeImageGuard).canActivate();
}
import { ActivatedRouteSnapshot, CanDeactivateFn, Router, RouterStateSnapshot} from '@angular/router';
import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ICanComponentDeactivate } from '../utils/candeactivate.interface';
import { ReportService } from '../services/report.service';
import { ReportStepsService } from '../services/report-steps.service';
import { CameraOverlayService } from '../services/camera-overlay.service';

@Injectable({
  providedIn: 'root'
})
class CameraGuard {
  constructor(
      private cameraOverlayService: CameraOverlayService
  ) { }
  
  async stopCamera(): Promise<boolean> {
    console.log("[CameraGuard] stopping camera")
    await this.cameraOverlayService.stopCamera() // THIS IS ASYNC
    return true // and will always allow to leave the page
  }
}

export const protectLeaveCameraGuard: CanDeactivateFn<ICanComponentDeactivate> = async (): Promise<boolean> => {
  return await inject(CameraGuard).stopCamera()
}


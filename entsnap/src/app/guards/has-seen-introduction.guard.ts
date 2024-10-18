import { Injectable, inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { StorageService } from '../services/storage.service';

@Injectable({
  providedIn: 'root'
})
export class HasSeenIntroductionGuardClass {
  constructor(
    private router: Router,
    private storageService: StorageService,
  ) {}

  async canActivate(): Promise<boolean> {
    console.log("[HasSeenIntroductionGuard] start...")
    const hasSeenIntroduction = await this.storageService.get("hasSeenIntroduction")
    if (hasSeenIntroduction !== null && hasSeenIntroduction !== undefined) {
      this.router.navigate(['/login'])
      return true
    } else {
      this.router.navigate(['/introduction'])
      return false
    }
  }

}


export const HasSeenIntroductionGuard: CanActivateFn = (): Promise<boolean> => {
  return inject(HasSeenIntroductionGuardClass).canActivate()
}
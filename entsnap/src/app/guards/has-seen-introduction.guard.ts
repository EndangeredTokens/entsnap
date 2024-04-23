import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { StorageService } from '../services/storage.service';

@Injectable({
  providedIn: 'root'
})
export class HasSeenIntroductionGuard implements CanActivate {
  constructor(
    private router: Router,
    private storageService: StorageService,
  ) {}

  async canActivate(): Promise<boolean> {
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

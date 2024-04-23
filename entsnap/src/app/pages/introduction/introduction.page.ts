import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { register } from 'swiper/element/bundle';
import { StorageService } from 'src/app/services/storage.service';
register();


@Component({
  selector: 'app-introduction',
  templateUrl: './introduction.page.html',
  styleUrls: ['./introduction.page.scss'],
})
export class IntroductionPage  implements OnInit {

  constructor(
    private router: Router,
    private storageService: StorageService
  ) { }

  async ngOnInit() {
    console.log("CRASH ERROR: RUN INTRODUCION")
    const hasSeenIntroduction = await this.storageService.get('hasSeenIntroduction')
    if (hasSeenIntroduction !== null && hasSeenIntroduction !== undefined) {
      if (hasSeenIntroduction) {
        this.router.navigate(['/login'])
      }
    }
  }

  async goToLogin() {
    await this.storageService.set('hasSeenIntroduction', true)
    this.router.navigate(['/login']);
  }

}

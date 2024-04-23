import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ProfileInfoComponent } from 'src/app/components/profile-info/profile-info.component';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  @ViewChild('profile') profile?: ProfileInfoComponent;
  backIcon = "../../../assets/icon/back_button.svg";
  backIconBackground = "../../../assets/icon/esquina_izq.svg";
  logo = "../../../assets/icon/logo_ents_home.svg";

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() {
  }

  ionViewDidEnter(): void {
    this.profile?.ionViewDidEnter();
    console.log("is offline mode?:", this.authService.offlineMode)

  }

  isOfflineMode() {
    return this.authService.offlineMode
  }

  offlineModeLogout(){
    // to logout from offline mode, simply set the variable to false
    // and then redirect to login mage
    this.authService.offlineMode = false
    // make sure to set logedIn as false, just for sanity
    this.authService.logedIn = false
    // then redirect
    this.router.navigateByUrl('/login');
  }

}

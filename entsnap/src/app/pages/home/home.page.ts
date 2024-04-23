import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage {

  backIconBackground = "../../../assets/icon/esquina_der.svg";
  backIconBackgroundBig = "../../../assets/icon/esquina_der_grande.svg";
  menuIcon = "../../../assets/icon/menu.svg";
  exitIcon = "../../../assets/icon/exit_button.svg";
  show: boolean = false;
  user: any;

  constructor(
    private router: Router,
    private userService: UserService,
  ) { 
    this.user = userService.getCurrentUser();
  }

  menu(): void {
    this.show = !this.show;
  }

  logout(): void {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    this.router.navigateByUrl('/login');
  }

}

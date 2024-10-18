import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-validate-otp',
  templateUrl: './validate-otp.component.html',
  styleUrls: ['./validate-otp.component.scss'],
})
export class ValidateOtpComponent  implements OnInit {

  otpCodeInput: string = "";

  invalidCodeMessage: string = "";

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
  ) { }

  ngOnInit() {}

  verifyOtpCodeInput() {
    this.invalidCodeMessage = ""
    console.log("OTP Code:", this.otpCodeInput)
    this.authService.validateTotpToken({ email: this.authService.registerEmail, totpToken: this.otpCodeInput}).subscribe(
      response => {
        console.log("Response from validating TOTP token:", response)
        this.invalidCodeMessage = ""
        this.registerUser()
        // this.router.navigateByUrl("/login")
      },
      error => {
        console.error("Error validating TOTP token", error)
        // Add error in case code is invalid
        this.invalidCodeMessage = error.error.message
      }
    )

  }

  registerUser() {
    this.authService.signUp({ email: this.authService.registerEmail, password: this.authService.registerPassword, role: 0 })
      .subscribe(
        user => {
          this.userService.setUserData(user)
          console.log("the user is:", user);
          console.log("the user in userService.current is:", this.userService.getCurrentUser())
          console.log("a user loged in?:", this.authService.isLogedIn())
          if (this.authService.isLogedIn()) {
            console.log("redirect to home");
            localStorage.setItem("auth_token", user.auth_token);
            this.router.navigateByUrl('/tabs/home');
          }
          else {
            alert("fail to login the user")
          }
        },
        err => {
          console.log("error", err)
          alert("User already exists!")
        }
      )
  }

  redirectToLogin() {
    this.router.navigateByUrl('/login');
  }


}

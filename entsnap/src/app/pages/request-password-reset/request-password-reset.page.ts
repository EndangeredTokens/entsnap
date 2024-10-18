// import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { Validators, FormGroup, FormControl } from '@angular/forms';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-request-password-reset',
  templateUrl: './request-password-reset.page.html',
  styleUrls: ['./request-password-reset.page.scss'],
})
export class RequestPasswordResetPage implements OnInit {
  isTotpCodeValid: boolean | null = null;
  isTotpTokenSent: boolean | null = null;

  isCooldownRunning: boolean = false;
  cooldownTime: number = 122;
  disableSendTotpButton: boolean = false;

  showRevalidateTotpTokenMessage: boolean = false;

  // emailForm!: FormGroup;
  userUpdateForm: FormGroup = new FormGroup({
    email: new FormControl('', [
      Validators.required,
      Validators.pattern(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$$/),
    ]),
    totpToken: new FormControl('', [
      Validators.required,
      Validators.pattern(/^\d{6}$/),
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(8), // Adjust as needed
    ]),
    confirmPassword: new FormControl('', [
      Validators.required,
      Validators.minLength(8), // Adjust as needed
    ]),
  });

  constructor(
    private authService: AuthService,
    private router: Router,
    private userService: UserService,
    // private formBuilder: FormBuilder,
  ) {}

  ngOnInit() {}

  startCooldown() {
    this.isCooldownRunning = true;
    setTimeout(() => {
      this.isCooldownRunning = false;
    }, this.cooldownTime * 1000);
  }

  sendTotpToken(): void {
    // if (this.isCooldownRunning) return
    this.disableSendTotpButton = true
    const email = this.userUpdateForm.get('email')?.value;
    console.log('SENDING TOTP TOKEN to email:', email);
    console.log(this.userUpdateForm.controls['email'].errors);
    this.authService.sendTotpEmail({ email }).subscribe(
      (response) => {
        console.log('Response from sending TOTP token:', response);
        this.disableSendTotpButton = false
        this.startCooldown()
        // Do not redirect, validation in the same form
        // this.router.navigateByUrl('/validate-otp');
      },
      (error) => {
        console.error('Error Sending TOTP token', error);
        this.isTotpTokenSent = false
        this.disableSendTotpButton = false
      },
    );
  }

  validateTotpCode() {
    const totpCode = this.userUpdateForm.get('totpToken')?.value;
    const email = this.userUpdateForm.get('email')?.value;
    console.log('[validateTotpCodeInput] totpCode:', totpCode);
    console.log('[validateTotpCodeInput] email:', email);
    console.log('OTP Code:', totpCode);
    this.authService
      .validateTotpToken({
        email: email,
        totpToken: totpCode,
      })
      .subscribe(
        (response) => {
          console.log('Response from validating TOTP token:', response);
          this.isTotpCodeValid = true;
          // this.invalidCodeMessage = ""
          // this.registerUser()
          // this.router.navigateByUrl("/login")
        },
        (error) => {
          console.error('Error validating TOTP token', error);
          this.isTotpCodeValid = false;
          // Add error in case code is invalid
          // this.invalidCodeMessage = error.error.message
        },
      );
  }

  submitUserPasswordChange() {
    this.validateTotpCode()
    if (!this.isTotpCodeValid) {
      this.showRevalidateTotpTokenMessage = true;
      return
    }
    const email = this.userUpdateForm.get('email')?.value;
    const password = this.userUpdateForm.get('password')?.value;
    this.userService.getUserByEmail(email).subscribe(
      (response) => {
        console.log('getUserByEmail Data:', response);
        this.userService.updateUserPasswordById(response.data.id, password).subscribe(
          (updateResponse) => {
            console.log("UpdateRepose:", updateResponse)
            this.showRevalidateTotpTokenMessage = false;
            this.router.navigateByUrl("/login")
          },
          (error) => {
            console.log("updateUserPasswordById Error:", error)
            this.showRevalidateTotpTokenMessage = false
          }
        )
      },
      (error) => {
        console.log('Error:', error);
      },
    );
  }
}

// import { Component, OnInit } from '@angular/core';

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'src/app/models/user';
import { UserService } from 'src/app/services/user.service';
import { AuthService } from 'src/app/services/auth.service';
import { Validators, ValidationErrors, FormGroup, FormControl, ValidatorFn, AbstractControl } from '@angular/forms';

const checkIfMatchingPasswords = (): ValidatorFn => {
  return (control: AbstractControl): ValidationErrors | null => {
    const passwordControl = control.get("password")?.value;
    const confirmControl = control.get("confirm")?.value;


    return passwordControl === confirmControl ? null : { confirmPassword: { msg: "password must match" } };
  };
};

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})

export class SignupPage implements OnInit {

  eye: string = "assets/icon/eye-off-filled.svg";
  logoPrincipal = "../../../assets/icon/logo_principal.svg";
  candado = "../../../assets/icon/candado.svg";
  grupo3 = "../../../assets/icon/grupo_3.svg";
  google = "../../../assets/icon/google-icon.svg";
  password: string = '';
  passwordConf: string = '';
  phone!: number;
  ToS: boolean = false;

  emailForm: FormGroup = new FormGroup(
    {
      email: new FormControl("", [Validators.required, Validators.pattern(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$$/)]),
      password: new FormControl("", [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(20),
        Validators.pattern(
          "(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!¡%*?&{}\\;\\,\\.\\:\\-\\_\\?\\¿\\+\\(\\)\\[\\]])[A-Za-z\\d@$!¡%*?&{}\\;\\,\\.\\:\\-\\_\\?\\¿\\+\\(\\)\\[\\]]{8,}"
        ),
      ]),
      confirm: new FormControl("", [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(20),
        Validators.pattern(
          "(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!¡%*?&{}\\;\\,\\.\\:\\-\\_\\?\\¿\\+\\(\\)\\[\\]])[A-Za-z\\d@$!¡%*?&{}\\;\\,\\.\\:\\-\\_\\?\\¿\\+\\(\\)\\[\\]]{8,}"
        ),
      ]),
    },
    [checkIfMatchingPasswords()]
  );

  actualRegisterStep: number = 0;
  showPassword = false;
  passwordToggleIcon = "eye";
  showPasswordConfirm = false;
  passwordConfirmToggleIcon = "eye";
  disableFormButton = false;

  mailPat = new RegExp('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$');
  phonePat = new RegExp('^(\\+?56)?(\\s?)(0?9)(\\s?)[9876543]\\d{7}$');
  passPat = new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d\\w\\W]{8,}$');

  constructor(
    private authService: AuthService,
    private router: Router,
    private userService: UserService
  ) { }

  ngOnInit() { }

  ionViewDidLeave() {
    this.emailForm.reset();
    this.actualRegisterStep = 0;  // we should use this when doing multi-step logn (main, verification code, other data)
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;

    if (this.passwordToggleIcon == "eye") {
      this.passwordToggleIcon = "eye-off";
    } else {
      this.passwordToggleIcon = "eye";
    }
  }

  togglePasswordConfirm(): void {
    this.showPasswordConfirm = !this.showPasswordConfirm;

    if (this.passwordConfirmToggleIcon == "eye") {
      this.passwordConfirmToggleIcon = "eye-off";
    } else {
      this.passwordConfirmToggleIcon = "eye";
    }
  }

  emailStep(): void {
    this.disableFormButton = true;
    this.authService.signUp({ email: this.emailForm.get("email")?.value, password: this.emailForm.get("password")?.value, role: 0 })
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
            this.disableFormButton = false;
            alert("fail to login the user")
          }
        },
        err => {
          console.log("error", err)
          this.disableFormButton = false;
          alert("User already exists!")
        }
      )
  }



}

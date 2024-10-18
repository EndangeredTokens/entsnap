import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidatorFn, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';
import { Web3Service } from 'src/app/services/web3.service';
import { MultiLanguageService } from 'src/app/services/multi-language.service';
@Component({
  selector: 'app-web3-signup',
  templateUrl: './web3-signup.component.html',
  styleUrls: ['./web3-signup.component.scss'],
})

export class Web3SignupComponent  implements OnInit {
  logoPrincipal = "../../../assets/icon/logo_principal.svg";
  errorModalConfig: any = {
    header: '',
    message: '',
    buttons: [],
    visible: false,
  };
  isButtonDisabled: boolean = false;
  emailForm: FormGroup = new FormGroup(
    {
      email: new FormControl("", [Validators.required, Validators.pattern(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$$/)]),
    },
  );

  constructor(
    private authService: AuthService,
    private router: Router,
    private userService: UserService,
    private web3Service: Web3Service,
    private multiLanguageService: MultiLanguageService
  ) { }

  ngOnInit() {}

  ionViewDidLeave() {
    this.emailForm.reset();
  }

  async onCreate(){

    let userWalletAddress = null;
    if(this.web3Service.isConnected()) {
      const res = await this.web3Service.getWalletAddress();
      userWalletAddress = res ? res[0] : null;
    }else{
      await this.web3Service.initWeb3Modal();
      const res = await this.web3Service.connectWallet();

      if(res) {
        userWalletAddress = res;
      }
    }

    if(!userWalletAddress) {
      return;
    }

    this.isButtonDisabled = true;
    const email = this.emailForm.get("email")?.value;
    this.authService.web3SignUp({
      email,
      password: userWalletAddress,
      walletAddress: userWalletAddress,
    })
      .subscribe(
        res => {
          console.log("res", res);
          this.authService.extractUser(res);
          this.userService.setUserData(res.data);
          if (this.authService.isLogedIn()) {
            console.log("redirect to home");
            localStorage.setItem("auth_token", res.data.auth_token);
            console.log('navigate')
            this.router.navigateByUrl('/tabs/home');
          }
          else {
            this.isButtonDisabled = false;
          }
        },
        err => {
          if(err.status && err.status === 409) {
            this.isButtonDisabled = false;
            this.errorModalConfig = {
              header: 'Error',
              message: 'User already exists',
              buttons: ['Ok'],
              visible: true,
            };
          }
          console.log("error", err)
        }
      )
  }

  onCancel() {
    this.router.navigateByUrl('/login');
  }

  setErrorModalOpen(isVisible: boolean) {
    this.errorModalConfig.visible = isVisible;
  }

}

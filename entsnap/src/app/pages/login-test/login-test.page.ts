import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { Platform, isPlatform } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { CameraService } from 'src/app/services/camera.service';
import { FileService } from 'src/app/services/file.service';
import { LocationV2Service } from 'src/app/services/location.v2.service';
import { UserService } from 'src/app/services/user.service';
import { VersionsService } from 'src/app/services/version.service';
import { Web3Service } from 'src/app/services/web3.service';
import { Loader } from '@googlemaps/js-api-loader';
import { environment } from 'src/environments/environment';
import { DraftReportService } from 'src/app/services/draft-report.service';

@Component({
  selector: 'app-login-test',
  templateUrl: './login-test.page.html',
  styleUrls: ['./login-test.page.scss'],
})
export class LoginPage implements OnInit {
  eye: string = 'assets/icon/eye-off-filled.svg';
  logoPrincipal = '../../../assets/icon/logo_principal.svg';
  candado = '../../../assets/icon/candado.svg';
  grupo3 = '../../../assets/icon/grupo_3.svg';
  google = '../../../assets/icon/google-icon.svg';
  wallet = '../../../assets/icon/wallet.svg';
  email = '';
  password = '';
  rememberme!: boolean;
  showPassword = false;
  passwordToggleIcon = 'eye';
  showPasswordConfirm = false;
  passwordConfirmToggleIcon = 'eye';

  emailForm: FormGroup = new FormGroup(
    {
      email: new FormControl('', [
        Validators.required,
        Validators.pattern(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$$/),
      ]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(20),
        Validators.pattern(
          '(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!¡%*?&{}\\;\\,\\.\\:\\-\\_\\?\\¿\\+\\(\\)\\[\\]])[A-Za-z\\d@$!¡%*?&{}\\;\\,\\.\\:\\-\\_\\?\\¿\\+\\(\\)\\[\\]]{8,}',
        ),
      ]),
    },
    [],
  );

  constructor(
    private authService: AuthService,
    private locationService: LocationV2Service,
    private router: Router,
    private userService: UserService,
    private cameraService: CameraService,
    private platform: Platform,
    private versionService: VersionsService,
    private fileService: FileService,
    private web3Service: Web3Service,
    private draftReportService: DraftReportService,
  ) {
    if (!isPlatform('capacitor')) {
      this.initializeApp();
    }
  }

  initializeApp() {
    this.platform.ready().then(() => {
      GoogleAuth.initialize({
        clientId:
          '1008724758735-brrcb0261t1sbvl54t10issa13mcri20.apps.googleusercontent.com',
        scopes: ['profile', 'email'],
        grantOfflineAccess: true,
      });
    });
  }

  getVersionApp() {
    return this.versionService.userVersionCode;
  }

  async ngOnInit() {
    // make a clean of not used files
    console.log('[login.page.ngOnInit] clear not used pictures');
    await this.fileService.mkPicturesDir().then(async () => {
      await this.draftReportService.clearDraftPictures();
    });
    console.log('CRASH ERROR: RUN LOGIN PAGE');
    // this.locationService.setCurrentPosition();
    const token = localStorage.getItem('auth_token');
    if (token) {
      this.router.navigateByUrl('/tabs/tree');
    }

    console.log('ask for camera permission');
    await this.cameraService.requestPermission().then(async () => {
      console.log('permission granted, ask for location permission');
      // is this really good practice?, i dont know, but it works!!
      await this.locationService.requestPermission().then(async () => {
        console.log('location permision granted, ask for file permission');
        await this.fileService.requestPermission();
      });
    });
  }

  async loginWeb3() {
    await this.web3Service.initWeb3Modal();

    this.web3Service
      .connectWallet()
      .then((userAddress) => {
        console.log('USER', userAddress);

        this.authService.loginWeb3(userAddress).subscribe({
          next: async (res) => {
            console.log('USER', res.data);
            localStorage.setItem('auth_token', res.data.auth_token);
            this.router.navigateByUrl('/tabs/tree');
          },
          error: async (err) => {
            console.log('Error web3 login', err);
            if (err.status && err.status === 404) {
              this.router.navigateByUrl('/web3-signup');
            }
          },
        });
      })
      .catch((err) => {
        console.log('error while connecting wallet', err);
      });
  }

  async ionViewDidEnter() {
    const connected = await this.authService.checkNetworkStatus();
    console.log('network status, connected?:', connected);
  }

  async googleSignUp() {
    try {
      console.log('google auth');
      console.log("[googleSignUp] wait for reloadGoogleMapsApi")
      if (!this.authService.networkStatus) {
        this.router.navigateByUrl("/internet-error")
        return
      }


      await this.locationService.google()
      // await this.reloadGoogleMapsApi()
      // await this.locationService.waitForGoogleMapsApi()
      console.log("[googleSignUp] finished waiting for reloadGoogleMapsApi")
      let googleUser = await GoogleAuth.signIn();
      console.log('google user object', googleUser);
      this.authService
        .googleSignUp({ idToken: googleUser.authentication.idToken })
        .subscribe(async (user: any) => {
          console.log('the user is:', user);
          if (!user) {
            this.router.navigateByUrl('/internet-error');
          }
          console.log(
            'the user in userService.current is:',
            this.userService.getCurrentUser(),
          );
          console.log('a user loged in?:', this.authService.isLogedIn());
          if (this.authService.isLogedIn()) {
            if (await this.authService.isVerified()) {
              localStorage.setItem('auth_token', user.auth_token);
              this.router.navigateByUrl('/tabs/tree');
            } else {
              this.router.navigateByUrl('/verification');
              this.authService.verifyEmail();
            }
          }
        });
    } catch (error) {
      console.log('error in login', error);
      this.router.navigateByUrl('/internet-error');
    }
  }

  async enterOfflineMode() {
    console.log('entering offline mode');
    await this.authService.enterOfflineMode();
    console.log('navigate to /tabs/tree');
    this.router.navigateByUrl('/tabs/tree');
  }

  async reloadGoogleMapsApi(): Promise<void> {
    console.log("Reloading reloadGoogleMapsApi")
    const loader = new Loader({
      apiKey: environment.googleMapsApiKey,
    })

    await loader.load().then(async () => {
      console.log("LOADED GOOGLE MAPS API")
    }).catch( (error) => {
      console.log("RELOAD GOOGLE MAPS API error:", error)
    })
    console.log("Reloading Finished reloadGoogleMapsApi")
  }

  async checkCredentials(): Promise<void> {
    console.log('checkcredentials');
    try {
      if (!this.authService.networkStatus) {
        this.router.navigateByUrl("/internet-error")
        return
      }
      console.log("[checkcredentials] wait for reloadGoogleMapsApi")
      await this.locationService.google()
      // await this.reloadGoogleMapsApi()
      // await this.locationService.waitForGoogleMapsApi()
      console.log("[checkcredentials] finished waiting for reloadGoogleMapsApi")
      this.authService
        .login({
          email: this.emailForm.get('email')!.value,
          password: this.emailForm.get('password')!.value,
        })
        .subscribe({
          next: async (user: any) => {

            console.log('the user is:', user);
            if (!user) {
              this.router.navigateByUrl('/internet-error');
            }
            console.log(
              'the user in userService.current is:',
              this.userService.getCurrentUser(),
            );
            console.log('a user loged in?:', this.authService.isLogedIn());
            if (this.authService.isLogedIn()) {
              if (await this.authService.isVerified()) {
                localStorage.setItem('auth_token', user.auth_token);
                this.router.navigateByUrl('/tabs/tree');
              } else {
                this.router.navigateByUrl('/verification');
                this.authService.verifyEmail();
              }
            }
          },
          error: (error: any) => {
            console.log('error in login', error);
            // this.router.navigateByUrl('/internet-error');
          },
        });
    } catch (error) {
      console.log('error in login', error);
      this.router.navigateByUrl('/internet-error');
    }
  }

  resetPassword(): void {
    this.router.navigateByUrl('/request-password-reset');
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
    if (this.passwordToggleIcon == 'eye') {
      this.passwordToggleIcon = 'eye-off';
    } else {
      this.passwordToggleIcon = 'eye';
    }
  }

  togglePasswordConfirm(): void {
    this.showPasswordConfirm = !this.showPasswordConfirm;

    if (this.passwordConfirmToggleIcon == 'eye') {
      this.passwordConfirmToggleIcon = 'eye-off';
    } else {
      this.passwordConfirmToggleIcon = 'eye';
    }
  }

  updateFireMem(): void {
    if (this.rememberme) {
      this.authService.setLocal();
    } else {
      this.authService.setNone();
    }
  }
}

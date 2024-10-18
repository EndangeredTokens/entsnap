import { Component, OnInit } from '@angular/core';
import { z, ZodObject } from 'zod';
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
import { MultiLanguageService } from 'src/app/services/multi-language.service';

@Component({
    selector: 'app-login-email',
    templateUrl: './login-email.page.html',
    styleUrls: ['./login-email.page.scss'],
})
export class LoginEmailPage implements OnInit {
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
        private multiLanguageService: MultiLanguageService
    ) {
        this.loginFormSchema = z.object({
            password: z
                .string()
                .min(8, 'login_email.password_error'),
            email: z
                .string()
                .min(5, 'login_email.email_short')
                .email('login_email.email_error'),
                
        });
    }

    loginFormSchema: ZodObject<{ email: z.ZodString; password: z.ZodString }>;

    email: string = '';
    password: string = '';

    emailActive: boolean = false;
    passwordActive: boolean = false;

    emailSuccess: boolean = false;
    passwordSuccess: boolean = false;

    showPassword: boolean = false;

    emailErrorMessage: string = '';
    passwordErrorMessage: string = '';

    disableLogin: boolean = true;

    async ngOnInit() {
        // make a clean of not used files
        console.log('[login.page.ngOnInit] clear not used pictures');
        await this.fileService.mkPicturesDir().then(async () => {
            // await this.fileService.clearNotUsedPictures();
        });
        // console.log('CRASH ERROR: RUN LOGIN PAGE');
        // this.locationService.setCurrentPosition();
        // const token = localStorage.getItem('auth_token');
        // if (token) {
        //     this.router.navigateByUrl('/tabs/tree');
        // }

        console.log('ask for camera permission');
        await this.cameraService.requestPermission().then(async () => {
            console.log('permission granted, ask for location permission');
            // is this really good practice?, i dont know, but it works!!
            await this.locationService.requestPermission().then(async () => {
                console.log(
                    'location permision granted, ask for file permission',
                );
                await this.fileService.requestPermission();
            });
        });
    }

    async ionViewDidEnter() {
        const connected = await this.authService.checkNetworkStatus();
        console.log('network status, connected?:', connected);
    }

    onInputChange(type: string) {
        if (type === 'email') {
            this.emailActive = true;
        } else if (type === 'password') {
            this.passwordActive = true;
        }
    }

    togglePasswordVisibility() {
        this.showPassword = !this.showPassword;
    }

    validateInputs() {
        console.log('validateInputs');
        this.emailErrorMessage = '';
        this.passwordErrorMessage = '';

        const validateResult = this.loginFormSchema.safeParse({
            email: this.email,
            password: this.password,
        });

        if (!validateResult.success) {
            const errors = validateResult.error.format();
            console.log(errors);
            this.disableLogin = true;

            if (errors.email) {
                this.emailErrorMessage = errors.email._errors[0];
                this.emailSuccess = false;
            } else {
                this.emailSuccess = true;
            }

            if (errors.password) {
                this.passwordErrorMessage = errors.password._errors[0];
                this.passwordSuccess = false;
            } else {
                this.passwordSuccess = true;
            }
        } else {
            console.log(validateResult.data);
            this.emailSuccess = true;
            this.passwordSuccess = true;
            this.disableLogin = false;
        }
    }

    async login(): Promise<void> {
        console.log('checkcredentials');
        try {
            if (!this.authService.networkStatus) {
                this.router.navigateByUrl('/internet-error');
                return;
            }
            console.log('[checkcredentials] wait for reloadGoogleMapsApi');
            await this.locationService.google();
            console.log(
                '[checkcredentials] finished waiting for reloadGoogleMapsApi',
            );
            this.authService
                .login({
                    email: this.email,
                    password: this.password,
                })
                .subscribe({
                    next: async (user: any) => {
                        console.log('the user is:', user);
                        if (!user) {
                            this.passwordErrorMessage = "login_email.wrong_pass";
                            this.passwordSuccess = false;
                            // this.router.navigateByUrl('/internet-error');
                        }
                        console.log(
                            'the user in userService.current is:',
                            this.userService.getCurrentUser(),
                        );
                        console.log(
                            'a user loged in?:',
                            this.authService.isLogedIn(),
                        );
                        if (this.authService.isLogedIn()) {
                            if (await this.authService.isVerified()) {
                                localStorage.setItem(
                                    'auth_token',
                                    user.auth_token,
                                );
                                this.router.navigateByUrl('/tabs/home');
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
}

import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { MultiLanguageService } from 'src/app/services/multi-language.service';
import { TranslateService } from '@ngx-translate/core';
@Component({
    selector: 'app-auth-account-code',
    templateUrl: './auth-account-code.page.html',
    styleUrls: ['./auth-account-code.page.scss'],
})
export class AuthAccountCodePage implements OnInit {
    constructor(
        private authService: AuthService,
        private router: Router,
        private userService: UserService,
        private multiLanguageService: MultiLanguageService,
        private translate: TranslateService,
    ) {}

    ngOnInit() {
        this.currentUrl = this.router.url;
        
    }

    ionViewWillEnter() {
        this.startTimer(); // Start timer when user enters the page}
        if (this.currentUrl === '/forgot-password-code') {
            this.translate.get('auth_account.CONTINUE').subscribe((translatedText: string) => {
                this.continueButtonText = translatedText;
            });
            this.email = this.authService.forgotPasswordData.email;
            this.goBackUrl = '/forgot-password';
        } else if (this.currentUrl === '/create-account-code') {
            this.translate.get('auth_account.LOGIN').subscribe((translatedText: string) => {
                this.continueButtonText = translatedText;
            });
            this.email = this.authService.createAccountData.email;
            this.password = this.authService.createAccountData.password;
            this.goBackUrl = '/create-account';
        }

        console.log("Current email:", this.email);
    }

    otpCode?: number;

    otpSuccess: boolean = false;

    otpCodeErrorMessage: string = '';

    disableLogin: boolean = true;

    timer: number = environment.otpCodeTimer;
    intervalId: any = null;
    showResendText: boolean = true;
    timerRunning: boolean = false;

    continueButtonText: string = '';
    redirectUrl: string = '';

    currentUrl: string = '';

    email: string = '';
    createAccountEmail: string = '';
    password: string = '';

    goBackUrl: string = '';

    sendCode(): void {
        if (this.timerRunning) return; // used to prevent multi sent of codes.
        // if (this.isCooldownRunning) return
        this.disableLogin = true;
        console.log("set timerRunning false")
        this.timerRunning = false; // we have to disable re-send just after it is clicked.
        console.log(
            'this.authService.forgotPasswordData.email:',
            this.authService.forgotPasswordData.email,
        );
        this.authService.sendTotpEmail({ email: this.email }).subscribe(
            (response) => {
                console.log('Response from sending TOTP token:', response);
                this.disableLogin = false;
                this.startTimer();
            },
            (error) => {
                console.error('Error Sending TOTP token', error);
                this.disableLogin = true;
            },
        );
    }

    startTimer() {
        if (this.timerRunning) return;
        this.showResendText = false;
        this.timer = environment.otpCodeTimer;
        this.timerRunning = true;
        if (this.intervalId) {
            clearInterval(this.intervalId);
            // this.timerRunning = false; // this set to false is wrong
        }
        this.intervalId = setInterval(() => {
            this.timer--;
            if (this.timer === 0) {
                clearInterval(this.intervalId);
                this.showResendText = true;
                this.timerRunning = false; // the set to false should be here
            }
        }, 1000);
    }

    validateCode() {
        this.disableLogin = true;
        this.otpCodeErrorMessage = '';
        this.authService
            .validateTotpToken({
                email: this.email,
                totpToken: this.otpCode?.toString(),
            })
            .subscribe(
                (response) => {
                    console.log(
                        'Response from validating TOTP token:',
                        response,
                    );
                    this.authService.saveForgotPasswordData(undefined, undefined, this.otpCode?.toString());
                    this.otpSuccess = true;
                    this.disableLogin = false;
                    // setTimeout(() => {
                    //     this.router.navigateByUrl('/create-new-password');
                    // }, 1000);
                    // this.invalidCodeMessage = ""
                    // this.registerUser()
                    // this.router.navigateByUrl("/login")
                },
                (error) => {
                    console.error('Error validating TOTP token', error);
                    this.otpSuccess = false;
                    this.translate.get('auth_account.invalid_code').subscribe((res: string) => {
                        this.otpCodeErrorMessage = res;
                    });
                    // Add error in case code is invalid
                    // this.invalidCodeMessage = error.error.message
                },
            );

        // this.otpSuccess = true;
        // this.otpCodeErrorMessage = "The code is incorrect, try again or request a new one."
    }


    // Not used
    /* onOtpInput(event: any, index: number) {
        const input = event.target.value;
        if (input.match(/^[0-9]$/)) {
            this.otpCode[index] = input;
            if (index < this.otpCode.length - 1) {
                this.otpSuccess = false;
                const nextInput = document.getElementById(`otp-${index + 1}`);
                if (nextInput) {
                    nextInput.removeAttribute('disabled');
                    nextInput.focus();
                }
            } else {
                this.validateCode();
            }
        } else {
            this.otpCode[index] = '';
        }
    } */

    createAccount(): void {
        console.log('[auth-account-code] createAccount');
        this.authService
            .signUp({ email: this.email, password: this.password, role: 0 })
            .subscribe(
                (user) => {
                    console.log('[auth-account-code] createAccount user');
                    this.userService.setUserData(user);
                    console.log('the user is:', user);
                    console.log(
                        'the user in userService.current is:',
                        this.userService.getCurrentUser(),
                    );
                    console.log(
                        'a user loged in?:',
                        this.authService.isLogedIn(),
                    );
                    if (this.authService.isLogedIn()) {
                        console.log('redirect to home');
                        localStorage.setItem('auth_token', user.auth_token);
                        this.router.navigateByUrl('/tabs/home');
                    } else {
                        this.router.navigateByUrl('/internet-error');
                    }
                },
                (err) => {
                    console.log('[auth-account-code] createAccount error');
                    console.log('error', err);
                },
            );
    }

    continue(): void {
        if (this.currentUrl === '/forgot-password-code') {
            this.router.navigateByUrl('/create-new-password');
        } else if (this.currentUrl === '/create-account-code') {
            this.createAccount();
        }
    }
}

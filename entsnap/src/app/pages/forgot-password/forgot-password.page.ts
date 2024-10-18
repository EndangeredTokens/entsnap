import { Component, OnInit } from '@angular/core';
import { z, ZodObject } from 'zod';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { LoadingService } from 'src/app/services/loading.service';
import { MultiLanguageService } from 'src/app/services/multi-language.service';
@Component({
    selector: 'app-forgot-password',
    templateUrl: './forgot-password.page.html',
    styleUrls: ['./forgot-password.page.scss'],
})
export class ForgotPasswordPage implements OnInit {
    constructor(
        private authService: AuthService,
        private router: Router,
        private loadingService: LoadingService,
        private multiLanguageService: MultiLanguageService
    ) {
        this.emailFormSchema = z.object({
            email: z
                .string()
                .min(5, 'forgot.email_short')
                .email('forgot.email_error'),
                
        });
    }

    ngOnInit() {}

    emailFormSchema: ZodObject<{ email: z.ZodString }>;

    email: string = '';

    emailActive: boolean = false;

    emailSuccess: boolean = false;

    emailErrorMessage: string = '';

    disableContinue: boolean = true;

    onInputChange(type: string) {
        if (type === 'email') {
            this.emailActive = true;
        }
    }

    validateInputs() {
        console.log('validateInputs');
        this.emailErrorMessage = '';

        const validateResult = this.emailFormSchema.safeParse({
            email: this.email,
        });

        if (!validateResult.success) {
            const errors = validateResult.error.format();
            // console.log(errors);
            this.disableContinue = true;

            if (errors.email) {
                this.emailErrorMessage = errors.email._errors[0];
                this.emailSuccess = false;
            } else {
                this.emailSuccess = true;
            }
        } else {
            console.log(validateResult.data);
            this.emailSuccess = true;
            this.disableContinue = false;
        }
    }

    continue(): void {
        this.authService.saveForgotPasswordData(this.email);
        this.sendCode();
    }

    sendCode(): void {
        // if (this.isCooldownRunning) return
        this.disableContinue = true;
        console.log('sending code to email:', this.email);
        this.loadingService.show();
        this.authService.sendTotpEmail({ email: this.email }).subscribe(
            (response) => {
                this.loadingService.dismiss();
                console.log('Response from sending TOTP token:', response);
                this.disableContinue = false;
                setTimeout(() => {
                    this.router.navigateByUrl('/forgot-password-code');
                }, 1000);
                // this.startCooldown()
                // Do not redirect, validation in the same form
                // this.router.navigateByUrl('/validate-otp');
            },
            (error) => {
                console.error('Error Sending TOTP token', error);
                // this.isTotpTokenSent = false
                this.disableContinue = false;
            },
        );
    }
}

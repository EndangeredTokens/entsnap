import { Component, OnInit } from '@angular/core';
import { z, ZodEffects, ZodObject } from 'zod';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { LoadingService } from 'src/app/services/loading.service';
import { MultiLanguageService } from 'src/app/services/multi-language.service';
@Component({
    selector: 'app-create-account',
    templateUrl: './create-account.page.html',
    styleUrls: ['./create-account.page.scss'],
})
export class CreateAccountPage implements OnInit {
    constructor(
        private authService: AuthService,
        private router: Router,
        private loadingService: LoadingService,
        private multiLanguageService: MultiLanguageService
    ) {
        this.loginFormSchema = z
        .object({
            password: z.string().min(8, 'create_acount.password_error'), 
            confirmPassword: z.string().min(8, 'create_acount.confirmpassword_error'), 
            email: z.string().min(5, 'create_acount.email_short').email('create_acount.email_error'), 
        })
        .refine(
            ({ confirmPassword, password }) => {
                return confirmPassword === password;
            },
            {
                message: 'create_acount.password_mismatch', 
                path: ['confirmPassword'],
            },
        );
    }

    ngOnInit() {}

    // loginFormSchema: ZodObject<{
    //     email: z.ZodString;
    //     password: z.ZodString;
    //     confirmPassword: z.ZodString;
    // }>;

    loginFormSchema: ZodEffects<
        ZodObject<{
            email: z.ZodString;
            password: z.ZodString;
            confirmPassword: z.ZodString;
        }>
    >;

    email: string = '';
    password: string = '';
    confirmPassword: string = '';

    emailActive: boolean = false;
    passwordActive: boolean = false;
    confirmPasswordActive: boolean = false;

    emailSuccess: boolean = false;
    passwordSuccess: boolean = false;
    confirmPasswordSuccess: boolean = false;

    showPassword: boolean = false;
    showConfirmPassword: boolean = false;

    emailErrorMessage: string = '';
    passwordErrorMessage: string = '';
    confirmPasswordErrorMessage: string = '';

    disableContinue: boolean = true;

    onInputChange(type: string) {
        if (type === 'email') {
            this.emailActive = true;
        } else if (type === 'password') {
            this.passwordActive = true;
        } else if (type === 'confirmPassword') {
            this.confirmPasswordActive = true;
        }
    }

    togglePasswordVisibility() {
        this.showPassword = !this.showPassword;
    }

    toggleConfirmPasswordVisibility() {
        this.showConfirmPassword = !this.showConfirmPassword;
    }

    validateInputs() {
        console.log('validateInputs');
        this.emailErrorMessage = '';
        this.passwordErrorMessage = '';
        this.confirmPasswordErrorMessage = '';

        const validateResult = this.loginFormSchema.safeParse({
            email: this.email,
            password: this.password,
            confirmPassword: this.confirmPassword,
        });

        if (!validateResult.success) {
            const errors = validateResult.error.format();
            console.log(errors);
            this.disableContinue = true;

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

            if (errors.confirmPassword) {
                this.confirmPasswordErrorMessage =
                    errors.confirmPassword._errors[0];
                this.confirmPasswordSuccess = false;
            } else {
                this.confirmPasswordSuccess = true;
            }
        } else {
            console.log(validateResult.data);
            this.emailSuccess = true;
            this.passwordSuccess = true;
            this.confirmPasswordSuccess = true;
            this.disableContinue = false;
        }
    }

    sendCode(): void {
        this.disableContinue = true;
        const email = this.email;
        this.loadingService.show()
        this.authService.sendTotpEmail({ email: email }).subscribe(
            (response) => {
                console.log('Response from sending TOTP token:', response);
                this.disableContinue = false;
                setTimeout(() => { // why?
                    this.loadingService.dismiss()
                    this.router.navigateByUrl('/create-account-code');
                }, 1000);
            },
            (error) => {
                console.error('Error Sending TOTP token', error);
                this.loadingService.dismiss()
                this.disableContinue = false;
            },
        );
    }

    continue() {
        // store credentials in auth service
        this.authService.saveCreateAccountData(this.email, this.password);
        this.sendCode();
    }
}

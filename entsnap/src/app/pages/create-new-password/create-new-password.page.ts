import { Component, OnInit } from '@angular/core';
import { z, ZodEffects, ZodObject } from 'zod';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';
import { MultiLanguageService } from 'src/app/services/multi-language.service';

@Component({
    selector: 'app-create-new-password',
    templateUrl: './create-new-password.page.html',
    styleUrls: ['./create-new-password.page.scss'],
})
export class CreateNewPasswordPage implements OnInit {
    constructor(
        private authService: AuthService,
        private router: Router,
        private userService: UserService,
        private multiLanguageService: MultiLanguageService
    ) {
        this.loginFormSchema = z
            .object({
                password: z
                    .string()
                    .min(8, 'create_new_pass.password_error'),
                confirmPassword: z
                    .string()
                    .min(8, 'create_new_pass.password_error'),
            })
            .refine(
                ({ confirmPassword, password }) => {
                    return confirmPassword === password;
                },
                {
                    message: 'create_new_pass.message',
                    path: ['confirmPassword'],
                },
            );
    }

    ngOnInit() {}

    loginFormSchema: ZodEffects<
        ZodObject<{
            password: z.ZodString;
            confirmPassword: z.ZodString;
        }>
    >;

    password: string = '';
    confirmPassword: string = '';

    passwordActive: boolean = false;
    confirmPasswordActive: boolean = false;

    passwordSuccess: boolean = false;
    confirmPasswordSuccess: boolean = false;

    showPassword: boolean = false;
    showConfirmPassword: boolean = false;

    passwordErrorMessage: string = '';
    confirmPasswordErrorMessage: string = '';

    disableLogin: boolean = true;

    onInputChange(type: string) {
        if (type === 'password') {
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
        this.passwordErrorMessage = '';
        this.confirmPasswordErrorMessage = '';

        const validateResult = this.loginFormSchema.safeParse({
            password: this.password,
            confirmPassword: this.confirmPassword,
        });

        if (!validateResult.success) {
            const errors = validateResult.error.format();
            console.log(errors);
            this.disableLogin = true;

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
            this.passwordSuccess = true;
            this.confirmPasswordSuccess = true;
            this.disableLogin = false;
        }
    }

    submitPasswordChange() {
        console.log('submitPasswordChange');
        const email = this.authService.forgotPasswordData.email;
        const password = this.password;
        const totp = this.authService.forgotPasswordData.totp;
        console.log('email:', email);
        console.log('password:', password);
        console.log('totp:', totp);

        this.userService.resetPasswordByEmail(email, password, totp).subscribe(
            (response) => {
                console.log('Reset password by email call response:', response);
                const user = response.user;
                console.log("user", user);
                this.userService.setUserData(user);
                this.authService.user = user;
                this.authService.logedIn = true;
                localStorage.setItem('auth_token', user.auth_token);
                this.router.navigateByUrl('/tabs/home');
            },
            (error) => {
                console.log('resetPasswordByEmail Error:', error);
            }
        )

        // this.userService.getUserByEmail(email).subscribe(
        //     (response) => {
        //         console.log('getUserByEmail Data:', response);
        //         this.userService
        //             .updateUserPasswordById(response.data.id, password) // change endpoint
        //             .subscribe(
        //                 (updateResponse) => {
        //                     console.log('UpdateRepose:', updateResponse);
        //                     const user = updateResponse.data[1][0]
        //                     console.log("user", user)
        //                     this.userService.setUserData(user)
        //                     this.authService.user = user
        //                     this.authService.logedIn = true
        //                     localStorage.setItem('auth_token', user.auth_token);
        //                     this.router.navigateByUrl('/tabs/home');
        //                     // this.router.navigateByUrl('/login-email');
        //                 },
        //                 (error) => {
        //                     console.log('updateUserPasswordById Error:', error);
        //                 },
        //             );
        //     },
        //     (error) => {
        //         console.log('Error:', error);
        //     },
        // );
    }
}

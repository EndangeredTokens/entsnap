import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { TabsComponent } from './components/tabs/tabs.component';
import { isAuthGuard, RedirectFromAuthOnActivateGuard } from './guards/auth.guard';
import {
    canLeaveTreeImageGuard,
    canLeaveTreePreviewGuard,
    shouldTriggerAlert,
} from './guards/leave-tree-report.guard';
import { HasSeenIntroductionGuard } from './guards/has-seen-introduction.guard';
import { RouteHistoryOnActivateGuard } from './guards/route-history.guard';
import { RestartProofOfLifeOnActivateGuard } from './guards/restart-proof-of-life.guard';
import { protectLeaveCameraGuard } from './guards/camera.guard';
import { VersionVerificationOnActivateGuard } from './guards/version-verification.guard';
import { ConfirmEntPhotosComponent } from './components/confirm-ent-photos/confirm-ent-photos.component';
import {
    startLocationWatcherGuard,
    stopLocationWatcherGuard,
} from './guards/location-watcher.guard';
import { ValidateOtpComponent } from './components/validate-otp/validate-otp.component';
import { RequestPasswordResetPage } from './pages/request-password-reset/request-password-reset.page';

const routes: Routes = [
    {
        path: 'logo',
        loadChildren: () =>
            import('./pages/logo/logo.module').then((m) => m.LogoPageModule),
        canActivate: [RouteHistoryOnActivateGuard, VersionVerificationOnActivateGuard],
    },
    {
        path: '',
        loadChildren: () =>
            import('./pages/introduction/introduction.module').then(
                (m) => m.IntroductionPageModule,
            ),
        pathMatch: 'full',
        canActivate: [RouteHistoryOnActivateGuard, VersionVerificationOnActivateGuard, RedirectFromAuthOnActivateGuard, HasSeenIntroductionGuard],
    },
    {
        path: 'login-test',
        loadChildren: () =>
            import('./pages/login-test/login-test.module').then((m) => m.LoginPageModule),
        canActivate: [RouteHistoryOnActivateGuard, VersionVerificationOnActivateGuard],
    },
    {
        path: 'login',
        loadChildren: () =>
            import('./pages/login/login.module').then((m) => m.LoginPageModule),
        canActivate: [RouteHistoryOnActivateGuard, VersionVerificationOnActivateGuard],
    },
    {
        path: 'signup',
        loadChildren: () =>
            import('./pages/signup/signup.module').then((m) => m.SignupPageModule),
        canActivate: [RouteHistoryOnActivateGuard, VersionVerificationOnActivateGuard],
    },
    {
        path: 'web3-signup',
        loadChildren: () =>
            import('./pages/web3-signup/web3-signup.module').then(
                (m) => m.Web3SignupModule,
            ),
        canActivate: [RouteHistoryOnActivateGuard, VersionVerificationOnActivateGuard],
    },
    {
        path: 'validate-otp',
        component: ValidateOtpComponent,
    },
    {
        path: 'tabs/map-proof-of-life',
        loadChildren: () =>
            import('./pages/map-proof-of-life/map-proof-of-life.module').then((m) => m.MapPageModule),
        canActivate: [RouteHistoryOnActivateGuard, VersionVerificationOnActivateGuard, startLocationWatcherGuard],
        canDeactivate: [stopLocationWatcherGuard],
    },
    {
        path: 'tabs',
        component: TabsComponent,
        canActivate: [isAuthGuard],
        children: [
            {
                path: 'home',
                loadChildren: () =>
                    import('./pages/home/home.module').then((m) => m.HomePageModule),
                canActivate: [RouteHistoryOnActivateGuard, VersionVerificationOnActivateGuard, startLocationWatcherGuard],
                canDeactivate: [stopLocationWatcherGuard],
            },
            {
                path: 'tree',
                data: { isValidate: false },
                loadChildren: () =>
                    import('./pages/new-report/new-report.module').then(
                        (m) => m.NewReportPageModule,
                    ),
                canDeactivate: [protectLeaveCameraGuard, stopLocationWatcherGuard],
                canActivate: [
                    shouldTriggerAlert,
                    RouteHistoryOnActivateGuard,
                    startLocationWatcherGuard,
                    VersionVerificationOnActivateGuard,
                ],
            },
            {
                path: 'map',
                loadChildren: () =>
                    import('./pages/map/map.module').then((m) => m.MapPageModule),
                canActivate: [RouteHistoryOnActivateGuard, VersionVerificationOnActivateGuard, startLocationWatcherGuard],
                canDeactivate: [stopLocationWatcherGuard],
            },
            {
                path: 'ents',
                loadChildren: () =>
                    import('./pages/ents/ents.module').then((m) => m.EntsPageModule),
                canActivate: [RouteHistoryOnActivateGuard, VersionVerificationOnActivateGuard],
            },
            {
                path: 'profile',
                loadChildren: () =>
                    import('./pages/profile/profile.module').then(
                        (m) => m.ProfilePageModule,
                    ),
                canActivate: [RouteHistoryOnActivateGuard, VersionVerificationOnActivateGuard],
            },
            {
                path: 'public-profile',
                loadChildren: () => 
                    import('./pages/public-profile/public-profile.module').then(
                        (m) => m.PublicProfilePageModule,
                    ),
                canActivate: [RouteHistoryOnActivateGuard, VersionVerificationOnActivateGuard],
            },
            {
                path: '',
                pathMatch: 'full',
                redirectTo: 'tabs/profile',
            },
            {
                path: 'ents/:id',
                loadChildren: () =>
                    import('./pages/specific-ent/specific-ent-routing.module').then(
                        (m) => m.SpecificEntPageRoutingModule,
                    ),
                canActivate: [RouteHistoryOnActivateGuard, VersionVerificationOnActivateGuard],
            },
            {
                path: 'preview',
                loadChildren: () =>
                    import('./pages/preview/preview.module').then(
                        (m) => m.PreviewPageModule,
                    ),
                canActivate: [
                    shouldTriggerAlert,
                    RouteHistoryOnActivateGuard,
                    startLocationWatcherGuard,
                    VersionVerificationOnActivateGuard,
                ],
                canDeactivate: [stopLocationWatcherGuard],
            },
            {
                path: 'confirm/:id',
                component: ConfirmEntPhotosComponent,
            },
            {
                path: 'validate/:id',
                data: { isValidate: true },
                loadChildren: () =>
                    import('./pages/new-report/new-report.module').then(
                        (m) => m.NewReportPageModule,
                    ),
                canDeactivate: [protectLeaveCameraGuard],
                canActivate: [shouldTriggerAlert, RouteHistoryOnActivateGuard, VersionVerificationOnActivateGuard, RestartProofOfLifeOnActivateGuard],
            },
            {
                path: 'draft',
                data: { isDraft: true },
                loadChildren: () =>
                    import('./pages/specific-ent/specific-ent-routing.module').then(
                        (m) => m.SpecificEntPageRoutingModule,
                    ),
                canActivate: [RouteHistoryOnActivateGuard, VersionVerificationOnActivateGuard],
            },
            {
                path: 'form-submitted/:comingFrom/:id',
                loadChildren: () =>
                    import('./pages/form-submitted/form-submitted.module').then(
                        (m) => m.FormSubmittedPageModule,
                    ),
                canActivate: [RouteHistoryOnActivateGuard, VersionVerificationOnActivateGuard],
            },
            {
                path: 'register-tree-input',
                loadChildren: () =>
                    import(
                        './pages/register-tree-input/register-tree-input.module'
                    ).then((m) => m.RegisterTreeInputPageModule),
                canActivate: [RouteHistoryOnActivateGuard, VersionVerificationOnActivateGuard],
            },
            {
                path: 'my-collection',
                loadChildren: () =>
                    import('./pages/my-collection/my-collection.module').then(
                        (m) => m.MyCollectionPageModule,
                    ),
                canActivate: [RouteHistoryOnActivateGuard, VersionVerificationOnActivateGuard],
            },
            {
                path: 'my-trees',
                loadChildren: () =>
                    import('./pages/all-reports/all-reports.module').then(
                        (m) => m.AllReportsPageModule,
                    ),
                canActivate: [RouteHistoryOnActivateGuard, VersionVerificationOnActivateGuard],
            },
            {
                path: 'my-proof-of-life',
                loadChildren: () =>
                    import('./pages/all-reports/all-reports.module').then(
                        (m) => m.AllReportsPageModule,
                    ),
                canActivate: [RouteHistoryOnActivateGuard, VersionVerificationOnActivateGuard],
            },
            {
                path: 'specific-proof-of-life/:id',
                loadChildren: () =>
                    import(
                        './pages/specific-proof-of-life/specific-proof-of-life.module'
                    ).then((m) => m.SpecificProofOfLifePageModule),
                canActivate: [RouteHistoryOnActivateGuard, VersionVerificationOnActivateGuard],
            },
            {
                path: 'tree-page/:id',
                loadChildren: () =>
                    import('./pages/tree-page/tree-page.module').then(
                        (m) => m.TreePagePageModule,
                    ),
                canActivate: [RouteHistoryOnActivateGuard, VersionVerificationOnActivateGuard],
            },
            {
                path: 'continue-draft/:draftName',
                loadChildren: () =>
                    import('./pages/continue-draft/continue-draft.module').then(
                        (m) => m.ContinueDraftPageModule,
                    ),
                canActivate: [RouteHistoryOnActivateGuard, VersionVerificationOnActivateGuard],
            },
            {
                path: 'report-map-new',
                loadChildren: () =>
                    import('./pages/report-map-new/report-map-new.module').then(
                        (m) => m.ReportMapNewPageModule,
                    ),
                canActivate: [RouteHistoryOnActivateGuard, VersionVerificationOnActivateGuard, startLocationWatcherGuard],
                canDeactivate: [stopLocationWatcherGuard],
            },
        ],
    },

    {
        path: 'request-password-reset',
        loadChildren: () =>
            import(
                './pages/request-password-reset/request-password-reset.module'
            ).then((m) => m.RequestPasswordResetPageModule),
    },
    // {
    //   path: 'notification/:id',
    //   loadChildren: () => import('./pages/notification/notification.module').then( m => m.NotificationPageModule)
    // },
    // {
    //   path: 'req-reset',
    //   loadChildren: () => import('./pages/req-reset/req-reset.module').then( m => m.ReqResetPageModule)
    // },
    // {
    //   path: 'reset-continue',
    //   loadChildren: () => import('./pages/reset-continue/reset-continue.module').then( m => m.ResetContinuePageModule)
    // },
    {
        path: 'form-submitted',
        loadChildren: () =>
            import('./pages/form-submitted/form-submitted.module').then(
                (m) => m.FormSubmittedPageModule,
            ),
        canActivate: [RouteHistoryOnActivateGuard, VersionVerificationOnActivateGuard],
    },
    {
        path: 'internet-error',
        loadChildren: () =>
            import('./pages/internet-error/internet-error.module').then(
                (m) => m.InternetErrorPageModule,
            ),
        canActivate: [RouteHistoryOnActivateGuard, VersionVerificationOnActivateGuard],
    },
    {
        path: 'introduction',
        loadChildren: () =>
            import('./pages/introduction/introduction.module').then(
                (m) => m.IntroductionPageModule,
            ),
        canActivate: [RouteHistoryOnActivateGuard, VersionVerificationOnActivateGuard],
    },
    {
        path: 'request-password-reset',
        loadChildren: () =>
            import(
                './pages/request-password-reset/request-password-reset.module'
            ).then((m) => m.RequestPasswordResetPageModule),
    },
    {
        path: 'login-email',
        loadChildren: () =>
            import('./pages/login-email/login-email.module').then(
                (m) => m.LoginEmailPageModule,
            ),
        // canActivate: [RedirectFromAuthGuard],
    },
    {
        path: 'create-account',
        loadChildren: () =>
            import('./pages/create-account/create-account.module').then(
                (m) => m.CreateAccountPageModule,
            ),
        // canActivate: [RedirectFromAuthGuard],
    },
    {
        path: 'create-account-code',
        loadChildren: () =>
            import('./pages/auth-account-code/auth-account-code.module').then(
                (m) => m.AuthAccountCodePageModule,
            ),
        // canActivate: [RedirectFromAuthGuard],
    },
    {
        path: 'forgot-password',
        loadChildren: () =>
            import('./pages/forgot-password/forgot-password.module').then(
                (m) => m.ForgotPasswordPageModule,
            ),
        // canActivate: [RedirectFromAuthGuard],
    },
    {
        path: 'create-new-password',
        loadChildren: () =>
            import(
                './pages/create-new-password/create-new-password.module'
            ).then((m) => m.CreateNewPasswordPageModule),
        // canActivate: [RedirectFromAuthGuard],
    },
    {
        path: 'forgot-password-code',
        loadChildren: () =>
            import('./pages/auth-account-code/auth-account-code.module').then(
                (m) => m.AuthAccountCodePageModule,
            ),
        // canActivate: [RedirectFromAuthGuard],
    },
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
    ],
    exports: [RouterModule],
})
export class AppRoutingModule { }

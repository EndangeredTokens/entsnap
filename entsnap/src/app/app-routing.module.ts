import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { TabsComponent } from './components/tabs/tabs.component';
import { isAuthGuard } from './guards/auth.guard';
import { canLeaveTreeImageGuard, canLeaveTreePreviewGuard, shouldTriggerAlert } from './guards/leave-tree-report.guard';
import { HasSeenIntroductionGuard } from './guards/has-seen-introduction.guard';
import { RouteHistoryOnActivateGuard } from './guards/route-history.guard';
import { protectLeaveCameraGuard } from './guards/camera.guard';
const routes: Routes = [
  {
    path: 'logo',
    loadChildren: () => import('./pages/logo/logo.module').then( m => m.LogoPageModule),
    canActivate: [RouteHistoryOnActivateGuard]
  },
  {
    path: '',
    loadChildren: () => import('./pages/introduction/introduction.module').then( m => m.IntroductionPageModule),
    pathMatch: 'full',
    canActivate: [HasSeenIntroductionGuard, RouteHistoryOnActivateGuard]
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule),
    canActivate: [RouteHistoryOnActivateGuard]
  },
  {
    path: 'signup',
    loadChildren: () => import('./pages/signup/signup.module').then( m => m.SignupPageModule),
    canActivate: [RouteHistoryOnActivateGuard]
  },
  {
    path: 'tabs',
    component: TabsComponent,
    canActivate: [isAuthGuard],
    children: [
      {
        path: 'home',
        loadChildren: () => import('./pages/home/home.module').then( m => m.HomePageModule),
        canActivate: [RouteHistoryOnActivateGuard]
      },
      {
        path: 'tree',
        loadChildren: () => import('./pages/new-report/new-report.module').then( m => m.NewReportPageModule),
        canDeactivate: [protectLeaveCameraGuard],
        canActivate: [shouldTriggerAlert, RouteHistoryOnActivateGuard]
      },
      {
        path: 'map',
        loadChildren: () => import('./pages/map/map.module').then( m => m.MapPageModule),
        canActivate: [RouteHistoryOnActivateGuard]
      },
      {
        path: 'ents',
        loadChildren: () => import('./pages/ents/ents.module').then( m => m.EntsPageModule),
        canActivate: [RouteHistoryOnActivateGuard]
      },
      {
        path: 'profile',
        loadChildren: () => import('./pages/profile/profile.module').then( m => m.ProfilePageModule),
        canActivate: [RouteHistoryOnActivateGuard]
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'tabs/profile'
      },
      {
        path: 'ents/:id',
        loadChildren: () => import('./pages/specific-ent/specific-ent-routing.module').then( m => m.SpecificEntPageRoutingModule),
        canActivate: [RouteHistoryOnActivateGuard]
      },
      {
        path: 'preview',
        loadChildren: () => import('./pages/preview/preview.module').then( m => m.PreviewPageModule),
        canActivate: [shouldTriggerAlert, RouteHistoryOnActivateGuard]
      },
    ]
  },

  {
    path: 'report-map-new',
    loadChildren: () => import('./pages/report-map-new/report-map-new.module').then( m => m.ReportMapNewPageModule),
    canActivate: [RouteHistoryOnActivateGuard]
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
    loadChildren: () => import('./pages/form-submitted/form-submitted.module').then( m => m.FormSubmittedPageModule),
    canActivate: [RouteHistoryOnActivateGuard]
  },
  {
    path: 'internet-error',
    loadChildren: () => import('./pages/internet-error/internet-error.module').then( m => m.InternetErrorPageModule),
    canActivate: [RouteHistoryOnActivateGuard]
  },
  {
    path: 'introduction',
    loadChildren: () => import('./pages/introduction/introduction.module').then( m => m.IntroductionPageModule),
    canActivate: [RouteHistoryOnActivateGuard]
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }

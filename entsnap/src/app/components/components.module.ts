import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { NgxSafePipesModule } from '@it-era/ngx-safe-pipes';
// import { AgmCoreModule } from '@agm/core';

// import { SingupButtonComponent } from './singup-button/singup-button.component';
// import { LoginButtonComponent } from "./login-button/login-button.component";
import { TabsComponent } from './tabs/tabs.component';
import { SignupFormComponent } from './signup-form/signup-form.component';
// import { InfoHomeComponent } from './info-home/info-home.component';
// import { ReportOptComponent } from './report-opt/report-opt.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { RMapHeaderComponent } from './r-map-header/r-map-header.component';
import { ProfileInfoComponent } from './profile-info/profile-info.component';
// import { ChangePfpComponent } from './change-pfp/change-pfp.component';
// import { ChangeUserInfoComponent } from './change-user-info/change-user-info.component';
// import { ChangeAccTypeComponent } from './change-acc-type/change-acc-type.component';
import { RouterModule } from '@angular/router';
// import { ReportFormComponent } from './report-form/report-form.component';
// import { ReportFormNewComponent } from "./report-form-new/report-form-new.component";
import { ReportImageComponent } from "./report-image/report-image.component";
import { ReportDetailComponent } from './report-detail/report-detail.component';
// import { ReportCommentsComponent } from './report-comments/report-comments.component';
// import { MenuOptComponent } from './menu-opt/menu-opt.component';
// import { NotMenuOptComponent } from './not-menu-opt/not-menu-opt.component';
// import { VerificationFormComponent } from './verification-form/verification-form.component';
// import { VerificationSuccessComponent } from './verification-success/verification-success.component';
// import { CommentComponent } from './comment/comment.component';
// import { AddressSelectComponent } from './address-select/address-select.component';
// import { PaddingResolutionComponent } from './padding-resolution/padding-resolution.component';

@NgModule({
  declarations: [
    //login/singup
    // SingupButtonComponent,
    // LoginButtonComponent,
    SignupFormComponent,
    // AddressSelectComponent,
    // VerificationFormComponent,
    // VerificationSuccessComponent,
    //main
    // PaddingResolutionComponent,
    TabsComponent,
    //home
    // InfoHomeComponent,
      //menu
      // MenuOptComponent,
      // NotMenuOptComponent,
      //reports
      // ReportOptComponent,
      RMapHeaderComponent,
      // ReportFormComponent,
      // ReportFormNewComponent,
      ReportImageComponent,
      //feed
      NotificationsComponent,
      ReportDetailComponent,
      // ReportCommentsComponent,
      //comments
      // CommentComponent,
    //map
    //profile
    ProfileInfoComponent,
    // ChangePfpComponent,
    // ChangeUserInfoComponent,
    // ChangeAccTypeComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    // NgxSafePipesModule,
    // AgmCoreModule
  ],
  exports: [
    //login/singup
    // SingupButtonComponent,
    // LoginButtonComponent,
    SignupFormComponent,
    // AddressSelectComponent,
    // VerificationFormComponent,
    // VerificationSuccessComponent,
    //main
    TabsComponent,
    //home
    // InfoHomeComponent,
      //menu
      // MenuOptComponent,
      // NotMenuOptComponent,
      //reports
      // ReportOptComponent,
      RMapHeaderComponent,
      // ReportFormComponent,
      // ReportFormNewComponent,
      ReportImageComponent,
      //feed
      NotificationsComponent,
      ReportDetailComponent,
      // ReportCommentsComponent,
      //comments
      // CommentComponent,
    //map
    //profile
    ProfileInfoComponent,
    // ChangePfpComponent,
    // ChangeUserInfoComponent,
    // ChangeAccTypeComponent
  ]
})
export class ComponentsModule { }

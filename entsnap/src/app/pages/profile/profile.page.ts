import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ProfileInfoComponent } from 'src/app/components/profile-info/profile-info.component';
import { User } from 'src/app/models/userShort';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';
import { Web3Service } from 'src/app/services/web3.service';
import { MultiLanguageService } from 'src/app/services/multi-language.service';
@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  @ViewChild('profile') profile?: ProfileInfoComponent;
  @ViewChild('modalElement') modalElementRef!: ElementRef;
  @ViewChild('confirmPasswordBtn') confirmPasswordBtn!: ElementRef;

  backIcon = "../../../assets/icon/back_button.svg";
  backIconBackground = "../../../assets/icon/esquina_izq.svg";
  logo = "../../../assets/img/account-logo.svg";
  openedEyeIcon = "../../../assets/icon/eye.svg";
  closedEyeIcon = "../../../assets/icon/eye-off.svg"; 
  exclamationCircle="../../../assets/icon/exclamation-circle-filled.svg";
  selectedLanguage: string = "";

  user: User = {
    id: undefined,
    uid: undefined,
    role: 1, //Change before release
    name: undefined,
    last_name: undefined,
    email: undefined,
    password_hash: undefined,
    phone: undefined,
    address: "",
    city: "none",
    country_id: undefined,
    latitude: 0,
    longitude: 0,
    biography: "",
    notif_dist: 50,
    recieve_notif: true,
    recieve_comm: true,
    is_private: true,
    is_blocked: false,
    avatar: "",
    wallet_address: '',
    tag_name: '',
    wallets: []
  };

  errorModalConfig: any = {
    header: '',
    message: '',
    buttons: [],
    visible: false,
  };

  countries: any[] = [];

  editingPersonalInfo = false;
  editingPassword = false;

  tagValidator = new RegExp(/[@]*/);
  tagIsValid = true;
  tagIsUnique = true;
  badTag: string = '';

  passwordValidator = new RegExp('(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!¡%*?&{}\\;\\,\\.\\:\\-\\_\\?\\¿\\+\\(\\)\\[\\]])[A-Za-z\\d@$!¡%*?&{}\\;\\,\\.\\:\\-\\_\\?\\¿\\+\\(\\)\\[\\]]{8,}');
  newPasswordIsValid = false;
  newPasswordVerificationIsValid = false;
  newPassword = '';
  newPasswordVerification = '';
  showPassword = false;

  openModal = false;
  showPasswordModal = false;

  currentPassword = '';
  passwordIsCorrect = false;
  alreadyEnteredPassword = false;
  passwordChangeIsOk = false;

  constructor(
    private authService: AuthService, 
    private web3Service: Web3Service,
    private userService: UserService,
    private router: Router,
    private multiLanguageService: MultiLanguageService
  ) { 
    this.selectedLanguage = this.multiLanguageService.getCurrentLanguange();
  }

  async ngOnInit() {
    console.log("[profile page ngOnInit] init");
    this.userService.getCountryList().subscribe(
      res => {
        this.countries = res.data;
      }
    );
    await this.multiLanguageService.updatePreferredLanguage();
    this.selectedLanguage = this.multiLanguageService.getCurrentLanguange();
  }

  ionViewDidEnter(): void {
    
    this.user = Object.assign({}, this.userService.getCurrentUser());
    console.log("[profile page - ionViewDidEnter] CURRENT USER ON PROFILE:", this.user);
    this.editingPersonalInfo = false;
    this.editingPassword = false;

    this.tagValidator = new RegExp("^[a-zA-Z0-9]+$");
    this.tagIsValid = true;
    this.tagIsUnique = true;
    this.badTag = '';

    this.passwordValidator = new RegExp('(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!¡%*?&{}\\;\\,\\.\\:\\-\\_\\?\\¿\\+\\(\\)\\[\\]])[A-Za-z\\d@$!¡%*?&{}\\;\\,\\.\\:\\-\\_\\?\\¿\\+\\(\\)\\[\\]]{8,}');
    this.newPasswordIsValid = false;
    this.newPasswordVerificationIsValid = false;
    this.newPassword = '';
    this.newPasswordVerification = '';
    this.showPassword = false;

    this.openModal = false;
    this.showPasswordModal = false;

    this.currentPassword = '';
    this.passwordIsCorrect = false;
    this.alreadyEnteredPassword = false;
    this.passwordChangeIsOk = false;
  }

  editPersonalInfo(): void {
    if (this.editingPersonalInfo) {
      this.user = Object.assign({}, this.userService.getCurrentUser());
      this.editingPersonalInfo = false;
    } else {
      this.editingPersonalInfo = true;
    }
  }

  validateTag(event: Event) {
    this.tagIsValid = this.tagValidator.test(this.user.tag_name!);
  }

  editPassword(): void {
    if (this.editingPassword) {
      this.editingPassword = false;
      this.newPasswordIsValid = false;
      this.newPasswordVerificationIsValid = false;
      this.newPassword = '';
      this.newPasswordVerification = '';
      this.showPassword = false;
    } else {
      this.editingPassword = true;
    }
  }

  validateNewPassword() {
    this.newPasswordIsValid = this.passwordValidator.test(this.newPassword);
    this.newPasswordVerificationIsValid = this.newPassword == this.newPasswordVerification && this.passwordValidator.test(this.newPasswordVerification);      
  }

  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }

  toggleShowPasswordModal() {
    this.showPasswordModal = !this.showPasswordModal;
  }

  confirmPersonalInfo(): void {
    if (!this.tagIsValid) return;
    const userBackup = Object.assign({}, this.userService.getCurrentUser());
    console.log(userBackup);
    
    if (this.user.tag_name != userBackup.tag_name) {
      console.log("Updating tag.", this.user.tag_name, "!=", userBackup.tag_name);
      this.badTag = this.user.tag_name!;
      this.userService.updateTag(this.user.tag_name!);
      this.userService.pushUpdate().subscribe(
        () => {
          this.tagIsUnique = true;
        },
        (error) => {
          console.log("Tag:", this.user.tag_name, "is already used.");
          this.tagIsUnique = false;
          this.userService.setUserData(userBackup);
          this.user = Object.assign({}, this.userService.getCurrentUser());
        }
      );
    } else {
      console.log("Tag did not change:", this.user.tag_name, "==", userBackup.tag_name);
    }
    
    if (!this.tagIsUnique) return;
    this.userService.setUserData(this.user);
    this.userService.pushUpdate().subscribe(
      () => {
        this.user = Object.assign({}, this.userService.getCurrentUser());
        this.tagIsUnique = true;
        this.editingPersonalInfo = false;
      },
      error =>  {
        console.error("An error has ocurred:", error);
        this.userService.setUserData(userBackup);
        this.user = Object.assign({}, this.userService.getCurrentUser());
      }
    );
  }

  confirmPassword(): void {
    if (!this.newPasswordIsValid || !this.newPasswordVerificationIsValid) return;
    this.openModal = true;
  }

  confirmCurrentPassword() {
    this.authService.verifyPassword(this.user.email!, this.currentPassword).subscribe(
      res => {
        console.log(res.status);
        this.passwordIsCorrect = true;
        this.userService.updateUserPasswordById(this.user.id!, this.newPassword).subscribe(
          (res) => {
            console.log("Password updated");
            this.user = Object.assign({}, this.userService.getCurrentUser());
            this.passwordChangeIsOk  = true;
          },
          (error) => {
            console.log("Error while updating password: ", error)
          }
        )
        this.alreadyEnteredPassword = true;
      },
      error => {
        console.log(error.status);
        this.passwordIsCorrect = false;
        this.alreadyEnteredPassword = true;
      }
    )
  }

  closeModal() {
    this.openModal = false;

    this.newPasswordIsValid = false;
    this.newPasswordVerificationIsValid = false;
    this.newPassword = '';
    this.newPasswordVerification = '';
    this.showPassword = false;
    this.currentPassword = '';
    this.passwordIsCorrect = false;
    this.alreadyEnteredPassword = false;
    this.passwordChangeIsOk = false;
    this.editingPassword = false;
    this.showPasswordModal = false;
  }

  isOfflineMode() {
    return this.authService.offlineMode
  }

  offlineModeLogout(){
    // to logout from offline mode, simply set the variable to false
    // and then redirect to login mage
    this.authService.offlineMode = false
    // make sure to set logedIn as false, just for sanity
    this.authService.logedIn = false
    // then redirect
    this.router.navigateByUrl('/login');
  }

  forgotPassword() {
    console.log("redirecting to /forgot-password")
    this.router.navigateByUrl('/forgot-password')
  }

  async connectWallet() {
    await this.web3Service.initWeb3Modal();
    this.web3Service.connectWallet().then((address) => {
      const user = this.userService.getCurrentUser();

      this.userService.updateUserWallet(user.id, { walletAddress: address}).subscribe({
        error: (err) => {
          console.log('ERROR while updating user wallet address', err);
          if(err.status && err.status === 409) {
            console.log('User wallet address already exists');
            this.errorModalConfig = {
              header: 'Error',
              message: 'Wallet is already in use',
              buttons: ['Accept'],
              visible: true
            }
          }
        },
        next: (res) => {
          console.log('User wallet address updated successfully', res);
          user.wallet_address = res.wallet_address;
          const newUser = res;
          this.userService.setUserData(newUser);
          this.user = newUser;
        }
      })
    })
    .catch( err => {
      console.log('[PROFILE] connectWallet ERROR', err);
    })
  }

  isWalletConnected() {
    return this.user.wallets.length >= 1
  }

  getFirstWalletAddress() {
    if (this.user.wallets.length >= 1){
      let addr = this.user.wallets[0].wallet_address;
      return `${addr.substring(0,6)}...${addr.substring(addr.length-6)}`
    }
    return "unknown"
  }

  @HostListener('document:click', ['$event'])
  clickedOutsideModal(event: MouseEvent) {
    if (!this.openModal || this.confirmPasswordBtn.nativeElement.contains(event.target)) return;

    if (this.modalElementRef && !this.modalElementRef.nativeElement.contains(event.target)) {
      console.log("[CLICKED OUTSIDE MODAL] closing modal.")
      this.closeModal();
    }
  }

  logout(): void {
    this.web3Service.disconnectWallet();
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    this.authService.logedIn = false;
    this.router.navigateByUrl('/login');
  }
  changeLanguage(event: any) {
    const newLanguage = event.detail.value;
    this.multiLanguageService.setLanguage(newLanguage);
    this.selectedLanguage = newLanguage;
  }

}

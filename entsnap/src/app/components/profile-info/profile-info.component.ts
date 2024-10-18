import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'src/app/models/userShort';
import { UserService } from 'src/app/services/user.service';
import { Web3Service } from 'src/app/services/web3.service';

@Component({
  selector: 'app-profile-info',
  templateUrl: './profile-info.component.html',
  styleUrls: ['./profile-info.component.scss'],
})
export class ProfileInfoComponent implements OnInit {

  gitcoin = "../../../assets/icon/gitcoin.png";
  google = "../../../assets/icon/google.png";
  instagram = "../../../assets/icon/instagram.png";
  wallet = "../../../assets/icon/wallet.svg"
  errorModalConfig: any = {
    header: '',
    message: '',
    buttons: [],
    visible: false,
  };
  user!: User;

  constructor(
    private userService: UserService,
    private router: Router,
    private web3Service: Web3Service
  ) { }

  ngOnInit() {
    this.user = this.userService.getCurrentUser()
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
    return this.web3Service.isConnected();
  }

  ionViewDidEnter() {
    this.user = this.userService.getCurrentUser()
    console.log(this.user);
  }

  logout(): void {
    this.web3Service.disconnectWallet();
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    this.router.navigateByUrl('/login');
  }

  setErrorModalOpen(isVisible: boolean) {
    this.errorModalConfig.visible = isVisible;
  }

}

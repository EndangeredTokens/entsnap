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
      console.log('USER ADDRESS', address);
      const user = this.userService.getCurrentUser();
      console.log('sent user', user);

      user.wallet_address = address;
      console.log('user', user);
      this.userService.updateUser(user).subscribe({
        error: (err) => {
          console.log('ERROR while updating user wallet address', err);
        },
        next: (res) => {
          console.log('User wallet address updated successfully', res);
          const newUser = res.user;
          this.userService.setUserData(newUser);
          this.user = newUser;
        }
      })
    })
    .catch( err => {
      
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

}

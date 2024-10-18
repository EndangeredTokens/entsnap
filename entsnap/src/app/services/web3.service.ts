import { Injectable } from '@angular/core';
import { CHAIN_NAMESPACES, SafeEventEmitterProvider, WALLET_ADAPTERS } from '@web3auth/base';
import { Web3Auth } from '@web3auth/modal';
import Web3 from 'web3';
const clientId = "BEvU1vWeozutjpKwBY8W62d_FgSMiH7I01YZmgfowLhuNdmqXLP2Co0wqEqyMl-ahpphLSzvYQaEEo7J5hwMnJo";

@Injectable({
  providedIn: 'root'
})
export class Web3Service {

  web3auth: Web3Auth | null = null;
  provider: SafeEventEmitterProvider | null = null;
  isModalInitialized: boolean = false;

  constructor() { }

  async initWeb3Modal() {

    this.web3auth = new Web3Auth({
      clientId,
      chainConfig: {
        chainNamespace: CHAIN_NAMESPACES.EIP155,
        chainId: "0x1",
        rpcTarget: "https://rpc.ankr.com/eth",
      },
      uiConfig: {
        mode: 'dark',
        logoDark: '../../../assets/icon/logo_ents_home.svg',
        defaultLanguage: 'en',
        appName: 'Entsnap',
        theme: {
          primary: '#535e44',
        }
      }
    });
    const web3auth = this.web3auth;
    await web3auth.initModal({
      modalConfig: {
        [WALLET_ADAPTERS.OPENLOGIN]: {
          label: "openlogin",
          loginMethods: {
            facebook: {
              name: "facebook",
              showOnModal: false,
            },
            discord: {
              name: "discord",
              showOnModal: false,
            },
            twitch: {
              name: "twitch",
              showOnModal: false,
            },
            twitter: {
              name: "twitter",
              showOnModal: false,
            },
            google: {
              name: "google",
              showOnModal: false,
            },
            github: {
              name: "github",
              showOnModal: false,
            },
            linkedin: {
              name: "linkedin",
              showOnModal: false,
            },
            apple: {
              name: "apple",
              showOnModal: false,
            },
            reddit: {
              name: "reddit",
              showOnModal: false,
            },
            sms_passwordless: {
              name: "sms_passwordless",
              showOnModal: false,
            },
            email_passwordless: {
              name: "email_passwordless",
              showOnModal: false,
            },
            kakao: {
              name: "kakao",
              showOnModal: false,
            },
            line: {
              name: "line",
              showOnModal: false,
            },
            wechat: {
              name: "wechat",
              showOnModal: false,
            },
            weibo: {
              name: "weibo",
              showOnModal: false,
            },
          },
        },
      },
    });

    if (this.web3auth.provider) {
      this.isModalInitialized = true;
      this.provider = this.web3auth.provider;
    }

    console.log('[loginWeb3] connected', this.web3auth);

  }

  // subscribeToModalVisibility() {
  //   if(this.web3auth){
  //     this.web3auth.on(LOGIN_MODAL_EVENTS.MODAL_VISIBILITY, (isVisible) => {
  //       console.log("is modal visible", isVisible);
  //     });   
  //   }
  // }

  async connectWallet(): Promise<string> {
    return new Promise(async(resolve, reject) => {

      if (!this.web3auth) {
        console.log("web3auth not initialized yet");
        reject('web3auth not initialized yet');
        return;
      }

      console.log('[loginWeb3] connected', this.web3auth);

      if(this.web3auth.connected) {
        const web3 = new Web3(this.provider as any);
        const accounts = await web3.eth.getAccounts();
  
        const userAddress = accounts[0];
        resolve(userAddress); 
        return;
      }

      const web3auth = this.web3auth;
      this.provider = await web3auth.connect();

      if(this.provider){
        try {
          const web3 = new Web3(this.provider as any);
  
          const accounts = await web3.eth.getAccounts();
  
          const userAddress = accounts[0];
          console.log('[loginWeb3] userAddress ', userAddress);

          resolve(userAddress);
  
        } catch (error) {
          reject(error);
        }
      }else{
        reject('No provider');
      }

    });
  
  }

  getWalletAddress() {
    if(this.web3auth && this.web3auth.connected){
      const web3 = new Web3(this.provider as any);
      return web3.eth.getAccounts();
    }
    return null;
  }

  isConnected() {
    return this.web3auth?.connected;
  }

  disconnectWallet(){
    if(this.web3auth && this.web3auth.connected){
      this.web3auth.logout({ cleanup: true });
      this.web3auth.clearCache();
      console.log('[logout]', this.web3auth);
    }
  }
}
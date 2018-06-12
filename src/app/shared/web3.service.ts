import { Injectable } from '@angular/core';

import { Subject } from 'rxjs';
import { UportService } from './uport.service';

import to from 'await-to-js';

declare let window: any;

declare let require: any;
const contract = require('truffle-contract');

@Injectable({
  providedIn: 'root'
})
export class Web3Service {

  private web3: any;
  private accounts: string[];
  public network = 0;
  public ready = false;
  public accountsObservable = new Subject<string[]>();

  private userCredentials: any;

  constructor(private uport: UportService) {
    window.addEventListener('load', (event) => {
      this.bootstrapWeb3();
    });
  }

  public bootstrapWeb3() {
    this.web3 = this.uport.getWeb3();
  }

  public async artifactsToContract(artifacts) {
    if (!this.web3) {
      const delay = new Promise(resolve => setTimeout(resolve, 100));
      await delay;
      return await this.artifactsToContract(artifacts);
    }
    const contractAbstraction = this.web3.eth.contract(artifacts.abi);
    return contractAbstraction;

  }

  public checkNetwork(): void {
    this.web3.version.getNetwork((err, netId: string) => {
      if (netId === '4' || netId === '3') {
        this.ready = true;
        this.network = parseInt(netId, 10);
      } else {
        this.ready = false;
      }
    });
  }

  // Checks
  public isValidAddress(address: string): boolean {
    return this.web3.isAddress(address);
  }

  public async getCoinBase() {
    let temp;
     await this.web3.eth.getCoinbase((error, result) => {
      console.log(result);
      temp = result;
      this.ready = true;

    });
    return temp;
  }

  public async login() {
    let error, user;
    [error, user] = await to(this.uport.requestCredentials(['name', 'avatar', 'phone']));
    if (!user) { return false; }

    this.userCredentials = user;
    this.ready = true;
    return true;
  }
}

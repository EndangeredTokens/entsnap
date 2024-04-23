import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GeneralUtilityService {

  constructor() { }

  generateRandomInteger() {
    const characters = "0123456789"
    let randomInteger: String = "";
    for (let i = 0; i < 10; i++){
      randomInteger += characters[Math.floor(Math.random() * 10)]
    }
    return randomInteger
  }
}

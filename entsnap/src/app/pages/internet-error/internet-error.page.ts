import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-internet-error',
  templateUrl: './internet-error.page.html',
  styleUrls: ['./internet-error.page.scss'],
})
export class InternetErrorPage implements OnInit {
  
  continueIcon = "../../../assets/icon/button_continue.svg";

  constructor(
    private router: Router,
  ) { }

  ngOnInit() {
  }

}

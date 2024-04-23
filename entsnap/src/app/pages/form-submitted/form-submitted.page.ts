import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-form-submitted',
  templateUrl: './form-submitted.page.html',
  styleUrls: ['./form-submitted.page.scss'],
})
export class FormSubmittedPage implements OnInit {
  
  continueIcon = "../../../assets/icon/button_continue.svg";

  constructor(
    private router: Router,
  ) { }

  ngOnInit() {
  }

}

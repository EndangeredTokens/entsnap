import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MultiLanguageService } from 'src/app/services/multi-language.service';

@Component({
  selector: 'app-form-submitted',
  templateUrl: './form-submitted.page.html',
  styleUrls: ['./form-submitted.page.scss'],
})
export class FormSubmittedPage implements OnInit {
  
  continueIcon = "../../../assets/icon/button_continue.svg";

  public comingFrom = '';
  public treeId = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private multiLanguageService: MultiLanguageService,
    
  ) { }

  ngOnInit() {
    this.comingFrom = this.route.snapshot.paramMap.get('comingFrom') ?? 'not-specified';
    this.treeId = this.route.snapshot.paramMap.get('id') ?? 'not-specified';
    console.log(this.comingFrom)
    console.log(this.treeId)
  }

  goToSeeTree(): void {
    console.log('going to tree '+this.treeId)
    this.router.navigateByUrl('tabs/tree-page/'+this.treeId)
  }

  goToHome(): void {
    this.router.navigateByUrl('tabs/home');
  }

}

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RouteHistoryService } from 'src/app/services/route-history.service';

@Component({
  selector: 'app-r-map-header',
  templateUrl: './r-map-header.component.html',
  styleUrls: ['./r-map-header.component.scss'],
})
export class RMapHeaderComponent implements OnInit {

  back =  "../../../assets/icon/back_button.svg";

  constructor(
    private router: Router,
    private routeHistoryService: RouteHistoryService,
  ) { }

  ngOnInit() {
  }

  goBack() {
    this.router.navigateByUrl(this.routeHistoryService.getPrevUrl()!);
  }

}

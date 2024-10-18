import { Component, OnInit, ViewChild } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ReportService } from 'src/app/services/report.service';
import { Router, ActivatedRoute } from '@angular/router';
import { RouteHistoryService } from 'src/app/services/route-history.service';
import { IonModal } from '@ionic/angular';
import { Location } from '@angular/common';

import { environment } from 'src/environments/environment';
import { MultiLanguageService } from 'src/app/services/multi-language.service';

@Component({
    selector: 'app-tree-page',
    templateUrl: './tree-page.page.html',
    styleUrls: ['./tree-page.page.scss'],
})
export class TreePagePage implements OnInit {
    constructor(
        private reportService: ReportService,
        private route: ActivatedRoute,
        private routeHistoryService: RouteHistoryService,
        private router: Router,
        private location: Location,
        private multiLanguageService: MultiLanguageService,
        
        
    ) {}

    @ViewChild('modalZoom') modal!: IonModal; // this will match the first modal, being the ai options modal

    @ViewChild('modalActions') modalActions!: IonModal; // this will match the first modal, being the ai options modal

    report!: any;
    entName: string = 'Unknown';
    reportId: number | null = null;

    selectedImageSrc: string | null = null;

    backIcon = "../../../assets/icons/basics/chevron-left.svg";

    goBackUrlHistory() {
        const prevUrl =
            this.routeHistoryService.getLoggedInPrevUrl() || '/tabs/home';
        this.router.navigateByUrl(prevUrl);
    }

    async ngOnInit() {
        await this.extractReportIdAndLoadData();
        this.updateEntName();
    }

    async extractReportIdAndLoadData(): Promise<void> {
        try {
            const params = await firstValueFrom(this.route.paramMap);
            const id = params.get('id');
            console.log('id:', id);
            if (id) {
                this.reportId = Number(id);
                console.log('Proof of Life ID:', this.reportId);
                this.report = await this.getReportData(this.reportId);
            }
        } catch (error) {
            console.error('Error fetching proof of life data', error);
        }
    }

    getStageIconPath(): string {
        const stageName = this.report?.data?.stage?.name || '';
        if (stageName && stageName in environment.tree) {
          return environment.tree[stageName as keyof typeof environment.tree];
        }
        return '';
      }
    updateEntName() {
        this.entName = this.reportService.updateEntName(this.report);
    }

    getEndangeredStatus(): string {
        return this.report?.data?.endangered?.status || 'tree_page.status_unknown';
      }  

    isEndangeredDefined(): boolean {
        return !!this.report?.data?.endangered?.status;
      } 

    getReportData(id: number): Promise<any> {
        return firstValueFrom(this.reportService.getReportById(id));
    }

    presentModal(imageSrc: string) {
        this.selectedImageSrc = imageSrc
        this.modal.present()
    }

    presentActionsModal() {
        this.modalActions.present();
    }

    back() {
        this.location.back();
    }


}

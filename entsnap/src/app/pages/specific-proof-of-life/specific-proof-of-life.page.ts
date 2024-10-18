import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { ReportService } from 'src/app/services/report.service';
import { IonModal } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { RouteHistoryService } from 'src/app/services/route-history.service';
import { firstValueFrom } from 'rxjs';
import { MultiLanguageService } from 'src/app/services/multi-language.service';
@Component({
    selector: 'app-specific-proof-of-life',
    templateUrl: './specific-proof-of-life.page.html',
    styleUrls: ['./specific-proof-of-life.page.scss'],
})
export class SpecificProofOfLifePage implements OnInit {
    constructor(
        private userService: UserService,
        private reportService: ReportService,
        private router: Router,
        private routeHistoryService: RouteHistoryService,
        private route: ActivatedRoute,
        private multiLanguageService: MultiLanguageService
    ) {}

    proofOfLifeId: number | null = null;
    proofOfLife: any = {};
    report!: any;
    entName: string = 'Unknown';
    async ngOnInit() {
        await this.extractProofOfLifeIdAndLoadData();
        this.updateEntName();
    }

    goBackUrlHistory() {
        const prevUrl =
            this.routeHistoryService.getLoggedInPrevUrl() || '/tabs/home';
        this.router.navigateByUrl(prevUrl);
    }

    async extractProofOfLifeIdAndLoadData(): Promise<void> {
        try {
            const params = await firstValueFrom(this.route.paramMap);
            const id = params.get('id');
            if (id) {
                this.proofOfLifeId = Number(id);
                console.log('Proof of Life ID:', this.proofOfLifeId);
                this.proofOfLife = await this.getProofOfLifeData(
                    this.proofOfLifeId,
                );
            }
        } catch (error) {
            console.error('Error fetching proof of life data', error);
        }
    }

    getProofOfLifeData(id: number): Promise<any> {
        return firstValueFrom(this.reportService.getReportById(id));
    }
    updateEntName() {
        this.entName = this.reportService.updateEntName(this.report);
    }
}

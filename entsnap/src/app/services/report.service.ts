import {
    HttpClient,
    HttpHeaders,
    HttpRequest,
    HttpResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { Report } from '../models/report';
import { catchError, map, retry, tap } from 'rxjs/operators';
import { UserService } from './user.service';
import { User } from '../models/user';
import { routes } from './routes';
import { ImageService } from './image.service';
import { AuthService } from './auth.service';
import { inputReport } from '../models/inputReport';
import { ReportData} from '../models/reportData';
@Injectable({
    providedIn: 'root',
})
export class ReportService {
    authToken = this.authService.getAuthToken();
    headers!: HttpHeaders;

    constructor(
        private http: HttpClient,
        private imageService: ImageService,
        private routes: routes,
        private userService: UserService,
        private authService: AuthService,
    ) { }

    intializeReport(): inputReport {
        let currentUser = this.userService.getCurrentUser() as User;
        if (currentUser.is_blocked) {
            alert('Este usuario se encuentra bloqueado');
            currentUser = this.userService.generateEmptyUser() as User;
        }

        return {
            user_id: currentUser.id,
            report_data: {},
            gps_geocoder: {},
            image_ids: [],
        };
    }

    submitReport(report: inputReport) {
        this.authToken = this.authService.getAuthToken();
        this.headers = new HttpHeaders({
            Authorization: 'Bearer '+this.authToken || '',
        });

        console.log('["report.service" - submitReport] reporte obtenido luego del submit:', report)
        if (!report.user_id)
            report.user_id = this.userService.getCurrentUser().id;
        return this.http
            .post<Report>(`${this.routes.reportsUrl()}/complete`, report, { headers: this.headers })
            .pipe(catchError(this.handleError('submitReport')));
    }

    submitProofOfLife(report: inputReport) {
        this.authToken = this.authService.getAuthToken();
        this.headers = new HttpHeaders({
            Authorization: 'Bearer '+this.authToken || '',
        });

        console.log("[submitProofOfLife] report:", report);
        console.log("[submitProofOfLife] Auth Token:", this.headers);
        if (!report.user_id)
            report.user_id = this.userService.getCurrentUser().id;
        return this.http
            .post<Report>(`${this.routes.reportsUrl()}/proof-of-life`, report, { headers: this.headers })
            .pipe(catchError(this.handleError('addReport')));
    }

    checkProofOfLifeTimer(proofOfLifeId: number) {
        this.authToken = this.authService.getAuthToken();
        this.headers = new HttpHeaders({
            Authorization: 'Bearer '+this.authToken || '',
        });

        return this.http.get(`${this.routes.reportsUrl()}/${proofOfLifeId}/check-proof-of-life-timer`, { headers: this.headers })
    }

    addReport(report: Report): Observable<any> {
        this.authToken = this.authService.getAuthToken();
        this.headers = new HttpHeaders({
            Authorization: 'Bearer '+this.authToken || '',
        });

        console.log('addReport running, report:', report);
        if (!report.frontal_image) {
            report.frontal_image = 'Firecatch_blankImage.png';
        }
        if (!report.leaf_image) {
            report.leaf_image = 'Firecatch_blankImage.png';
        }
        if (!report.trunk_image) {
            report.trunk_image = 'Firecatch_blankImage.png';
        }
        if (!report.scale_image) {
            report.scale_image = 'Firecatch_blankImage.png';
        }
        console.log('posting', report);
        return this.http
            .post<Report>(this.routes.reportsUrl(), report, { headers: this.headers })
            .pipe(catchError(this.handleError('addReport', report)));
    }

    // To remove
    addReportV3(
        user_id: number,
        image_ids: any,
        gps_geocoder: any,
        report_data?: any,
    ) {
        this.authToken = this.authService.getAuthToken();
        this.headers = new HttpHeaders({
            Authorization: 'Bearer '+this.authToken || '',
        });

        const authToken: string | null = this.authService.getAuthToken();

        console.log('[addReportV3] user_id:', user_id);
        console.log('[addReportV3] image_ids:', image_ids);
        console.log('[addReportV3] gps_geocoder:', gps_geocoder);
        console.log('[addReportV3] report_data:', report_data);
        return this.http
            .post<Report>(
                `${this.routes.reportsUrl()}/complete`,
                { user_id, image_ids, gps_geocoder, report_data }, 
                { headers: this.headers },
            )
            .pipe(catchError(this.handleError('addReport')));
    }

    // To remove
    addProofOfLifeV3(
        user_id: number,
        image_ids: any,
        parent_report_id: number,
    ) {
        this.authToken = this.authService.getAuthToken();
        this.headers = new HttpHeaders({
            Authorization: 'Bearer '+this.authToken || '',
        });
        
        const authToken: string | null = this.authService.getAuthToken();

        return this.http
            .post<Report>(
                `${this.routes.reportsUrl()}/proof-of-life`,
                { user_id, image_ids, parent_report_id }, 
                { headers: this.headers },
            )
            .pipe(catchError(this.handleError('addReport')));
    }

    extractReport(res: any): Report {
        console.log(res);
        return res.data;
    }

    extractReports(res: any): Report[] {
        console.log(res);
        return res.data;
    }

    // To remove
    generateEmptyReport(): Report {
        let currentUser = this.userService.getCurrentUser() as User;
        if (currentUser.is_blocked) {
            alert('Este usuario se encuentra bloqueado');
            currentUser = this.userService.generateEmptyUser() as User;
        }
        return {
            // id: -1,
            user_id: currentUser.id!,
            acot_validation: 0,
            conaf_validation: 0,
            type: 2,
            user_name: currentUser.name!,
            user_avatar: currentUser.avatar,
            short_description: '',
            description: '',
            date: undefined,
            latitude: 0,
            longitude: 0,
            address_type: 0,
            address: '',
            street_number: '',
            street_name: '',
            city: '',
            province: '',
            county: '',
            country: '',
            map: '',
            frontal_image: this.imageService.getDefaultImage(),
            leaf_image: this.imageService.getDefaultImage(),
            trunk_image: this.imageService.getDefaultImage(),
            scale_image: this.imageService.getDefaultImage(),
            stage_id: 1,
            foliage_id: 1,
            tree_type: 'Arbolito',
            trunk_diameter: 231,
            surrounding_desc: '',
            poem: '',
            completed: false,
            validated: false,
            minted: false,
            endangered: false,
            hidden: false,
            comments: [],
            is_draft: false,
            report_id: -2,
            type_id: 1,
            gps_geocoder: {
                latitude: undefined,
                longitude: undefined,
                accuracy: undefined,
                heading: undefined,
                street_address: undefined,
                route: '',
                locality: '',
                country: '',
                administrative_area_level_1: '',
                administrative_area_level_2: '',
                administrative_area_level_3: '',
            },
        };
    }
    // user_id
    // latitude
    // longitude
    // stage_id
    // foliage_id
    // tree_type
    // trunk_diameter
    // surrounding_desc
    // poem
    // mint_transaction_hash
    getReportById(report_id: number) {
        return this.http
            .get<Report>(`${this.routes.reportsUrl()}/${report_id}`)
            .pipe(
                tap((_) => console.log('fetched report')),
                map((response) => this.extractReport(response)),
                catchError(this.handleError('getById', null)),
            );
    }
    updateEntName(report: Report): string {
        if (!report || !report.data) {
            return "Unknown";
        }
        const { common_name, specie, tree_type } = report.data;
        if (common_name) return common_name;
        if (specie) return specie;
        if (tree_type) return tree_type;
        return "Unknown";
    }

    getLabel(type: number): string {
        switch (type) {
            case 2:
                return 'Fuego en Zona Forestal';
            default:
                return 'Error';
        }
    }

    getNear(
        lat: number,
        lng: number,
        notif_dist: number,
    ): Observable<Report[]> {
        return this.http.get<Report[]>(this.routes.reportsUrl()).pipe(
            tap((_) => console.log('fetched notifications')),
            map((response) => this.extractReports(response)),
            catchError(this.handleError('getNear', [])),
        );
    }

    getReports(id: number): Observable<Report[]> {
        return this.http
            .get<Report[]>(`${this.routes.reportsUrl()}/users/${id}`)
            .pipe(
                tap((_) => console.log('fetched reports')),
                map((response) => this.extractReports(response)),
                catchError(this.handleError('getNear', [])),
            );
    }

    private handleError<T>(operation = 'operation', result?: T) {
        return (error: any): Observable<T> => {
            console.log(error);
            console.log(`${operation} failed: ${error.message}`);
            return of(result as T);
        };
    }
    
}

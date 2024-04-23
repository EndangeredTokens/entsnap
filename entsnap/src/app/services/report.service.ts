import { HttpClient, HttpHeaders, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { Report } from '../models/report';
import { catchError, map, retry, tap } from 'rxjs/operators';
import { UserService } from './user.service';
import { User } from '../models/user';
import { routes } from './routes';
import { ImageService } from './image.service';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  constructor(
    private http: HttpClient,
    private imageService: ImageService,
    private routes: routes,
    private userService: UserService
  ) { }

  addReport(report: Report): Observable<any> {
    if (!report.frontal_image) {
      report.frontal_image = "Firecatch_blankImage.png";
    }
    if (!report.leaf_image) {
      report.leaf_image = "Firecatch_blankImage.png";
    }
    if (!report.trunk_image) {
      report.trunk_image = "Firecatch_blankImage.png";
    }
    if (!report.scale_image) {
      report.scale_image = "Firecatch_blankImage.png";
    }
    console.log("posting", report);
    return this.http.post<Report>(this.routes.reportsUrl(), report)
      .pipe(
        catchError(this.handleError('addReport', report))
      );
  }

  extractReport(res: any): Report {
    console.log(res);
    return res.report;
  }

  extractReports(res: any): Report[] {
    console.log(res);
    return res.reports;
  }

  generateEmptyReport(): Report {
    let currentUser = this.userService.getCurrentUser() as User;
    if (currentUser.is_blocked) {
      alert('Este usuario se encuentra bloqueado');
      currentUser = this.userService.generateEmptyUser() as User;
    }
    return {
      id: -1,
      UserId: currentUser.id!,
      acot_validation: 0,
      conaf_validation: 0,
      type: 2,
      user_name: currentUser.name!,
      user_avatar: currentUser.avatar,
      short_description: "",
      description: "",
      date: undefined,
      latitude: 0,
      longitude: 0,
      address_type: 0,
      address: "",
      street_number: "",
      street_name: "",
      city: "",
      province: "",
      county: "",
      country: "",
      map: "",
      frontal_image: this.imageService.getDefaultImage(),
      leaf_image: this.imageService.getDefaultImage(),
      trunk_image: this.imageService.getDefaultImage(),
      scale_image: this.imageService.getDefaultImage(),
      stage: 0,
      foliage: 0,
      tree_type: "",
      trunk_diameter: "",
      surrounding_desc: "",
      poem: "",
      completed: false,
      validated: false,
      minted: false,
      endangered: false,
      hidden: false,
      comments: [],
      is_draft: false,
    }
  }

  getReportById(report_id: number) {
    return this.http.get<Report>(`${this.routes.reportsUrl()}/${report_id}`)
      .pipe(
        tap(_ => console.log("fetched report")),
        map(response => this.extractReport(response)),
        catchError(this.handleError('getById', null))
      )
  }

  getLabel(type: number): string {
    switch (type) {
      case 2:
        return "Fuego en Zona Forestal"
      default:
        return "Error"
    }
  }

  getNear(lat: number, lng: number, notif_dist: number): Observable<Report[]> {
    return this.http.get<Report[]>(this.routes.reportsUrl())
      .pipe(
        tap(_ => console.log("fetched notifications")),
        map(response => this.extractReports(response)),
        catchError(this.handleError('getNear', []))
      );
  }

  getReports(id: number): Observable<Report[]> {
    return this.http.get<Report[]>(`${this.routes.reportsUrl()}/userid/${id}`)
      .pipe(
        tap(_ => console.log("fetched reports")),
        map(response => this.extractReports(response)),
        catchError(this.handleError('getNear', []))
      );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.log(error)
      console.log(`${operation} failed: ${error.message}`);
      return of(result as T);
    }
  }

}

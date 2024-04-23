import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { Router } from "@angular/router";
import { User } from "src/app/models/userShort";
import { ImageService } from "src/app/services/image.service";
import { ReportService } from "src/app/services/report.service";
import { UserService } from "src/app/services/user.service";
import { Report } from "../../models/report";
import { Comment } from "src/app/models/comment";

@Component({
  selector: "app-notifications",
  templateUrl: "./notifications.component.html",
  styleUrls: ["./notifications.component.scss" ],
})
export class NotificationsComponent implements OnInit {
  backendUrl = "http://";
  displayImage?: boolean;
  reports: Report[] = [];
  users: User[] = [];
  comments: Comment[] = [];
  fetchedArray2: any[] = [];
  fetchedArray: any[] = [];
  loading = false;
  newReports: any[] = [];
  actualizado: boolean = false;

  constructor(
    private changeDetection: ChangeDetectorRef,
    private imageService: ImageService,
    private reportService: ReportService,
    private router: Router,
    private userService: UserService,
  ) { }

  ngOnInit() {
    this.newReports = [];
    this.refreshFeed();
    //setInterval(_=> this.refreshFeed(), 120000);
  }

  addUrl(image: string): string {
    if(image.includes("http://") || image.includes("https://")) return image;
    let image_v = this.imageService.addUrl(image);
    //console.log(image_v);
    return image_v;
  }

  doRefresh(event: any): void {
    this.refreshFeed();
    setTimeout((_: any) => {
      event.target.complete();
    }, 2000);
  }

  getUpdatedUsers(): void {
    this.userService.getUsers().subscribe((users) => {
      this.users = users;
      this.updateData();
    });
  }

  refreshFeed(): void {
    switch (this.router.url) {
      case "/tabs/ents":
        console.log("case refresh ents");
        this.refreshEntsFeed(true);
        break;
      case "/tabs/profile":
        console.log("case refresh user");
        this.refreshUserFeed(false);
        break;
      case "/tabs/map":
        console.log("case refresh loc");
        this.refreshLocFeed(this.router.url == "/tabs/map");
        break;
      default:
        console.log("case refresh default");
    }
  }


  refreshLocFeed(picture: boolean): void {
    this.loading = true;
    this.fetchedArray = [];
    this.fetchedArray2 = [];
    console.log("refreshLocFeed")
    this.displayImage = picture;
    // this.locService.setCurrentPosition().then((_) => {
    //   var position = this.locService.getCoords();
    //   var notif_dist = this.userService.getCurrentUser().notif_dist;
    //   this.reportService
    //     .getNear(position.latitude, position.longitude, notif_dist)
    //     .subscribe((reports) => {
    //       console.log("reports is:", reports)
    //     });
    //   this.orderfetchedArray();
    // });
    //setTimeout(_ => {this.orderfetchedArray();}, 8000);
  }

  orderfetchedArray() {
    console.log("orderfetchedArray")
    var lenght, i, j, aux;
    lenght = this.fetchedArray2.length;
    for (j = 1; j < lenght; j++) {
      for (i = 0; i < lenght - j; i++) {
        if (this.fetchedArray2[i].date < this.fetchedArray2[i + 1].date) {
          aux = this.fetchedArray2[i];
          this.fetchedArray2[i] = this.fetchedArray2[i + 1];
          this.fetchedArray2[i + 1] = aux;
        }
      }
    }
    this.fetchedArray = this.fetchedArray2;
    this.loading = false;
    this.getUpdatedUsers();
  }

  refreshEntsFeed(picture: boolean): void {
    this.fetchedArray = [];
    this.newReports = [];
    this.displayImage = picture;
    const user = this.userService.getCurrentUser();
    console.log("user is", user);
    this.reportService.getReports(user.id!).subscribe(
      data => {
        if (data === undefined) {
          console.log("error");
        } else {
          const length: number = data.length;
          let i: number, j: number, aux: any;
          for (j = 1; j < length; j++) {
            for (i = 0; i < length - j; i++) {
              if (data[i].date! < data[i + 1].date!) {
                aux = data[i];
                data[i] = data[i + 1];
                data[i + 1] = aux;
              }
            }
          }
          let k: number;
          for (k = 0; k < length; k++) {
            this.newReports[k] = data[k];
            console.log(data[k]);
          }
        }
      },
      error => {
        console.error('Error obteniendo reportes:', error);
      }
    );
    this.getUpdatedUsers();
  }

  refreshUserFeed(picture: boolean): void {
    this.fetchedArray = [];
    this.displayImage = picture;
    // this.userService.getCurrentUser().reports.map((report) => {
    //   this.fetchedArray.push(report);
    // });
    var lenght, i, j, aux;
    lenght = this.fetchedArray.length;
    for (j = 1; j < lenght; j++) {
      for (i = 0; i < lenght - j; i++) {
        if (this.fetchedArray[i].date < this.fetchedArray[i + 1].date) {
          aux = this.fetchedArray[i];
          this.fetchedArray[i] = this.fetchedArray[i + 1];
          this.fetchedArray[i + 1] = aux;
        }
      }
    }
    this.reports = this.fetchedArray;
    this.getUpdatedUsers();
  }

  showExplanation(): void {
    alert(
      "Tu reporte está siendo revisado, te avisaremos cuando este haya sido aprobado"
    );
  }

  showExplanationRejected(): void {
    alert("Tu reporte fue rechazado");
  }

  updateData(): void {
    this.fetchedArray.forEach((arr) => {
      var user = this.users.find((user) => user.id === arr.UserId);
      arr.user_name = user!.name;
      arr.user_avatar = user!.avatar;
    });
    this.changeDetection.detectChanges();
  }

  onSelect(arr: any) {
    this.router.navigate(["/ents", arr.id])
    console.log("/ents", arr.id)
  }
}

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, retry, tap } from 'rxjs/operators';
import { User } from '../models/userShort';
import { Report } from '../models/report'
// import { ImageService } from './image.service';
import { routes } from './routes';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  currentUser: User = this.generateEmptyUser()
  FBuser: any;
  headers!: HttpHeaders;
  authToken!: string | null;

  constructor(
    private http: HttpClient,
    // private imageService: ImageService,
    private routes: routes,
  ) { }

  addUser(user: User): Observable<any> {
    return this.http.post<User>(this.routes.usersUrl(), user)
      .pipe(
        catchError(this.handleError('addUser', user))
      );
  }

  // copyFBUser(FBuser): void {
  //   console.log(FBuser);
  //   this.currentUser.uid = FBuser.uid;
  //   this.currentUser.name = FBuser.displayName;
  //   this.currentUser.email = FBuser.email;
  //   this.currentUser.password_hash = "";
  //   this.currentUser.phone = FBuser.phoneNumber;
  //   console.log("Adding: ", this.currentUser)
  //   this.addUser(this.currentUser)
  //     .subscribe(res => {
  //       console.log(res.message);
  //       this.setCurrentUser(FBuser.uid);
  //     });
  // }

  extractUser(res: any): User {
    console.log(res);
    return res.user;
  }

  extractUsers(res: any): User[] {
    console.log(res);
    return res.users;
  }

  generateEmptyUser(): User {
    return {
      id: undefined,
      uid: undefined,
      role: 1, //Change before release
      name: undefined,
      last_name: undefined,
      email: undefined,
      password_hash: undefined,
      phone: undefined,
      address: "",
      city: "none",
      country_id: undefined,
      latitude: 0,
      longitude: 0,
      biography: "",
      notif_dist: 50,
      recieve_notif: true,
      recieve_comm: true,
      is_private: true,
      is_blocked: false,
      // avatar: this.imageService.getDefaultAvatar(), //check
      avatar: "",
      wallet_address: '',
      tag_name: '',
      wallets: []
    }
  }

  getCurrentUser(): User {
    return this.currentUser;
    // return JSON.parse(localStorage.getItem("user"));
  }

  getUserById(user_id: number): Observable<User | null> {
    return this.http.get<User>(`${this.routes.usersUrl()}/${user_id}`)
      .pipe(
        tap(_ => console.log("fetched user")),
        map(this.extractUser),
        catchError(this.handleError("getUserById", null))
      )
  }

  getUserByEmail(email: string) {
    return this.http.get<any>(`${this.routes.usersUrl()}?email=${email}`);
  }

  resetPasswordByEmail(email: string, newPassword: string, totp: string) {
    const data = {
      email: email,
      totp: totp,
      new_password: newPassword,
    }

    return this.http.patch<any>(`${this.routes.authUrl()}/reset-password`, data);
  }

  updateUserPasswordById(user_id: number, password: string) {
    this.authToken = localStorage.getItem('auth_token'); // Avoid using authService to get the auth token, this may cause circular dependecy.
    this.headers = new HttpHeaders({
      Authorization: 'Bearer '+this.authToken || '',
    });

    return this.http.put<any>(`${this.routes.usersUrl()}/${user_id}`, {password: password}, { headers: this.headers });
  }

  getUserByUid(user_uid: string): Observable<User | null> {
    return this.http.get<User>(`${this.routes.usersUrl()}/FB/${user_uid}`)
      .pipe(
        tap(_ => console.log("fetched user")),
        map(this.extractUser),
        catchError(this.handleError("getUserByUid", null))
      )
  }

  // getUserByUidIfExists(user): Observable<User> {
  //   return this.http.get<User>(`${this.routes.usersUrl()}/FB/${user.uid}`)
  //     .pipe(
  //       tap(_ => console.log("fetched user")),
  //       map(this.extractUser),
  //       catchError(this.handleFBUserError(user))
  //     )
  // }

  // getUsers(): Observable<User[]> {
  //   return this.http.get<User[]>(`${this.routes.usersUrl()}/info`)
  //     .pipe(
  //       tap(_ => console.log("fetched users")),
  //       map(this.extractUsers),
  //       catchError(this.handleError("getUsers", []))
  //     )
  // }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.log(error);
      console.log(`${operation} failed: ${error.message}`);
      return of(result as T);
    }
  }

  // private handleFBUserError<T>(result?: T) {
  //   return (error: any): Observable<T> => {
  //     console.log(error);
  //     this.copyFBUser(result);
  //     return of(result as T);
  //   }
  // }

  pushUpdate(): Observable<any> {
    return this.updateUser(this.currentUser);
  }

  // setCurrentUser(user_uid: string): void {
  //   this.getUserByUid(user_uid)
  //       .subscribe(user => {this.currentUser = user;});
  // }

  setUserData(user: User): void {
    this.currentUser = user;
    localStorage.setItem("user", JSON.stringify(user));
  }

  // setCurrentUserBody(user): void {
  //   this.getUserByUidIfExists(user)
  //       .subscribe(
  //         user => {
  //           this.currentUser = user;
  //           this.fcmService.user_lat = user.latitude;
  //           this.fcmService.user_lng = user.longitude;
  //           this.fcmService.subscribeCity(user.city);
  //           if (!user.recieve_notif) {
  //             this.fcmService.unsubscribe();
  //           }
  //         },
  //         err => {
  //           console.log(err);
  //           this.copyFBUser(user);
  //         }
  //       );
  //   console.log("login", this.currentUser);
  // }

  testPost(): void {
    this.addUser(this.currentUser).subscribe(res => console.log(res.message))
  }

  updateAddress(lat: number, lng: number, address: string, city: string): void {
    this.currentUser.latitude = lat;
    this.currentUser.longitude = lng;
    this.currentUser.address = address;
    this.currentUser.city = city;
  }

  updateCountry(country_id: number) {
    this.currentUser.country_id = country_id;
  }

  updateAvatar(avatar: string): void {
    this.currentUser.avatar = avatar;
  }

  updateBiography(biography: string): void {
    this.currentUser.biography = biography;
  }

  updateEmail(email: string): void {
    this.currentUser.email = email;
  }

  updateName(name: string): void {
    this.currentUser.name = name;
  }

  updateLastName(last_name: string): void {
    this.currentUser.last_name = last_name;
  }

  updatePrivacy(is_private: boolean): void {
    this.currentUser.is_private = is_private;
  }

  updateTag(tag_name: string) {
    this.currentUser.tag_name = tag_name;
  }

  updateUser(user: User): Observable<any> {
    this.authToken = localStorage.getItem('auth_token'); // Avoid using authService to get the auth token, this may cause circular dependecy.
    this.headers = new HttpHeaders({
      Authorization: 'Bearer '+this.authToken || '',
    });

    console.log("avatar:", user.avatar)
    return this.http.put<User>(`${this.routes.usersUrl()}/${user.id}`, user, { headers: this.headers });
  }

  updateUserWallet(id: number | undefined, data: { walletAddress: string }): Observable<any> {
    this.authToken = localStorage.getItem('auth_token'); // Avoid using authService to get the auth token, this may cause circular dependecy.
    this.headers = new HttpHeaders({
      Authorization: 'Bearer '+this.authToken || '',
    });

    return this.http.put<User>(`${this.routes.usersUrl()}/${id}/wallet`, data, { headers: this.headers });
  }

  getCountryList() {
    return this.http.get<any>(this.routes.countriesUrl());
  }

}

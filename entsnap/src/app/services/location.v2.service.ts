import {
    EventEmitter,
    Injectable,
    ViewChild,
    ViewChildren,
} from '@angular/core';
import { Router } from '@angular/router';
import { Geolocation, Position } from '@capacitor/geolocation';
// import { AndroidPermissions } from '@ionic-native/android-permissions';
// import { LocationAccuracy } from '@ionic-native/location-accuracy';
import { Subject } from 'rxjs';
import { Address } from '../models/address';
import GeolocationMarker from 'geolocation-marker';
import { ReportService } from './report.service';
import { AuthService } from './auth.service';
import { MapData } from '../models/maps';
import { ReportStepsService } from './report-steps.service';
import { LoadingService } from './loading.service';
import { environment } from 'src/environments/environment';
import { AddressV2 } from '../models/addressV2';
import { Loader } from '@googlemaps/js-api-loader';
import { UserService } from './user.service';
import { number } from 'zod';
import { Report } from '../models/report';
import { GpsGeocoder } from '../models/gpsGeocoder';

declare var google: any;

@Injectable({
    providedIn: 'root',
})
export class LocationV2Service {
    defaultPosition: Position = {
        timestamp: 0,
        coords: {
            latitude: -33.447,
            longitude: -70.673,
            accuracy: 100,
            altitudeAccuracy: 100,
            altitude: 100,
            speed: 0,
            heading: null,
        },
    };

    newReportPosition?: GpsGeocoder;

    // googleNuevo: any;

    userId: number | undefined;

    mapData: any;

    position: Position = this.defaultPosition;
    geocoder?: google.maps.Geocoder;
    watcherID?: string;
    address?: AddressV2 | any;
    current_city?: string;

    point?: google.maps.LatLng;
    mapDataList: MapData[] = [];

    isOfflineMode: boolean;

    positionCircle: any;

    isMarkerClicked: boolean = false;
    currentMarkerEntId!: any;
    allowValidateEnt: boolean = false;

    mapMarkers: any[] = [];

    entMarkerRadius: number = 5;

    centerLocation: any;

    markerClickEvent: EventEmitter<any> = new EventEmitter<any>()
    mapClickEvent: EventEmitter<any> = new EventEmitter<any>();
    
    openMarkersIDs: any;

    currentTreeMarkersIndex = 0;

    currentPosition = {
      lat: -33.447,
      lon: -70.673,
    }

    handleMarkerClick(entId: any, allowEntValidation: any): any {
      const markerData = { entId, allowEntValidation}
      this.markerClickEvent.emit(markerData)
    }



    entPositionCircle?: google.maps.Circle;

    constructor(
        private router: Router,
        private reportService: ReportService,
        private authService: AuthService,
        private reportStepService: ReportStepsService,
        private loadingService: LoadingService,
        private userService: UserService,
    ) {
        // const loader = new Loader({
        //   apiKey: "AIzaSyDH8wba6-GanXas_Yp0c13G88UkC2aBbOc",
        // })

        // loader.load().then(async () => {
        //   console.log("LOADED GOOGLE MAPS API")
        // })
        if (typeof google !== 'undefined') {
            console.log(
                '[location.v2.service] constructor google is not undefined',
            );
            this.initializeGoogleMaps();
        } else {
            console.log(
                '[location.v2.service] constructor google is undefined',
            );
            this.waitForGoogleMapsApi().then(() => {
                this.initializeGoogleMaps();
            });
        }

        this.isOfflineMode = this.authService.isOfflineMode() || false;

        this.userId = userService.getCurrentUser().id;
    }

    initializeGoogleMaps(): void {
        this.point = this.positionToLatLng(this.position);
        this.geocoder = new google.maps.Geocoder();
        this.entPositionCircle = new google.maps.Circle({
            radius: this.entMarkerRadius, // In meters
            strokeColor: '#22c55e',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#22c55e',
            fillOpacity: 0.35,
            visible: true,
        });
    }

    async google() {
        await this.waitForGoogleMapsApi();
    }

    async waitForGoogleMapsApi(): Promise<void> {
        const loader = new Loader({
            apiKey: environment.googleMapsApiKey,
            libraries: ['maps', 'geometry', 'geocoding'],
        });

        await loader
            .load()
            .then(() => {
                console.log('LOADED GOOGLE MAPS API');
            })
            .catch((error) => {
                console.log('RELOAD GOOGLE MAPS API error:', error);
            });
    }

    setNewReportPosition(newPosition: GpsGeocoder) {
        this.newReportPosition = newPosition;
    }

    positionToLatLng(position: Position): google.maps.LatLng {
        const locationLatLng = new google.maps.LatLng(
            position.coords.latitude,
            position.coords.longitude,
        );
        return locationLatLng;
    }

    async _updatePositionRelated(): Promise<void> {
        if (this.isOfflineMode === false) {
            // updates maps
            this.updateMapsPosition(
                this.positionToLatLng(this.position),
                this.position.coords.accuracy,
            );
            // geocode location
            await this.geocodeLocation(this.positionToLatLng(this.position));

            // console.log(
            //     '[_updatePositionRelated] updating stored report gps geocoder with this.position.coords:',
            //     this.position.coords,
            // );

            const coords = this.position.coords;

            if (this.reportStepService.storedReport) {
                this.reportStepService.updateStoredReportGpsGeocoder({
                    latitude: coords.latitude,
                    longitude: coords.longitude,
                    accuracy: coords.accuracy,
                    heading: coords.heading,
                });
            }

            // update report/preview location
            if (this.reportStepService.preview) {
                this.reportStepService.setReportLatLon([
                    this.position.coords.latitude,
                    this.position.coords.longitude,
                ]);

                this.reportStepService.setPreviewGpsGeocoderLatLng([
                    this.position.coords.latitude,
                    this.position.coords.longitude,
                ]);

                this.reportStepService.setPreviewGpsGeocoderAccHead(
                    this.position.coords,
                );
            }
        }
    }

    // Not Used
    async requestPermission() {
        await Geolocation.requestPermissions();
    }

    async updatePosition(): Promise<Position> {
        try {
            let position = await Geolocation.getCurrentPosition();
            console.log(
                '-- update current position, old',
                this.position,
                'new',
                position,
            );
            this.position = position;

            if (this.isOfflineMode === false) {
                await this._updatePositionRelated();
            }
        } catch (error) {
            console.error('failed to get current position, error:', error);
        }
        return this.position;
    }

    positionChanged(newPosition: Position): boolean {
        return (
            this.position.coords.latitude !== newPosition.coords.latitude ||
            this.position.coords.longitude !== newPosition.coords.longitude ||
            this.position.coords.accuracy !== newPosition.coords.accuracy ||
            this.position.coords.heading !== newPosition.coords.heading
        );
    }

    async startPositionWatcher() {
        if (this.watcherID) {
            console.log('watcher already started');
            return;
        }
        this.watcherID = await Geolocation.watchPosition(
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            },
            async (position: Position | null, err?: any) => {
                if (position && this.positionChanged(position)) {
                    console.log(
                        'watcher updated position to',
                        position,
                        'with err',
                        err,
                    );
                    this.position = position;

                    if (this.isOfflineMode === false) {
                        await this._updatePositionRelated();
                    }
                }
                // THIS PRODUCE A LOT OF SPAM, UNCOMMENT ONLY WHEN NEEDED!!!
                // else {
                //     console.log("watcher position didnt change")
                // }
            },
        );
        console.log('watcher id is', this.watcherID);
    }

    async stopPositionWatcher() {
        if (!this.watcherID) {
            console.log('no watcher running');
        }
        await Geolocation.clearWatch({
            id: this.watcherID!,
        }).then(() => {
            this.watcherID = undefined;
        });
    }

    async geocodeLocation(
        location: google.maps.LatLng,
        callback?: any,
    ): Promise<void> {
        // try {
        //     const results = await new Promise<
        //         google.maps.GeocoderResult[] | null
        //     >((resolve, reject) => {
        //         this.geocoder?.geocode({ location }, (results, status) => {
        //             if (status === 'OK') {
        //                 resolve(results);
        //             } else {
        //                 reject(new Error(`Geocoder failed due to: ${status}`));
        //             }
        //         });
        //     });
        //
        //     if (!results || results.length === 0) {
        //         console.log('No results found');
        //         return;
        //     }
        //
        //     const addressComponents = results[0].address_components;
        //
        //     if (!addressComponents) {
        //         console.log('Address components not available');
        //         return;
        //     }
        //
        //     console.log('[geocodeLocation] results[0]:', results[0]);
        //     console.log(
        //         '[geocodeLocation] address_components:',
        //         addressComponents,
        //     );
        //
        //     // Initialize address
        //     this.address = {
        //         street_address: null,
        //         route: null,
        //         locality: null,
        //         administrative_area_level_3: null,
        //         administrative_area_level_2: null,
        //         administrative_area_level_1: null,
        //         country: null,
        //     };
        //
        //     addressComponents.forEach((component) => {
        //         switch (true) {
        //             case component.types.includes('street_number'):
        //                 this.address.street_address = component.long_name;
        //                 break;
        //             case component.types.includes('route'):
        //                 this.address.route = component.long_name;
        //                 break;
        //             case component.types.includes('locality'):
        //                 this.address.locality = component.long_name;
        //                 break;
        //             case component.types.includes(
        //                 'administrative_area_level_3',
        //             ):
        //                 this.address.administrative_area_level_3 =
        //                     component.long_name;
        //                 break;
        //             case component.types.includes(
        //                 'administrative_area_level_2',
        //             ):
        //                 this.address.administrative_area_level_2 =
        //                     component.long_name;
        //                 break;
        //             case component.types.includes(
        //                 'administrative_area_level_1',
        //             ):
        //                 this.address.administrative_area_level_1 =
        //                     component.long_name;
        //                 break;
        //             case component.types.includes('country'):
        //                 this.address.country = component.long_name;
        //                 break;
        //         }
        //     });
        //
        //     console.log('[geocodeLocation] address object:', this.address);
        //     // this.reportStepService.updateStoredReportGpsGeocoder(this.address);
        //
        //     // Handle the address update
        //     if (this.reportStepService.preview) {
        //         this.reportStepService.setReportAddress(this.address);
        //         this.reportStepService.setPreviewGpsGeocoderAddress(
        //             this.address,
        //         );
        //     }
        // } catch (error: any) {
        //     console.error('Geocoder failed due to: ', error.message);
        // }
        await this.geocoder?.geocode(
            { location: location },
            (
                results: google.maps.GeocoderResult[] | null,
                status: google.maps.GeocoderStatus,
            ) => {
                if (status === 'OK') {
                    if (results) {
                        // console.log('[geocodeLocation] results:', results);
                        if (results[0]) {
                            // console.log(
                            //     '[geocodeLocation] results[0]:',
                            //     results[0],
                            // );
                            // console.log(results);
                            const addressComponents =
                                results[0].address_components;
                            // console.log(
                            //     '[geocodeLocation] address_components:',
                            //     addressComponents,
                            // );
                            //
                            // Initialize address
                            this.address = {
                                street_address: null,
                                route: null,
                                locality: null,
                                administrative_area_level_3: null,
                                administrative_area_level_2: null,
                                administrative_area_level_1: null,
                                country: null,
                            };

                            addressComponents.forEach((component) => {
                                if (component.types.includes('street_number')) {
                                    this.address.street_address =
                                        component.long_name;
                                } else if (component.types.includes('route')) {
                                    this.address.route = component.long_name;
                                } else if (
                                    component.types.includes('locality')
                                ) {
                                    this.address.locality = component.long_name;
                                } else if (
                                    component.types.includes(
                                        'administrative_area_level_3',
                                    )
                                ) {
                                    this.address.administrative_area_level_3 =
                                        component.long_name;
                                } else if (
                                    component.types.includes(
                                        'administrative_area_level_2',
                                    )
                                ) {
                                    this.address.administrative_area_level_2 =
                                        component.long_name;
                                } else if (
                                    component.types.includes(
                                        'administrative_area_level_1',
                                    )
                                ) {
                                    this.address.administrative_area_level_1 =
                                        component.long_name;
                                } else if (
                                    component.types.includes('country')
                                ) {
                                    this.address.country = component.long_name;
                                }
                            });
                            //
                            // console.log(
                            //     '[geocodeLocation] address object:',
                            //     this.address,
                            // );
                            this.reportStepService.updateStoredReportGpsGeocoder(
                                this.address,
                            );
                            // callback here
                            if (this.reportStepService.preview) {
                                this.reportStepService.setReportAddress(
                                    this.address,
                                );
                                this.reportStepService.setPreviewGpsGeocoderAddress(
                                    this.address,
                                );
                            }
                        } else {
                            console.log('No results found');
                        }
                    } else {
                        console.log('Geocoder no encontró resultados');
                    }
                } else {
                    console.log('Geocoder failed due to: ', status);
                }
            },
        );
    }

    checkIntersection(circle1: any, circle2: any) {
        const center1 = circle1.getCenter();
        const center2 = circle2.getCenter();

        var maxDist = circle1.getRadius() + circle2.getRadius();
        var actualDist = google.maps.geometry.spherical.computeDistanceBetween(
            center1,
            center2,
        );

        return maxDist >= actualDist;
    }

    async getMapMarkers(lat: number, lng: number) {
        return new Promise((resolve, reject) => {
            this.mapMarkers = []
            this.reportService.getNear(lat, lng, 50).subscribe({
                next: async (reports: any) => {
                    console.log("[location service - getMapMarkers] reports:", reports);
                    for (const report of reports) {
                        if (report.user_id == this.userId || report.status.id == 3 || report.status.id == 5) {
                            this.mapMarkers.push(report);
                        }
                        
                        resolve(reports);
                    }
                    
                },
                error: (err: any) => {
                    reject(err);
                },
            });
        });
    }

    /**
     * Returns list of markers ids that intersect with current user position
     * Returns list of markers ids that are in range
     */
    async getClosestMarkersInRange(range?: number, lat?: number, lng?: number): Promise<{
        intersectingMarkers: { marker: any; distance: number }[];
        closeMarkers: { marker: any; distance: number }[];
    }> {
        console.log('Location service fn obtainClosesMarker is called');

        // Initialize list for markers that intersect user
        const intersectingMarkers: { marker: any; distance: number }[] = [];

        // Initialize list for markers that are in range
        const closeMarkers: { marker: any; distance: number }[] = [];

        // Fetch markers
        await this.getMapMarkers(
            this.position.coords.latitude,
            this.position.coords.longitude,
        );

        console.log('Validando');
        console.log('this.mapMarkers', this.mapMarkers);
        console.log('this.position', this.position);
        console.log('this.position.coords', this.position.coords);
        // Check if there are markers
        if (!this.mapMarkers) {
            console.log('Missing map markers');
            return { intersectingMarkers, closeMarkers };
        }

        // Check if user position is set
        if (!this.position) {
            console.log('Missing current user position');
            return { intersectingMarkers, closeMarkers };
        }

        // Aditional user position validation
        if (!this.position.coords) {
            console.log('Missing current user position coords');
            return { intersectingMarkers, closeMarkers };
        }

        // Distancia maxima de interseccion ent y usuario
        const distanceRadius =
            this.entMarkerRadius + this.position.coords.accuracy;

        this.mapMarkers.forEach((marker: any) => {
            if (marker.gps_geocoder) {
                let distance;
                if (lat && lng) {
                    distance =
                        google.maps.geometry.spherical.computeDistanceBetween(
                            new google.maps.LatLng(
                                lat,
                                lng,
                            ),
                            new google.maps.LatLng(
                                marker.gps_geocoder.latitude,
                                marker.gps_geocoder.longitude,
                            ),
                        );
                } else {
                    distance =
                        google.maps.geometry.spherical.computeDistanceBetween(
                            new google.maps.LatLng(
                                this.position.coords.latitude,
                                this.position.coords.longitude,
                            ),
                            new google.maps.LatLng(
                                marker.gps_geocoder.latitude,
                                marker.gps_geocoder.longitude,
                            ),
                        );
                }

                if (distance <= distanceRadius) {
                    intersectingMarkers.push({ marker: marker, distance });
                }

                if (range) {
                    if (distance <= range && (marker.status.id == 3 || marker.status.id == 5)) {
                        console.log({ marker: marker, distance })
                        closeMarkers.push({ marker: marker, distance });
                    }
                }
            } else {
                console.log(
                    'marker does not have gps_geocoder, must be a proof-of-life',
                );
            }
        });
        console.log('[getClosestMarkersInRange] ended forEach');

        console.log('Intersecting markers ids:', intersectingMarkers);
        console.log(`Close ${range} m range markers ids:`, closeMarkers);
        return { intersectingMarkers, closeMarkers };
    }

    selectMarker(entId: number) {
        // get report data (lat and lng), then set center
        this.reportService.getReportById(entId).subscribe(
            (res) => {
                const location = new google.maps.LatLng(res?.gps_geocoder?.latitude, res?.gps_geocoder?.longitude);
                this.mapData.map.setCenter(location);

                // open modal and change icon color
                this.handleMarkerClick(entId, false);

                this.mapData.treeMarkers.filter((marker: any) => marker.id == entId);
            },
            (error) => {
                console.log("AN ERROR HAS OCURRED", error);
            }
        )
        
    }

    /**
     * Adds a marker to represent a report/tree on map
     * @param {number} lat latitude of the report/tree
     * @param {number} lng longitude of the report/tree
     * @param {string} url app url with identifier of the report/tree
     * @param {string} title text for infoWindow
     * @param {number} validation Conaf validation code 0: pending, 1: rejected, 2: approved
     */
    _addMarkerBase(lat: number, lng: number, url: string, validated: boolean, reporterId: number, map: MapData, selectedEntId: number | undefined): void {
        const lastSlashIndex = url.lastIndexOf("/")
        const entId = url.substring(lastSlashIndex + 1)
        const location = new google.maps.LatLng(lat, lng);
        let source = reporterId == this.userId ? "../../../assets/icon/tree-map-pin-owner.svg" : "../../../assets/icon/tree-map-pin-other-user.svg";
        var marker = new google.maps.Marker({
            icon: source,
            position: location,
        });
        const currentIndex = this.currentTreeMarkersIndex;
        this.currentTreeMarkersIndex ++;

        marker.addListener("click", () => {
          if (this.openMarkersIDs) {
            this.changeMarkerIcon();
          } 
          const selectedIcon = "../../../assets/icon/tree-map-pin-selected.svg";
          this.entPositionCircle!.setMap(map.map!)
          this.entPositionCircle!.setCenter(location)
          map.map?.setCenter(location)
          console.log("User position coords:",this.position.coords)
          console.log("ENV accuracy", environment.accuracyTolerance)
          console.log("Position:", this.position.coords)
          console.log("Markers:", this.mapMarkers)

            // if (this.position.coords.accuracy > 10) {
            // this.loadingService.showNotificationBadGpsPrecision()
            // setTimeout(() => {
            // this.loadingService.dismissNotification()
            // }, 1000);
            // } else {
            // this.allowValidateEnt = this.checkIntersection(this.entPositionCircle, this.positionCircle)
            // if (!this.allowValidateEnt) {
            //   this.loadingService.showNotificatinNonIntersection()
            //   // this.allowValidateEnt = this.checkIntersection
            //   setTimeout(() => {
            //     this.loadingService.dismissNotification()
            //   }, 1000);
            // }
            // }
            this.allowValidateEnt = false;
            if (
                !(this.position.coords.accuracy > environment.accuracyTolerance)
            ) {
                this.allowValidateEnt = this.checkIntersection(
                    this.entPositionCircle,
                    this.positionCircle,
                );
            }

          this.handleMarkerClick(entId, this.allowValidateEnt)
          console.log("[location service - __addMarkerBase] index:", currentIndex, "originalPin:", source);
          this.openMarkersIDs = { currentIndex, source };
          marker.setIcon(selectedIcon);
        });

        map.map?.addListener("click", () => {
          source = reporterId == this.userId ? "../../../assets/icon/tree-map-pin-owner.svg" : "../../../assets/icon/tree-map-pin-other-user.svg";
          marker.setIcon(source);
          this.mapClickEvent.emit();
        });

        console.log("[Location service - _addMarkerBase] map listener added");

        // entPositionCircle.bindTo("center", marker, "position")
        marker.setMap(map.map!);
        map.treeMarkers?.push(marker);
        console.log("[location service - __addMarkerBase] added:", currentIndex);

        if (selectedEntId && selectedEntId.toString() == entId) {
            console.log("[Location service - _addMarkerBase]", selectedEntId, "==", entId);
            const selectedIcon = "../../../assets/icon/tree-map-pin-selected.svg";
            this.entPositionCircle!.setMap(map.map!)
            this.entPositionCircle!.setCenter(location)
            map.map?.setCenter(location)
            this.allowValidateEnt = false;

            this.handleMarkerClick(entId, this.allowValidateEnt);
            this.openMarkersIDs = { currentIndex, source };
            marker.setIcon(selectedIcon);
        } else {
            console.log("[Location service - _addMarkerBase]", selectedEntId, "!=", entId);
        }
    }

    // PositionMarkerCircle(
    //     map: google.maps.Map,
    //     showMarker: boolean = true
    // ): [google.maps.Marker, google.maps.Circle] {
    //     let positionMarker: google.maps.Marker = new google.maps.Marker({
    //         position: this.positionToLatLng(this.position),
    //         icon: "../../../assets/icon/map_tag_orange.svg",
    //         visible: showMarker,
    //         map: map
    //     })
    //     let positionCircle: google.maps.Circle = new google.maps.Circle({
    //         position: this.positionToLatLng(this.position),
    //         radius: this.position.coords.accuracy,
    //         strokeColor: "#38bdf8",
    //         strokeOpacity: 0.8,
    //         strokeWeight: 2,
    //         fillColor: "#38bdf8",
    //         fillOpacity: 0.35,
    //         map: map
    //     })
    //     positionCircle.bindTo("center", positionMarker, "position")
    //     return [positionMarker, positionCircle]
    // }

    /**
     * Adds a marker to represent a report/tree downloaded from server on map
     * @param {number} lat latitude of the report/tree
     * @param {number} lng longitude of the report/tree
     * @param {number} id identifier of the server report/tree
     * @param {string} title text for infoWindow
     * @param {number} validation Conaf validation code 0: pending, 1: rejected, 2: approved
     */
    addMarkerServer(lat: number, lng: number, id: number, validated: boolean, reporterId: number, map: MapData, selectedEntId: number | undefined) {
        const url = '/tabs/ents/' + id
        this._addMarkerBase(lat, lng, url, validated, reporterId, map, selectedEntId);
    }

    /**
     * Adds a marker to represent a report/tree draft  on map
     * @param {number} lat latitude of the report/tree
     * @param {number} lng longitude of the report/tree
     * @param {number} id identifier of the draft report/tree
     * @param {string} title text for infoWindow
     * @param {number} validation Conaf validation code 0: pending, 1: rejected, 2: approved
     */
    addMarkerDraft(lat: number, lng: number, storageKey: string, validated: boolean, reporterId: number, userId: number, map: MapData, selectedEntId: number | undefined) {
        const url = '/tabs/ents/draft/' + storageKey
        this._addMarkerBase(lat, lng, url, validated, reporterId, map, selectedEntId)
    }

    setMarkersReportServer(map: MapData, selectedEntId: number | undefined) {
        console.log('SELECTED ENT ID:', selectedEntId);
        console.log('setting map markers as reports server');
        this.reportService
            .getNear(
                map.map!.getCenter()!.lat()!,
                map.map!.getCenter()!.lng()!,
                50,
            )
            .subscribe((reports) => {
                console.log('reports in map: ', reports);
                reports.map((report: any) => {
                    // if (report.completed) {
                        
                        if (report.gps_geocoder) {
                            if (report.user_id == this.userId || report.status.id == 3 || report.status.id == 5) {
                                if (map.name == "mapProofOfLife") {
                                    const distance = this.distance(
                                        this.centerLocation.lat, this.centerLocation.lng,
                                        report.gps_geocoder.latitude, report.gps_geocoder.longitude
                                    )
                                    if (distance <= environment.proofOfLifeRange && (report.status.id == 3 || report.status.id == 5)) {
                                        this.addMarkerServer(report.gps_geocoder.latitude, report.gps_geocoder.longitude, report.id!, report.validated, report.user_id, map, selectedEntId);    
                                    }
                                } else {
                                    this.addMarkerServer(report.gps_geocoder.latitude, report.gps_geocoder.longitude, report.id!, report.validated, report.user_id, map, selectedEntId);
                                }
                            } else {
                                console.log("report does not have been validated.");
                            }
                        
                        } else {
                        console.log("report does not have gps_geocoder, must be a proof-of-life")
                        }
                    // }
                });
                
            });
    }

    setMarkersReportDraft(map: MapData) {
        console.log('setting map markers as reports drafts');
        // pass
    }

    setReportMarkers(map: MapData, selectedEntId: number | undefined) {
        console.log('[location.v2.service] setReportMarkers]');
        if (!this.authService.offlineMode) {
            console.log(
                '[location.v2.service] setReportMarkers] offlineMode is on!',
            );
            this.setMarkersReportDraft(map);
            this.setMarkersReportServer(map, selectedEntId);
        }
        console.log(
            '[location.v2.service] setReportMarkers] after offlineMode check',
        );
        this.setMarkersReportDraft(map);
    }

    PositionMarkerCircle(
        map: google.maps.Map,
        showMarker: boolean = true,
    ): [google.maps.Marker, google.maps.Circle] {
        let positionMarker: google.maps.Marker = new google.maps.Marker({
            position: this.positionToLatLng(this.position),
            icon: "../../../assets/icon/user-map-pin.svg",
            visible: showMarker,
            map: map,
        });
        let positionCircle: google.maps.Circle = new google.maps.Circle({
            position: this.positionToLatLng(this.position),
            radius: environment.specifyLocationRadius,
            strokeColor: '#38bdf8',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#38bdf8',
            fillOpacity: 0.35,
            map: map,
        });
        positionCircle.bindTo('center', positionMarker, 'position');
        this.positionCircle = positionCircle;
        return [positionMarker, positionCircle];
    }

    pointMarker(
        map: google.maps.Map,
        positionCircle: google.maps.Circle,
    ): google.maps.Marker {
        let pointMarker: google.maps.Marker = new google.maps.Marker({
            position: this.positionToLatLng(this.position),
            icon: "../../../assets/icon/map_tag_orange.svg",
            map: map
        })
        positionCircle.addListener("click", async (event: any) => {
            pointMarker.setPosition(event.latLng)
            this.point = event.latLng;
            this.reportStepService.updateStoredReportGpsGeocoder(event.latLng);
            await this.geocodeLocation(event.latLng)
        })
        return pointMarker
    }

    newMap(elementId: string = 'map'): google.maps.Map {
        const location = this.positionToLatLng(this.position);
        const map = new google.maps.Map(
            document.getElementById(elementId) as HTMLElement,
            {
                center: location,
                disableDefaultUI: true,
                mapTypeId: google.maps.MapTypeId.SATELLITE,
                zoom: 10,
            },
        );

        // map.addListener("click", () => {
        //   this.currentMarkerEntId = -1
        //   this.isMarkerClicked = false
        // })

        return map;
    }

    setCenter(lat: number, lng: number) {
        const location = new google.maps.LatLng(lat, lng);
        this.centerLocation = {
            lat: lat,
            lng: lng,
        }
        console.log("centerLocation initialized");
        this.mapData.map.setCenter(location);
    }

    newMapCenterButton(mapData: MapData) {
        const locationButton = document.createElement('ion-button');
        locationButton.classList.add('reset-location');
        locationButton.innerHTML =
            '<img src="../../../assets/icon/locate-outline.svg" />';
        locationButton.classList.add('custom-map-control-button');
        mapData.map?.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(
            locationButton,
        );

        locationButton.addEventListener('click', () => {
            mapData.map?.setCenter(this.positionToLatLng(this.position));
            this.fitMapToCircle(mapData);
        });
    }

    fitMapToCircle(mapData: MapData) {
        // fit map to bounds
        let circleBounds = mapData.centerCircle?.getBounds();
        if (circleBounds) {
            mapData.map?.fitBounds(circleBounds, 0);
        }
    }

    initMapData(
        name: string,
        map: google.maps.Map,
        showMarker: boolean = true,
        addPointMarker: boolean = false,
        hideReport: boolean,
        selectedEntId: number | undefined,
    ): MapData {
        console.log('[location.v2.service] initMapData');
        const [positionMarker, positionCircle] = this.PositionMarkerCircle(
            map,
            showMarker,
        );
        const mapData: MapData = {
            map: map,
            centerCircle: positionCircle,
            centerMarker: positionMarker,
            treeMarkers: [],
            name: name
        }
        if (addPointMarker) {
            const pointMarker = this.pointMarker(map, positionCircle);
            mapData.pointMarker = pointMarker;
        }

        // add other report markers depending on auth case
        console.log(
            '[location.v2.service] initMapData this.setReportMarkers(mapData)',
        );
        if (!hideReport) this.setReportMarkers(mapData, selectedEntId);
        else console.log("HIDE REPORTS!!!");

        // fit map to circle
        this.fitMapToCircle(mapData);

        // save mapData to list
        this.mapDataList.push(mapData);
        return mapData;
    }

    findMapDataByName(name: string): MapData | undefined {
        for (let mapData of this.mapDataList) {
            if (mapData.name === name) {
                return mapData;
            }
        }
        return undefined;
    }

    updateMapDataMap(name: string, map: google.maps.Map): boolean {
        const mapData = this.findMapDataByName(name);
        if (!mapData) {
            return false;
        }
        mapData.centerCircle?.setMap(map);
        mapData.centerMarker?.setMap(map);
        mapData.pointMarker?.setMap(map);
        if (mapData.treeMarkers) {
            for (let reportMarker of mapData.treeMarkers) {
                reportMarker.setMap(map);
            }
        }
        mapData.map = map;
        return true;
    }

    updateMapsPosition(center: google.maps.LatLng, radius: number): void {
        this.currentPosition.lat = center.lat();
        this.currentPosition.lon = center.lng();
        for (let mapData of this.mapDataList) {
            if (mapData.name != "mapreport") {
                mapData.centerMarker?.setPosition(center);
                mapData.centerCircle?.setRadius(radius);
            }
            // check if point marker goes out of bounds
            if (mapData.pointMarker && mapData.centerCircle) {
                let point_position = mapData.pointMarker.getPosition();
                if (point_position) {
                    if (
                        !mapData.centerCircle
                            .getBounds()
                            ?.contains(point_position)
                    ) {
                        // dont contain, update to new center
                        mapData.pointMarker.setPosition(center);
                    }
                }
            }
        }
    }

    async initMap(name: string, showCenterMarker: boolean, showPointMarker: boolean, userId: number, hideReport: boolean, selectedEntId: number | undefined): Promise<void> {
        if (!await this.authService.checkNetworkStatus()) {
          console.log("[initMap] SIN INTERNET VUELVE A CONECTARTE")
          this.loadingService.notificationShow()
          return
        }
        this.userId = userId;
        console.log("[initMap] show loading screen")
        await this.loadingService.show()
        console.log("[initMap] update position ")
        if (this.isOfflineMode === false) {
          await this.updatePosition().then(async () => {
            console.log("[initMap] create a new map", name)
            let map = this.newMap(name)
            console.log("[initMap] try to update mapData")
            let ok = this.updateMapDataMap(name, map)
            if (!ok || name == "mapreport" || name == "mapProofOfLife" || selectedEntId) {
              console.log("[initMap] mapData does not exists, create")
              this.currentTreeMarkersIndex = 0;
              this.mapData = this.initMapData(
                name, map, showCenterMarker, showPointMarker, hideReport, selectedEntId)
                console.log("[initMap] add center button")
                this.newMapCenterButton(this.mapData)
            } else {
              console.log("[initMap] mapData updated!!")
              this.mapData = this.findMapDataByName(name)
            }
            console.log("[initMap] fit the map to bounds")
            this.fitMapToCircle(this.mapData!)
            await this.loadingService.dismiss()
          }).catch(async (err) => {
            console.log("[initMap] failed to init map, error:", err)
            await this.loadingService.dismiss()
            await this.loadingService.notificationShow()
          })
        }
    }

    twoPositionsIoU(p1: Position, p2: Position): number {
        return this.intersectionOverUnion(
            p1.coords.latitude,
            p1.coords.longitude,
            p1.coords.accuracy,
            p2.coords.latitude,
            p2.coords.longitude,
            p2.coords.accuracy,
        );
    }

    twoPositionsDistance(p1: Position, p2: Position): number {
        return this.distance(
            p1.coords.latitude,
            p1.coords.longitude,
            p2.coords.latitude,
            p2.coords.longitude,
        );
    }

    distance(lat1: number, lon1: number, lat2: number, lon2: number): number {
        /**
         * Calculate the distance between two points on the Earth's surface using Haversine formula.
         * @param lat1 Latitude of point 1 (in degrees).
         * @param lon1 Longitude of point 1 (in degrees).
         * @param lat2 Latitude of point 2 (in degrees).
         * @param lon2 Longitude of point 2 (in degrees).
         * @returns Distance between the two points in meters.
         */

        // Earth radius in meters
        const R: number = 6371000.0;

        // Convert latitude and longitude from degrees to radians
        const toRadians = (angle: number): number => (angle * Math.PI) / 180;
        lat1 = toRadians(lat1);
        lon1 = toRadians(lon1);
        lat2 = toRadians(lat2);
        lon2 = toRadians(lon2);

        // Calculate differences in latitude and longitude
        const dlat: number = lat2 - lat1;
        const dlon: number = lon2 - lon1;

        // Haversine formula
        const a: number =
            Math.sin(dlat / 2) * Math.sin(dlat / 2) +
            Math.cos(lat1) *
                Math.cos(lat2) *
                Math.sin(dlon / 2) *
                Math.sin(dlon / 2);
        const c: number = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        // Calculate distance
        const distance: number = R * c;
        return distance;
    }

    intersectionOverUnion(
        lat1: number,
        lon1: number,
        r1: number,
        lat2: number,
        lon2: number,
        r2: number,
    ): number {
        /**
         * Calculate the Intersection over Union (IoU) of two circles on the Earth's surface.
         * @param lat1 Latitude of center of circle 1 (in degrees).
         * @param lon1 Longitude of center of circle 1 (in degrees).
         * @param r1 Radius of circle 1 in meters.
         * @param lat2 Latitude of center of circle 2 (in degrees).
         * @param lon2 Longitude of center of circle 2 (in degrees).
         * @param r2 Radius of circle 2 in meters.
         * @returns IoU (Intersection over Union) of the two circles.
         */

        // Calculate the distance between the centers of the two circles
        const centerDistance: number = this.distance(lat1, lon1, lat2, lon2);

        // If the distance between centers is greater than the sum of the radii, there is no intersection
        if (centerDistance >= r1 + r2) {
            return 0.0;
        }

        // If one circle is completely contained within the other, the IoU is equal to the smaller circle's area
        if (centerDistance <= Math.abs(r1 - r2)) {
            return Math.min(r1, r2) / Math.max(r1, r2);
        }

        // Calculate the areas of the two circles
        const pi: number = Math.PI;
        const area1: number =
            r1 *
            r1 *
            Math.atan2(
                Math.sqrt(4 * r1 * r1 - centerDistance * centerDistance),
                centerDistance,
            );
        const area2: number =
            r2 *
            r2 *
            Math.atan2(
                Math.sqrt(4 * r2 * r2 - centerDistance * centerDistance),
                centerDistance,
            );

        // Calculate the intersection area
        const intersectionArea: number =
            area1 +
            area2 -
            ((centerDistance / 2) *
                Math.sqrt(
                    (r1 + r2 - centerDistance) *
                        (r1 - r2 + centerDistance) *
                        (-r1 + r2 + centerDistance) *
                        (r1 + r2 + centerDistance),
                )) /
                2;

        // Calculate the union area
        const unionArea: number =
            pi * r1 * r1 + pi * r2 * r2 - intersectionArea;

        // Calculate the IoU
        const iou: number = intersectionArea / unionArea;
        return iou;
    }

    changeMarkerIcon() {
      const openMarker = this.openMarkersIDs;
      console.log("[location service - change marker icon] openMarker:", openMarker.currentIndex);
      this.mapData.treeMarkers[openMarker.currentIndex].setIcon(openMarker.source);
    }

}

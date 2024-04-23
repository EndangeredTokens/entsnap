import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Geolocation, Position } from "@capacitor/geolocation";
// import { AndroidPermissions } from '@ionic-native/android-permissions';
// import { LocationAccuracy } from '@ionic-native/location-accuracy';
import { Subject } from 'rxjs';
import { Address } from '../models/address';
import GeolocationMarker from "geolocation-marker";
import { ReportService } from './report.service';
import { AuthService } from './auth.service';
import { MapData } from '../models/maps';
import { ReportStepsService } from './report-steps.service';
import { LoadingService } from './loading.service';

declare var google: any;

@Injectable({
    providedIn: 'root'
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
            heading: null
        }
    }
    position: Position = this.defaultPosition;
    geocoder?: google.maps.Geocoder;
    watcherID?: string;
    address?: Address;
    current_city?: string;

    point?: google.maps.LatLng;
    mapDataList: MapData[] = [];

    isOfflineMode: boolean;


    constructor(
        private router: Router,
        private reportService: ReportService,
        private authService: AuthService,
        private reportStepService: ReportStepsService,
        private loadingService: LoadingService
    ) {
      if (typeof google != 'undefined' && google.maps) {
        this.point = this.positionToLatLng(this.position)
        this.geocoder = new google.maps.Geocoder();
      }

      this.isOfflineMode = this.authService.isOfflineMode() || false
      console.log("this.isOfflineMode",this.isOfflineMode)
    }

    positionToLatLng(position: Position): google.maps.LatLng {
        const locationLatLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        return locationLatLng
    }

    async _updatePositionRelated(): Promise<void> {
      if (this.isOfflineMode === false) {
        // updates maps
        this.updateMapsPosition(
          this.positionToLatLng(this.position), this.position.coords.accuracy
        )
        // geocode location
        await this.geocodeLocation(this.positionToLatLng(this.position))

        // update report/preview location
        if (this.reportStepService.preview) {
          this.reportStepService.setReportLatLon(
            [this.position.coords.latitude, this.position.coords.longitude]
          )
        }
      }
    }

    // Not Used
    async requestPermission() {
        await Geolocation.requestPermissions()
    }

    async updatePosition(): Promise<Position> {
        try {
            let position = await Geolocation.getCurrentPosition()
            console.log("-- update current position, old", this.position, "new", position)
            this.position = position

            if (this.isOfflineMode === false) {
              await this._updatePositionRelated()
            }
        } catch (error) {
            console.error("failed to get current position, error:", error)
        }
        return this.position
    }

    async startPositionWatcher() {
        if (this.watcherID) {
            console.log("watcher already started")
            return
        }
        this.watcherID = await Geolocation.watchPosition({
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }, async (position: Position | null, err?: any) => {
            console.log("watcher updated position to", position, "with err", err)
            if (position) {
                this.position = position

                if (this.isOfflineMode === false) {
                  await this._updatePositionRelated()
                }
            }
        })
    }

    async stopPositionWatcher() {
        if (!this.watcherID) {
            console.log("no watcher running")
        }
        await Geolocation.clearWatch({
            id: this.watcherID!
        }).then(() => {
            this.watcherID = undefined
        })
    }

    async geocodeLocation(location: google.maps.LatLng, callback?: any): Promise<void> {
        await this.geocoder?.geocode(
            { location: location },
            (
                results: google.maps.GeocoderResult[] | null,
                status: google.maps.GeocoderStatus
            ) => {
                if (status === "OK") {
                    if (results) {
                        if (results[0]) {
                            console.log(results);
                            var resArr = results[0].address_components;
                            var type = resArr.length;
                            this.address = {
                                type: type,
                                formatted: results[0].formatted_address,
                                number: type - 7 < 0 ? "" : resArr[type - 6].short_name,
                                street: type - 6 < 0 ? "" : resArr[type - 5].short_name,
                                area: type - 5 < 0 ? "" : resArr[type - 5].short_name,
                                city: type - 4 < 0 ? "" : resArr[type - 4].short_name,
                                province: type - 3 < 0 ? "" : resArr[type - 3].short_name,
                                county: type - 2 < 0 ? "" : resArr[type - 2].short_name,
                                country: type - 1 < 0 ? "" : resArr[type - 1].short_name,
                            }
                            // callback here
                            if (this.reportStepService.preview) {
                                this.reportStepService.setReportAddress(this.address)
                            }
                        } else {
                            console.log("No results found");
                        }
                    } else {
                        console.log("Geocoder no encontró resultados");
                    }
                } else {
                    console.log("Geocoder failed due to: ", status);
                }
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
    _addMarkerBase(lat: number, lng: number, url: string, validated: boolean, map: MapData): void {
        // console.log("addMarker for report", url);
        const location = new google.maps.LatLng(lat, lng);
        const source = validated ? "../../../assets/icon/map_tag_grey.svg" : "../../../assets/icon/map_tag_grey.svg";
        var marker = new google.maps.Marker({
            icon: source,
            position: location
        });
        marker.addListener("click", () => {
            this.router.navigateByUrl(url);
        });

        let entPositionCircle: google.maps.Circle = new google.maps.Circle({
          position: location,
          radius: 5, // In meters
          strokeColor: "#22c55e",
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: "#22c55e",
          fillOpacity: 0.35,
          map: map.map!,
          visible: false
        })

        entPositionCircle.bindTo("center", marker, "position")
        marker.setMap(map.map!);
        map.treeMarkers?.push(marker)
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
    addMarkerServer(lat: number, lng: number, id: number, validated: boolean, map: MapData) {
        const url = '/tabs/ents/' + id
        this._addMarkerBase(lat, lng, url, validated, map)
    }

    /**
     * Adds a marker to represent a report/tree draft  on map
     * @param {number} lat latitude of the report/tree
     * @param {number} lng longitude of the report/tree
     * @param {number} id identifier of the draft report/tree
     * @param {string} title text for infoWindow
     * @param {number} validation Conaf validation code 0: pending, 1: rejected, 2: approved
     */
    addMarkerDraft(lat: number, lng: number, storageKey: string, validated: boolean, map: MapData) {
        const url = '/tabs/ents/draft/' + storageKey
        this._addMarkerBase(lat, lng, url, validated, map)
    }

    setMarkersReportServer(map: MapData) {
        console.log("setting map markers as reports server")
        this.reportService.getNear(map.map!.getCenter()!.lat()!, map.map!.getCenter()!.lng()!, 50)
            .subscribe(reports => {
                console.log("reports in map: ", reports);
                reports.map(report => {
                    if (report.completed) {
                        this.addMarkerServer(report.latitude, report.longitude, report.id!, report.validated, map)
                    }
                })
            });
    }

    setMarkersReportDraft(map: MapData) {
        console.log("setting map markers as reports drafts")
        // pass
    }

    setReportMarkers(map: MapData) {
        if (!this.authService.offlineMode) {
            this.setMarkersReportDraft(map)
            this.setMarkersReportServer(map)
        }
        this.setMarkersReportDraft(map)
    }

    PositionMarkerCircle(
        map: google.maps.Map,
        showMarker: boolean = true
    ): [google.maps.Marker, google.maps.Circle] {
        let positionMarker: google.maps.Marker = new google.maps.Marker({
            position: this.positionToLatLng(this.position),
            icon: "../../../assets/icon/map_tag_orange.svg",
            visible: showMarker,
            map: map
        })
        let positionCircle: google.maps.Circle = new google.maps.Circle({
            position: this.positionToLatLng(this.position),
            radius: this.position.coords.accuracy,
            strokeColor: "#38bdf8",
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: "#38bdf8",
            fillOpacity: 0.35,
            map: map
        })
        positionCircle.bindTo("center", positionMarker, "position")
        return [positionMarker, positionCircle]
    }

    pointMarker(
        map: google.maps.Map,
        positionCircle: google.maps.Circle): google.maps.Marker {
        let pointMarker: google.maps.Marker = new google.maps.Marker({
            position: this.positionToLatLng(this.position),
            icon: "../../../assets/icon/map_tag_orange.svg",
            map: map
        })
        positionCircle.addListener("click", async (event: any) => {
            pointMarker.setPosition(event.latLng)
            this.point = event.latLng
            await this.geocodeLocation(event.latLng)
        })
        return pointMarker
    }

    newMap(elementId: string = "map"): google.maps.Map {

        const location = this.positionToLatLng(this.position)
        const map = new google.maps.Map(document.getElementById(elementId) as HTMLElement, {
            center: location,
            disableDefaultUI: true,
            mapTypeId: google.maps.MapTypeId.SATELLITE,
            zoom: 10
        });

        return map
    }

    newMapCenterButton(mapData: MapData) {
        const locationButton = document.createElement("ion-button");
        locationButton.classList.add('reset-location');
        locationButton.innerHTML = '<img src="../../../assets/icon/locate-outline.svg" />'
        locationButton.classList.add("custom-map-control-button");
        mapData.map?.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(locationButton);

        locationButton.addEventListener("click", () => {
            mapData.map?.setCenter(this.positionToLatLng(this.position))
            this.fitMapToCircle(mapData)
        });
    }

    fitMapToCircle(mapData: MapData) {
        // fit map to bounds
        let circleBounds = mapData.centerCircle?.getBounds()
        if (circleBounds) { mapData.map?.fitBounds(circleBounds, 0) }
    }

    initMapData(
        name: string,
        map: google.maps.Map,
        showMarker: boolean = true,
        addPointMarker: boolean = false
    ): MapData {
        const [positionMarker, positionCircle] = this.PositionMarkerCircle(map, showMarker)
        const mapData: MapData = {
            map: map,
            centerCircle: positionCircle,
            centerMarker: positionMarker,
            name: name
        }
        if (addPointMarker) {
            const pointMarker = this.pointMarker(map, positionCircle)
            mapData.pointMarker = pointMarker
        }

        // add other report markers depending on auth case
        this.setReportMarkers(mapData)

        // fit map to circle
        this.fitMapToCircle(mapData)

        // save mapData to list
        this.mapDataList.push(mapData)
        return mapData
    }

    findMapDataByName(name: string): MapData | undefined {
        for (let mapData of this.mapDataList) {
            if (mapData.name === name) {
                return mapData
            }
        }
        return undefined
    }

    updateMapDataMap(name: string, map: google.maps.Map): boolean {
        const mapData = this.findMapDataByName(name)
        if (!mapData) { return false }
        mapData.centerCircle?.setMap(map)
        mapData.centerMarker?.setMap(map)
        mapData.pointMarker?.setMap(map)
        if (mapData.treeMarkers) {
            for (let reportMarker of mapData.treeMarkers) {
                reportMarker.setMap(map)
            }
        }
        mapData.map = map
        return true
    }

    updateMapsPosition(center: google.maps.LatLng, radius: number): void {
        for (let mapData of this.mapDataList) {
            mapData.centerMarker?.setPosition(center)
            mapData.centerCircle?.setRadius(radius)
            // check if point marker goes out of bounds
            if (mapData.pointMarker && mapData.centerCircle) {
                let point_position = mapData.pointMarker.getPosition()
                if (point_position) {
                    if (!mapData.centerCircle.getBounds()?.contains(point_position)) {
                        // dont contain, update to new center
                        mapData.pointMarker.setPosition(center)
                    }
                }
            }
        }
    }

    async initMap(name: string, showCenterMarker: boolean, showPointMarker: boolean): Promise<void> {
        console.log("[initMap] show loading screen")
        await this.loadingService.show()
        console.log("[initMap] update position ")
        if (this.isOfflineMode === false) {
          await this.updatePosition().then(async () => {
            console.log("[initMap] create a new map", name)
            let map = this.newMap(name)
            console.log("[initMap] try to update mapData")
            let ok = this.updateMapDataMap(name, map)
            let mapData;
            if (!ok) {
              console.log("[initMap] mapData does not exists, create")
              mapData = this.initMapData(
                name, map, showCenterMarker, showPointMarker)
                console.log("[initMap] add center button")
                this.newMapCenterButton(mapData)
            } else {
              console.log("[initMap] mapData updated!!")
              mapData = this.findMapDataByName(name)
            }
            console.log("[initMap] fit the map to bounds")
            this.fitMapToCircle(mapData!)
            await this.loadingService.dismiss()
          }).catch(async (err) => {
            console.log("[initMap] failed to init map, error:", err)
            await this.loadingService.dismiss()
            await this.loadingService.notificationShow()
          })
        }
    }

}

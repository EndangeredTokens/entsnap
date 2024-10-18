import { Injectable } from '@angular/core';
import { CameraPreview, CameraPreviewOptions, CameraPreviewPictureOptions } from '@capacitor-community/camera-preview';

@Injectable({
    providedIn: 'root'
})
export class CameraOverlayService {
    public storageKey = "cameraActive"
    cameraActive = false
    constructor() {
        this.cameraActive = false
    }

    async startCamera(): Promise<void> {
        if (this.isCameraActive()) {
            console.log("[startCamera] camera already running")
            return
        }
        const cameraPreviewOptions: CameraPreviewOptions = {
            position: 'rear',
            parent: 'camera-preview',
            toBack: true,
            disableAudio: true,
            className: 'camera',
            enableZoom: true
        };

        await CameraPreview.start(cameraPreviewOptions).then(() => {
            this.cameraActive = true;
            console.log("[startCamera] camera started")
        }).catch((err) => {
            console.error("[startCamera] failed to start, ERROR:", err)
        })
    }

    async stopCamera(): Promise<void> {
        if (!this.isCameraActive()) {
            console.log("[stopCamera] camera already stopped")
            return
        }
        await CameraPreview.stop().then(() => {
            this.cameraActive = false;
            console.log("[stopCamera] camera stopped")
        }).catch((err) => {
            console.error("[StopCamera] failed to stop, ERROR:", err)
            this.cameraActive = false;
        })
    }

    async _captureImage(): Promise<string> {
        const cameraPreviewCaptureOptions: CameraPreviewPictureOptions = {
            quality: 90,
        };
        let image: string = "";
        await CameraPreview.capture(cameraPreviewCaptureOptions).then((result: any) => {
            console.log("result", result)
            image = `data:image/jpeg;base64, ${result.value}`
            // console.log("[_captureImage] image captured", image)
        }).catch((err) => {
            console.error("[_captureImage] failed to capture, ERROR:", err)
        })

        return image
    }

    async checkIfOpen(): Promise<boolean> {
        let isActive = false
        if (!this.isCameraActive()) {
            console.log("[checkIfOpen] camera is closed, starting...")
            await this.startCamera().then(() => {
                if (!this.isCameraActive) {
                    console.error("[checkIfOpen] camera still closed, failed...")
                } else {
                    isActive = true
                }
            })
        } else {
            console.log("[checkIfOpen] camera already started")
            isActive = true
        }
        return isActive
    }

    async checkIfClosed(): Promise<boolean> {
        let isClosed = false
        if (this.isCameraActive()) {
            console.log("[checkIfClosed] camera is open, closing...")
            await this.stopCamera().then(() => {
                if (this.isCameraActive()) {
                    console.error("[checkIfClosed] camera still open, failed...")
                } else {
                    isClosed = true
                }
            })
        } else {
            console.log("[checkIfClosed] camera already closed")
            isClosed = true
        }
        return isClosed
    }

    async captureImage(): Promise<string | null> {
        let isOpen = await this.checkIfOpen()
        let image = ""
        if (isOpen) {
            image = await this._captureImage()

            // after capturing the image, stop the camera
            await this.checkIfClosed()
        }

        return image
    }

    async flipCamera() {
        let isOpen = await this.checkIfOpen()
        if (isOpen) {
            await CameraPreview.flip().catch((err) => {
                console.error("[FlipCamera] ERROR:", err)
            })
        }
    }

    isCameraActive(): boolean {
        return this.cameraActive
    }
}

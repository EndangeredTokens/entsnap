package com.entsnap.app;

import com.getcapacitor.BridgeActivity;
import android.os.Bundle;
import com.codetrixstudio.capacitor.GoogleAuth.GoogleAuth;
import com.ahm.capacitor.camera.preview.CameraPreview;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {

        this.registerPlugin(GoogleAuth.class);

        super.onCreate(savedInstanceState);

        this.registerPlugin(CameraPreview.class);
    }
}

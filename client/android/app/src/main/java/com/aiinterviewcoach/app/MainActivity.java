package com.aiinterviewcoach.app;

import android.Manifest;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.webkit.PermissionRequest;
import android.webkit.WebSettings;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebChromeClient;

public class MainActivity extends BridgeActivity {
    private static final int PERMISSION_REQ_CODE = 1001;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        try {
            if (getBridge() != null && getBridge().getWebView() != null) {
                // Prevent black screen flash
                getBridge().getWebView().setBackgroundColor(Color.parseColor("#080C14"));

                WebSettings settings = getBridge().getWebView().getSettings();
                // Allow audio and video to play automatically without requiring manual user gesture
                settings.setMediaPlaybackRequiresUserGesture(false);

                // Override WebChromeClient to safely grant permissions when already permitted by Android OS
                getBridge().getWebView().setWebChromeClient(new BridgeWebChromeClient(getBridge()) {
                    @Override
                    public void onPermissionRequest(final PermissionRequest request) {
                        runOnUiThread(() -> {
                            try {
                                boolean hasCamera = ContextCompat.checkSelfPermission(MainActivity.this, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED;
                                boolean hasAudio = ContextCompat.checkSelfPermission(MainActivity.this, Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED;

                                if (hasCamera && hasAudio) {
                                    // Grant directly to WebView without popping up dialog or racing permission launchers
                                    request.grant(request.getResources());
                                } else {
                                    super.onPermissionRequest(request);
                                }
                            } catch (Exception e) {
                                try {
                                    request.deny();
                                } catch (Exception ignored) {}
                            }
                        });
                    }
                });
            }
        } catch (Exception e) {
            // Safe fallback: proceed with default background if WebView isn't ready
        }

        // Request runtime Camera and Microphone permissions upfront on app launch
        requestAppPermissions();
    }

    private void requestAppPermissions() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            String[] permissions = new String[] {
                Manifest.permission.CAMERA,
                Manifest.permission.RECORD_AUDIO,
                Manifest.permission.MODIFY_AUDIO_SETTINGS
            };
            boolean needsRequest = false;
            for (String perm : permissions) {
                if (ContextCompat.checkSelfPermission(this, perm) != PackageManager.PERMISSION_GRANTED) {
                    needsRequest = true;
                    break;
                }
            }
            if (needsRequest) {
                ActivityCompat.requestPermissions(this, permissions, PERMISSION_REQ_CODE);
            }
        }
    }
}

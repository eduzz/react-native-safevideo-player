package com.example.reactnativesafevideoplayer;

import com.facebook.react.ReactActivity;

import android.os.Bundle;
import androidx.annotation.Nullable;
import com.google.android.gms.cast.framework.CastContext;

public class MainActivity extends ReactActivity {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "SafevideoPlayerExample";
  }

  @Override
  protected void onCreate(@Nullable Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    // lazy load Google Cast context
    CastContext.getSharedInstance(this);
  }
}

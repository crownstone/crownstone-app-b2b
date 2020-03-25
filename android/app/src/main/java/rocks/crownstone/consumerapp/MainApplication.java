package rocks.crownstone.consumerapp;

import ca.jaysoo.extradimensions.ExtraDimensionsPackage;

import com.airbnb.android.react.maps.MapsPackage;
import com.cmcewen.blurview.BlurViewPackage;
import com.reactnativecommunity.asyncstorage.AsyncStoragePackage;
import com.reactnativecommunity.slider.ReactSliderPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.horcrux.svg.SvgPackage;
import org.devio.rn.splashscreen.SplashScreenReactPackage;
import org.reactnative.camera.RNCameraPackage;
import io.sentry.RNSentryPackage;
import com.dieam.reactnativepushnotification.ReactNativePushNotificationPackage;
import com.corbt.keepawake.KCKeepAwakePackage;
import fr.bamlab.rnimageresizer.ImageResizerPackage;
import com.rnfs.RNFSPackage;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import com.facebook.react.modules.storage.ReactDatabaseSupplier;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.reactnativenavigation.NavigationApplication;
import com.reactnativenavigation.react.NavigationReactNativeHost;
import com.reactnativenavigation.react.ReactGateway;
//import com.reactnativenavigation.react.SyncUiImplementation;

import java.util.Arrays;
import java.util.List;


public class MainApplication extends NavigationApplication {

	@Override
	protected ReactGateway createReactGateway() {
		ReactNativeHost host = new NavigationReactNativeHost(this, isDebug(), createAdditionalReactPackages()) {
			@Override
			protected String getJSMainModuleName() {
				return "index";
			}

//			@Override
//			protected UIImplementationProvider getUIImplementationProvider() {
//				return new SyncUiImplementation.Provider();
//			}
		};
		return new ReactGateway(this, isDebug(), host);
	}

	@Override
	public boolean isDebug() {
		return BuildConfig.DEBUG;
	}

	protected List<ReactPackage> getPackages() {
		// Add additional packages you require here
		// No need to add RnnPackage and MainReactPackage
		return Arrays.<ReactPackage>asList(
				new BluenetBridgePacket(),
				new MainReactPackage(),
            new RNGestureHandlerPackage(),
            new ReanimatedPackage(),
                new ExtraDimensionsPackage(),
            	new BlurViewPackage(),
				new RNCameraPackage(),
				new AsyncStoragePackage(),
				new ReactSliderPackage(),
				new VectorIconsPackage(),
				new SvgPackage(),
				new ImageResizerPackage(),
				new RNFSPackage(),
				new KCKeepAwakePackage(),
				new SplashScreenReactPackage(),
				new RNSentryPackage(),
				new RNDeviceInfo(),
				new ReactNativePushNotificationPackage(),
				new MapsPackage()
		);
	}

	@Override
	public List<ReactPackage> createAdditionalReactPackages() {
		return getPackages();
	}

	@Override
	public void onCreate() {
		super.onCreate();
//		long size = 50L * 1024L * 1024L; // 50 MB
//		ReactDatabaseSupplier.getInstance(getApplicationContext()).setMaximumSize(size);
//		
	}
}

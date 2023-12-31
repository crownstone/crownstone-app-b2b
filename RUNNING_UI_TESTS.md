# Appium UI tests

# Preparation


## Local cloud

Checkout the local cloud container

```
git clone git@github.com:crownstone/cloud-test-container.git ../cloud-test-container
```

Follow the steps in that readme, and continue when the clouds are started.

## Detox

install the detox cli
```
npm install -g detox@19.11.0
```

We use jest:
```
npm install -g jest@27
```

### iOS preperation

[Install applesimutils](https://github.com/wix/AppleSimulatorUtils)

```
brew tap wix/brew
brew install applesimutils
```

### Config

The config file is `.detoxrc.json`.

## Building the app

Ensure the app is built for the configuration you want to tests (see .detoxrc.json)

## Running react

If you're debugging an app, ensure you are running the React builder
```
npm run react
```

## IP address

In order for the test app to find the test cloud, the script needs the IP address of your computer.
By default, it will use the first result of `ipconfig`, but that is not always correct. In that case, provice your IP address to the script.


## Running on simulators

Ensure that hardware keyboard is disabled. This means that when text is inputted, you should see the keyboard coming up. Just like a real phone! 

# iOS

We use detox to run the tests.

```
./run_UI_tests_ios.sh
```

Make sure you set the build folder in XCode to be in /ios/build/...
or make sure the app path matches where the app is built.

# Android

## Debug build

First build the app:
```
cd android
./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug
cd ..
```

When running a test on a debug build, make sure the react-native server is running:
```
cd android
./reverse.sh
cd ..
react-native start
```

## Release build

First build the app:
```
cd android
./gradlew assembleRelease assembleAndroidTest -DtestBuildType=release
cd ..
```

Then run the tests:
```
./run_UI_tests_android.sh
```


# Developing UI tests

In android studio, you can find out the ids of GUI elements with the "layout inspector", while running a debug build.

In XCode you can use the hierarchy view to do this.

## Resuming tests



# Release

This document describes how to release the app.

## Android

- Increase the version code and name (in `android/app/build.gradle`).
- Commit the change, and tag with for example: `android-6.0.11`.
- Push the commit and tag to git.

Now build the release version (you will need the keys for this):

```
# Build the javascript side
yarn
npm run build

# Clean
cd android
./gradlew clean

# Export the keys
export CS_ANDROID_STORE_FILE="~/crownstone.ks"
export CS_ANDROID_STORE_PASSWORD=$(pass crownstone/android_signing_key_store)
export CS_ANDROID_KEY_ALIAS="crownstone-app"
export CS_ANDROID_KEY_PASSWORD=$(pass crownstone/consumer-app/android_consumer_app_signing_key)

# Build the release
./gradlew --max-workers 8 assembleRelease

# Sign the apk
cmd_line_tools_dir="~/libs/android-sdk/build-tools/30.0.2/"
PATH=$PATH:$cmd_line_tools_dir
cs_apk="app/build/outputs/apk/release/app-release.apk"
cs_apk_aligned="app/build/outputs/apk/release/app-release.apk"
zipalign -c -v 4 $cs_apk_aligned && apksigner sign --ks $CS_ANDROID_STORE_FILE $
```

Finally, upload the app to the play store.
Also create a release from the tag on github, and add the app as attachment.

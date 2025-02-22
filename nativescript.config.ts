import { NativeScriptConfig } from '@nativescript/core'

export default {
  id: 'org.nativescript.nsiosliveactivity',
  appPath: 'src',
  appResourcesPath: 'App_Resources',
  android: {
    v8Flags: '--expose_gc',
    markingMode: 'none',
  },
  ios: {
    SPMPackages: [
      {
        name: 'SharedWidget',
        libs: ['SharedWidget'],
        path: './Shared_Resources/iOS/SharedWidget',
        targets: ['pizza'],
      },
    ],
  },
} as NativeScriptConfig

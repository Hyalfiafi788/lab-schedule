'use strict';

/**
 * Electron Builder configuration for Lab Schedule Pro.
 * Produces:
 *   Release/Lab Schedule Pro Setup x.x.x.exe  (NSIS installer)
 *   Release/Lab Schedule Pro x.x.x Portable.exe (portable)
 */
module.exports = {
  appId: 'com.alyamamah.labschedulepro',
  productName: 'Lab Schedule Pro',
  copyright: 'Copyright © 2024 Al Yamamah Hospital',

  // Where packaged outputs are written
  directories: {
    output: 'Release',
    buildResources: 'build',
  },

  // Files to include in the packaged app
  files: [
    'dist/**/*',
    'electron/dist/**/*',
    'build/icon.*',
    'package.json',
  ],

  // Unpack better-sqlite3 native module from ASAR
  asarUnpack: [
    '**/better-sqlite3/**',
    '**/better_sqlite3.node',
  ],

  // Rebuild native modules for the packaged Electron version
  npmRebuild: true,

  // ── Windows ─────────────────────────────────────────────────────────────
  win: {
    icon: 'build/icon.ico',
    publisherName: 'Al Yamamah Hospital',
    requestedExecutionLevel: 'asInvoker',
    target: [
      { target: 'nsis',     arch: ['x64'] },
      { target: 'portable', arch: ['x64'] },
    ],
  },

  // NSIS installer options
  nsis: {
    oneClick: false,
    perMachine: false,
    allowElevation: true,
    allowToChangeInstallationDirectory: true,
    deleteAppDataOnUninstall: false,
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
    shortcutName: 'Lab Schedule Pro',
    installerIcon: 'build/icon.ico',
    uninstallerIcon: 'build/icon.ico',
    installerHeader: 'build/icon.ico',
  },

  // Portable exe
  portable: {
    artifactName: '${productName} ${version} Portable.exe',
  },

  // ── Linux (for testing) ──────────────────────────────────────────────────
  linux: {
    icon: 'build/icon.png',
    target: [{ target: 'AppImage', arch: ['x64'] }],
    category: 'Office',
  },

  // Extra metadata
  extraMetadata: {
    version: '1.0.0',
  },
};

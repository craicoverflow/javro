/* eslint global-require: off, no-console: off, import/no-cycle: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build:main`, this file is compiled to
 * `./src/main.prod.js` using webpack. This gives us some performance wins.
 */
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import path from 'path';
import { argv } from 'yargs';
import { app, BrowserWindow, shell } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { getActiveWindow, setActiveWindow } from './active-window';

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;

    autoUpdater.setFeedURL({
      provider: 'github',
      owner: 'javro',
      repo: 'javro',
    });

    autoUpdater.checkForUpdatesAndNotify();
  }
}

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (
  process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true'
) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

export const createWindow = async (blank = false) => {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  const mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      nodeIntegration: true,
    },
    titleBarStyle: 'hidden',
  });

  mainWindow.loadURL(`file://${__dirname}/index.html`);

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }

    if (!blank) {
      mainWindow.webContents.send('open-file', argv.path);
    }
  });

  mainWindow.on('closed', () => {
    setActiveWindow(null);
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.on('new-window', (event, url) => {
    event.preventDefault();
    shell.openExternal(url);
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => createWindow())
  .catch(console.log);

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (getActiveWindow() === null) createWindow();
});

app.on('browser-window-focus', (_, focusedWindow) => {
  setActiveWindow(focusedWindow);
});

app.on('open-file', (_, _path) => {
  const activeWindow = getActiveWindow();
  if (activeWindow !== null) activeWindow.webContents.send('open-file', _path);
});

autoUpdater.on('update-available', () => {
  const activeWindow = getActiveWindow();
  if (activeWindow !== null)
    activeWindow.webContents.send(
      'message',
      'Update available. Keep your app opened,  you will be informed when it will be downloaded.'
    );
});

autoUpdater.on('error', (err) => {
  const activeWindow = getActiveWindow();
  if (activeWindow !== null)
    activeWindow.webContents.send(
      'message',
      `Error in auto-updater: ${err.message}`
    );
});

autoUpdater.on('update-downloaded', () => {
  const activeWindow = getActiveWindow();
  if (activeWindow !== null)
    activeWindow.webContents.send(
      'message',
      'Update downloaded. You can restart app to apply update.'
    );
});

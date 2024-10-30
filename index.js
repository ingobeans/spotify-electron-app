const { app, components, BrowserWindow, ipcMain } = require("electron");

const path = require("path");

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
      contextIsolation: false,
      experimentalFeatures: true,
    },
    frame: false,
    titleBarStyle: "hidden",
  });

  const userAgent =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.5938.62 Safari/537.36";
  win.webContents.setUserAgent(userAgent);

  win.loadURL("https://open.spotify.com/");

  ipcMain.on("go-back", () => {
    const { navigationHistory } = win.webContents;
    if (navigationHistory.canGoBack()) {
      navigationHistory.goBack();
    }
  });
}

app.whenReady().then(async () => {
  await components.whenReady();
  //app.commandLine.appendSwitch("no-user-gesture-required");
  console.log("components ready:", components.status());
  createWindow();
});

const { app, components, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");

let pluginsDir = path.join(__dirname, "plugins");

function loadPlugins() {
  let arr = [];
  fs.readdir(pluginsDir, (err, files) => {
    if (err) {
      console.error("error reading dir: ", err);
      return;
    }

    files.forEach((file) => {
      if (path.extname(file) === ".js") {
        const filePath = path.join(pluginsDir, file);
        const fileContent = fs.readFileSync(filePath, "utf-8");

        arr.push(fileContent);
      }
    });
  });
  return arr;
}

let plugins = loadPlugins();

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    backgroundColor: "#121212",
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
  // weirdly enough this is required lest the regular web player isn't shown
  win.webContents.setUserAgent(userAgent);

  win.loadURL("https://open.spotify.com/");

  ipcMain.on("go-back", () => {
    const { navigationHistory } = win.webContents;
    if (navigationHistory.canGoBack()) {
      navigationHistory.goBack();
    }
  });

  win.webContents.on("did-frame-finish-load", () => {
    win.webContents.executeJavaScript(`
      console.log('hellooo!');
    `);

    // run plugins
    plugins.forEach((code) => {
      win.webContents.executeJavaScript(code);
    });
  });
}

app.whenReady().then(async () => {
  await components.whenReady();
  //app.commandLine.appendSwitch("no-user-gesture-required");
  console.log("components ready:", components.status());
  createWindow();
});

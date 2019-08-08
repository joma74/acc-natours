// @ts-nocheck
const CDP = require("chrome-remote-interface")
const argv = require("minimist")(process.argv.slice(2))
const fs = require("fs")

const targetURL = argv.url || "http://localhost:6073/" // "https://jonathanmh.com"
const viewport = [600, 1024]
const screenshotDelay = 4000 // ms
const fullPage = argv.fullPage || true

if (fullPage) {
  console.log("will capture full page")
}

/**
 * google-chrome --headless --hide-scrollbars --remote-debugging-port=9222 --disable-gpu
 */
CDP(async function(
  /** @type {import("src/types/chrome-remote-interface/protocol-proxy-api").default.ProtocolApi}  */ client,
) {
  const { Browser, DOM, Emulation, Network, Page } = client

  // Enable events on domains we are interested in.
  await Page.enable()
  await DOM.enable()
  await Network.enable()

  console.log(await Browser.getVersion())

  Page.loadEventFired(async () => {
    // document.documentElement.style.setProperty('--vh', "10.24px");
    // evaluate full height
    const {
      root: { nodeId: documentNodeId },
    } = await DOM.getDocument()
    const { nodeId: bodyNodeId } = await DOM.querySelector({
      selector: "body",
      nodeId: documentNodeId,
    })
    let {
      model: { height },
    } = await DOM.getBoxModel({ nodeId: bodyNodeId })
    height = Math.max(viewport[1], Math.ceil(height))
    // set viewport and visible size
    await Emulation.setDeviceMetricsOverride({
      width: viewport[0],
      height: height,
      deviceScaleFactor: 1,
      fitWindow: false,
      mobile: true,
      dontSetVisibleSize: false,
      viewport: {
        x: 0,
        y: 0,
        width: viewport[0],
        height: height,
        scale: 1,
      },
    })
    await Emulation.setPageScaleFactor({ pageScaleFactor: 1 })
  })

  setTimeout(async function() {
    const screenshot = await Page.captureScreenshot({
      format: "png",
      fromSurface: false, // false delivers stable results
    })
    const buffer = new Buffer(screenshot.data, "base64")
    fs.writeFile("desktop.png", buffer, "base64", function(err) {
      if (err) {
        console.error(err)
      } else {
        console.log("Screenshot saved")
      }
    })
    client.close()
  }, screenshotDelay)
}).on("error", (err) => {
  console.error("Cannot connect to browser:", err)
})

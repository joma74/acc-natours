// @ts-nocheck
const CDP = require("chrome-remote-interface")
const argv = require("minimist")(process.argv.slice(2))
const fs = require("fs")

const targetURL = argv.url || "http://localhost:6073/" // "https://jonathanmh.com"
const viewport = [1280, 1024]
const screenshotDelay = 4000 // ms
const fullPage = argv.fullPage || true

if (fullPage) {
  console.log("will capture full page")
}

/**
 * google-chrome --headless --hide-scrollbars --remote-debugging-port=9222 --disable-gpu
 */
CDP(async function(client) {
  const { DOM, Emulation, Network, Page, Runtime } = client

  // Enable events on domains we are interested in.
  await Page.enable()
  await DOM.enable()
  await Network.enable()

  // change these for your tests or make them configurable via argv
  var device = {
    width: viewport[0],
    height: viewport[1],
    deviceScaleFactor: 2,
    mobile: true,
    fitWindow: false,
  }

  // set viewport and visible size
  await Emulation.setDeviceMetricsOverride(device)
  await Emulation.setVisibleSize({ width: viewport[0], height: viewport[1] })

  await Page.navigate({ url: targetURL })

  Page.loadEventFired(async () => {
    if (fullPage) {
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
      await Emulation.setVisibleSize({ width: device.width, height: height })
      await Emulation.setDeviceMetricsOverride({
        width: device.width,
        height: height,
        screenWidth: device.width,
        screenHeight: height,
        deviceScaleFactor: 2,
        fitWindow: false,
        mobile: true,
      })
      await Emulation.setPageScaleFactor({ pageScaleFactor: 1 })
    }
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

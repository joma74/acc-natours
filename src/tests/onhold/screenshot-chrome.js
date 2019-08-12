// @ts-nocheck
const CDP = require("chrome-remote-interface")
const delay = require("delay")
const fs = require("fs")

const viewportUnderTest = [601, 1024]

console.log("will capture full page")

/**
 * google-chrome --headless --hide-scrollbars --remote-debugging-port=9222 --disable-gpu
 */
CDP(async function(
  /** @type {import("src/types/chrome-remote-interface/protocol-proxy-api").default.ProtocolApi}  */ client,
) {
  const { Browser, DOM, Emulation, Network, Page, Runtime } = client

  // Enable events on domains we are interested in.
  await Page.enable()
  await DOM.enable()
  await Network.enable()
  await Runtime.enable()

  console.log(
    "Browser under test is: " + JSON.stringify(await Browser.getVersion()),
  )

  isDeviceTypeMobile = false

  await Emulation.clearDeviceMetricsOverride()

  // set viewport according to test viewport
  await Emulation.setDeviceMetricsOverride({
    width: viewportUnderTest[0],
    height: viewportUnderTest[1],
    deviceScaleFactor: 0,
    mobile: isDeviceTypeMobile,
    dontSetVisibleSize: false,
  })
  let bodyBoxModel = await evaluateBodyBox(DOM)
  console.log(
    `body height before vh grinding is ${bodyBoxModel.model.height} px`,
  )
  await takeScreenshot(Page, "desktop-before")

  // now evaluate the current vh
  const actualVh = (await Runtime.evaluate({
    expression: `window.innerHeight / 100`,
  })).result.value

  console.log(`1 vh has been evaluated to ${actualVh}px`)
  // and grind that as css property
  await Runtime.evaluate({
    expression: `document.documentElement.style.setProperty('--vh', "${actualVh}px");`,
  })
  // now get the height of the grinded body
  bodyBoxModel = await evaluateBodyBox(DOM)
  let heightForScreenshot = Math.max(
    viewportUnderTest[1],
    Math.ceil(bodyBoxModel.model.height),
  )

  console.log(`body height after vh grinding is ${heightForScreenshot} px`)
  await takeScreenshot(Page, "desktop-after")

  // set viewport according to full page screenshot viewport
  await Emulation.setDeviceMetricsOverride({
    width: viewportUnderTest[0],
    height: heightForScreenshot,
    deviceScaleFactor: 0,
    mobile: isDeviceTypeMobile,
    dontSetVisibleSize: false,
    viewport: {
      x: 0,
      y: 0,
      width: viewportUnderTest[0],
      height: heightForScreenshot,
      scale: 1,
    },
  })

  bodyBoxModel = await evaluateBodyBox(DOM)
  console.log(
    `body height after viewport resizing to height for screenshot of ${heightForScreenshot} px has been evaluated to ${bodyBoxModel.model.height} px`,
  )
  console.log(
    `client height of visualViewport of layoutMetrics is ${
      (await Page.getLayoutMetrics()).visualViewport.clientHeight
    } px`,
  )

  await takeScreenshot(Page, "desktop-final")
  // finally, unset the vh property
  await Runtime.evaluate({
    expression: `document.documentElement.style.removeProperty("--vh")`,
  })
  // and restore the viewport under test
  await Emulation.setDeviceMetricsOverride({
    width: viewportUnderTest[0],
    height: viewportUnderTest[1],
    deviceScaleFactor: 0,
    mobile: isDeviceTypeMobile,
    dontSetVisibleSize: false,
    viewport: {
      x: 0,
      y: 0,
      width: viewportUnderTest[0],
      height: viewportUnderTest[1],
      scale: 1,
    },
  })
  await takeScreenshot(Page, "desktop-reset")
  client.close()
}).on("error", (err) => {
  console.error("Cannot connect to browser:", err)
})

/**
 *
 * @param { import("src/types/chrome-remote-interface/protocol-proxy-api").default.PageApi } Page
 * @param {string} fileName
 */
async function takeScreenshot(Page, fileName = "desktop") {
  let screenshot = await Page.captureScreenshot({
    format: "png",
    fromSurface: true,
    quality: 100,
  })
  const buffer = Buffer.from(screenshot.data, "base64")
  fs.writeFile(fileName + ".png", buffer, "base64", function(err) {
    if (err) {
      console.error(err)
    } else {
      console.log("Screenshot saved")
    }
  })
}

/**
 *
 * @param { import("src/types/chrome-remote-interface/protocol-proxy-api").default.DOMApi } DOM
 * @param {number} delayMS
 */
async function evaluateBodyBox(DOM, delayMS = 2000) {
  await delay(delayMS)
  const {
    root: { nodeId: documentNodeId },
  } = await DOM.getDocument()
  const { nodeId: bodyNodeId } = await DOM.querySelector({
    selector: "body",
    nodeId: documentNodeId,
  })
  const boxModel = await DOM.getBoxModel({ nodeId: bodyNodeId })
  return boxModel
}

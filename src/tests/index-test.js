import {
  parseUserAgentAsJson,
  renderSelectedWithReplacementsAsFileName,
} from "./utils/useragent"
import { scrollTo } from "./utils/scroll"
import {
  readUserAgent,
  readDevicePixelRatio,
  readClientDimensions,
  readIsTouchEnabled,
} from "./utils/stdfunc"
import { selectImg } from "./utils/img-elm"
import { takeScreenshotAtRunInfoContext } from "./utils/screenshot"
import {
  resizeToRunInfoDimensions,
  setRunInfoCtx,
  getRunInfoCtx,
  evaluateRunArgsBrowser,
} from "./utils/runinfos"
import path from "path"

const ENVAPPSRVPORT = require("../../config/env/ENVAPPSRVPORT")

fixture("Index_Page_Test")
  .beforeEach(async (t) => {
    const runArgsBrowser = await evaluateRunArgsBrowser(t)
    await resizeToRunInfoDimensions(t, runArgsBrowser)

    /** @type {import("./utils/useragent").UserAgentInfos}  */
    let ua
    /** @type { {dpr: number}} */
    let dpr
    /** @type { {width: number, height: number}} */
    let clientDimensions
    /** @type {boolean} */
    let isTouchEnabled
    //
    await Promise.all([
      parseUserAgentAsJson(await readUserAgent()),
      await readDevicePixelRatio(),
      await readClientDimensions(),
      await readIsTouchEnabled(),
    ])
      .then((values) => {
        ua = values[0]
        dpr = values[1]
        clientDimensions = values[2]
        isTouchEnabled = values[3]
      })
      .catch((e) => {
        throw e
      })
    //

    if (
      // @ts-ignore
      ua === undefined ||
      // @ts-ignore
      dpr === undefined ||
      // @ts-ignore
      clientDimensions === undefined ||
      // @ts-ignore
      isTouchEnabled === undefined
    ) {
      throw new Error("Some of the read infos are not available, aborting.")
    }

    const runValuesBrowser = { ...dpr, ...clientDimensions, isTouchEnabled }
    const screenshotLeafDirName = renderSelectedWithReplacementsAsFileName(
      "{{ ua.family }}_{{ ua.os.family }}_{{ browser.width }}x{{ browser.height}}_{{ browser.dpr }}_{{ browser.isTouchEnabled }}",
      [{ searchMask: "headless", replaceMask: "" }],
      { ua },
      { browser: runValuesBrowser },
    )
    /**
     * @type {import("./utils/runinfos").RunInfoCtx}
     */
    const runInfoCtx = {
      ua,
      runValuesBrowser,
      screenshotLeafDirName,
      screenshotDir: path.join(
        t.testRun.opts.screenshotPath,
        screenshotLeafDirName,
      ),
      runArgsBrowser,
    }
    //
    setRunInfoCtx(t, runInfoCtx)
    //
    console.log(" - " + runInfoCtx.screenshotLeafDirName + "")
    console.log("   - " + runInfoCtx.runArgsBrowser.profileDir + "")
  })
  .page(`http://localhost:${ENVAPPSRVPORT.get()}/index.html`)

/**
    t.testRun.browserConnection.browserInfo.provider.plugin.openedBrowsers.FTY84uC.client.Page.captureScreenshot
    **********
    t.testRun.browserConnection.browserConnectionGateway.connections.FTY84uC.provider.plugin.providerName
    t.testRun.browserConnection.browserConnectionGateway.connections.FTY84uC.provider.plugin.openedBrowsers.FTY84uC.config
    t.testRun.browserConnection.browserConnectionGateway.connections.FTY84uC.provider.plugin.openedBrowsers.FTY84uC.client.Page.captureSnapshot
    t.testRun.browserConnection.browserConnectionGateway.connections.FTY84uC.id

    t.testRun.browserConnection.browserConnectionGateway.connections.FTY84uC.id
   */
test("take_screenshots", async (t) => {
  await t.wait(500) // animation
  //
  await takeScreenshotAtRunInfoContext(t, "header.png")

  await scrollTo(t, "body > main > section.section-about")

  await takeScreenshotAtRunInfoContext(t, "section-about.png")

  const about_comp_img_3 = await selectImg(
    "body > main > section.section-about > div.row > div:nth-child(2) > div > img.composition__photo.composition__photo--p3",
  )

  await t.expect(about_comp_img_3.complete).ok()

  if (getRunInfoCtx(t).runValuesBrowser.dpr >= 2) {
    await t.expect(about_comp_img_3.currentSrc).contains("nat-3-large.")
  } else {
    await t.expect(about_comp_img_3.currentSrc).contains("nat-3.")
  }

  await scrollTo(t, "body > main > section.section-features")

  await takeScreenshotAtRunInfoContext(t, "section-features.png")

  await scrollTo(t, "body > main > section.section-tours")

  await takeScreenshotAtRunInfoContext(t, "section-tours.png")

  await t.hover(
    "body > main > section.section-tours > div.row > div:nth-child(1) > div.card",
  )

  await takeScreenshotAtRunInfoContext(t, "section-tours-card-hovered.png")

  await scrollTo(t, "body > main > section.section-stories")

  await takeScreenshotAtRunInfoContext(t, "section-stories.png")

  await t
    .hover(
      "body > main > section.section-stories > div:nth-child(4) > div.story > div > p",
    )
    .wait(500) // animation

  await takeScreenshotAtRunInfoContext(t, "section-stories-jack-hovered.png")

  await scrollTo(t, "body > main > section.section-book")

  await takeScreenshotAtRunInfoContext(t, "section-book.png")

  await scrollTo(t, "body > footer")

  await takeScreenshotAtRunInfoContext(t, "footer.png")
})

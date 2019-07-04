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
import { takeScreenshotAtRunInfoContext } from "./utils/screenshot"
import { setRunInfoCtx, evaluateRunArgsBrowser } from "./utils/runinfos"
import path from "path"

const ENVAPPSRVPORT = require("../../config/env/ENVAPPSRVPORT")

fixture("Index_Page_Test")
  .beforeEach(async (t) => {
    const runArgsBrowser = await evaluateRunArgsBrowser(t)

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

test("take_screenshots", async (t) => {
  await scrollTo(t, "body > main > section.section-tours")

  await t.wait(500) // animation

  await t.debug()

  await takeScreenshotAtRunInfoContext(t, "section-tours.png")
})

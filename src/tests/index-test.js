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
} from "./utils/runinfos"
import path from "path"

const ENVAPPSRVPORT = require("../../config/env/ENVAPPSRVPORT")

fixture("Index_Page_Test")
  .page(`http://localhost:${ENVAPPSRVPORT.get()}/index.html`)
  .beforeEach(async (t) => {
    await resizeToRunInfoDimensions(t)

    /** @type {import("./utils/useragent").UserAgentInfos | undefined} */
    let ua
    /** @type { {dpr: number} | undefined} */
    let dpr
    /** @type { {width: number, height: number} | undefined} */
    let clientDimensions
    /** @type {boolean | undefined} */
    let isTouchEnabled
    //
    await Promise.all([
      (ua = parseUserAgentAsJson(await readUserAgent())),
      (dpr = await readDevicePixelRatio()),
      (clientDimensions = await readClientDimensions()),
      (isTouchEnabled = await readIsTouchEnabled()),
    ])

    //
    /**
     * @type {import("./utils/runinfos").RunInfoBrowser}
     */
    const browser = { ...dpr, ...clientDimensions, isTouchEnabled }
    const screenshotLeafDirName = renderSelectedWithReplacementsAsFileName(
      "{{ ua.family }}_{{ ua.os.family }}_{{ browser.width }}x{{ browser.height}}_{{ browser.dpr }}_{{ browser.isTouchEnabled }}",
      [{ searchMask: "headless", replaceMask: "" }],
      { ua: ua },
      { browser: browser },
    )
    /**
     * @type {import("./utils/runinfos").RunInfoCtx}
     */
    const runInfoCtx = {
      ua: ua,
      browser: browser,
      screenshotLeafDirName: screenshotLeafDirName,
      screenshotDir: path.join(
        t.testRun.opts.screenshotPath,
        screenshotLeafDirName,
      ),
    }
    //
    setRunInfoCtx(t, runInfoCtx)
    //
    console.log(
      "  - touch is >>" +
        (isTouchEnabled ? "enabled(true)" : "disabled(false)") +
        "<< for >>" +
        screenshotLeafDirName +
        "<<",
    )
  })

test("take_screenshots", async (t) => {
  await takeScreenshotAtRunInfoContext(t, "header.png")

  await scrollTo(t, "body > main > section.section-about")

  await takeScreenshotAtRunInfoContext(t, "section-about.png")

  const about_comp_img_3 = await selectImg(
    "body > main > section.section-about > div.row > div:nth-child(2) > div > img.composition__photo.composition__photo--p3",
  )

  await t.expect(about_comp_img_3.complete).ok()

  if (getRunInfoCtx(t).browser.dpr >= 2) {
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

  await t.hover(
    "body > main > section.section-stories > div:nth-child(4) > div.story > div > p",
  )

  await takeScreenshotAtRunInfoContext(t, "section-stories-jack-hovered.png")

  await scrollTo(t, "body > main > section.section-book")

  await takeScreenshotAtRunInfoContext(t, "section-book.png")

  await scrollTo(t, "body > footer")

  await takeScreenshotAtRunInfoContext(t, "footer.png")
})

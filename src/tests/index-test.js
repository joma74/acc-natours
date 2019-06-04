import {
  parseUserAgentAsJson,
  renderSelectedAsFileName,
  renderSelectedWithReplacementsAsFileName,
} from "./utils/useragent"
import { scrollTo } from "./utils/scroll"
import {
  readUserAgent,
  readDevicePixelRatio,
  readClientDimensions,
} from "./utils/stdfunc"
import { selectImg } from "./utils/img-elm"
import {
  takeScreenshot,
  takeScreenshotAtRunInfoContext,
} from "./utils/screenshot"
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
    //
    const ua = parseUserAgentAsJson(await readUserAgent())
    const dpr = await readDevicePixelRatio()
    const clientDimensions = await readClientDimensions()
    /**
     * @type {import("./utils/runinfos").RunInfoBrowser}
     */
    const browser = { ...dpr, ...clientDimensions }
    const screenshotLeafDirName = renderSelectedWithReplacementsAsFileName(
      "{{ ua.family }}_{{ ua.os.family }}_{{ browser.width }}x{{ browser.height}}_{{ browser.dpr }}",
      [{ searchMask: "headless", replaceMask: "" }],
      { ua: ua },
      { browser: browser },
    )
    //
    setRunInfoCtx(t, {
      ua: ua,
      browser: browser,
      screenshotLeafDirName: screenshotLeafDirName,
      screenshotDir: path.join(
        t.testRun.opts.screenshotPath,
        screenshotLeafDirName,
      ),
    })
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

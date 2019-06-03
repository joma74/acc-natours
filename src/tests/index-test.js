import {
  parseUserAgentAsJson,
  renderSelectedAsFileName,
} from "./utils/useragent"
import { scrollTo } from "./utils/scroll"
import {
  readUserAgent,
  readDevicePixelRatio,
  readClientDimensions,
} from "./utils/std-func"
import { selectImg } from "./utils/img-elm"
import { takeScreenshot } from "./utils/screenshot"

const ENVAPPSRVPORT = require("../../config/env/ENVAPPSRVPORT")

fixture("Index_Page_Test").page(
  `http://localhost:${ENVAPPSRVPORT.get()}/index.html`,
)

test("take_screenshots", async (t) => {
  const ua = parseUserAgentAsJson(await readUserAgent())
  const dpr = await readDevicePixelRatio()
  const clientDimensions = await readClientDimensions()
  const browser = { ...dpr, ...clientDimensions }
  const screenshotDirName = renderSelectedAsFileName(
    "{{ ua.family }}_{{ ua.os.family }}_{{ browser.width }}x{{ browser.height}}_{{ browser.dpr }}",
    { ua: ua },
    { browser: browser },
  )

  await takeScreenshot(t, screenshotDirName, "header.png")

  await scrollTo(t, "body > main > section.section-about")

  await takeScreenshot(t, screenshotDirName, "section-about.png")

  const about_comp_img_3 = await selectImg(
    "body > main > section.section-about > div.row > div:nth-child(2) > div > img.composition__photo.composition__photo--p3",
  )

  await t.expect(about_comp_img_3.complete).ok()
  if (browser.dpr >= 2) {
    await t.expect(about_comp_img_3.currentSrc).contains("nat-3-large.")
  } else {
    await t.expect(about_comp_img_3.currentSrc).contains("nat-3.")
  }

  await scrollTo(t, "body > main > section.section-features")

  await takeScreenshot(t, screenshotDirName, "section-features.png")

  await scrollTo(t, "body > main > section.section-tours")

  await takeScreenshot(t, screenshotDirName, "section-tours.png")

  await t.hover(
    "body > main > section.section-tours > div.row > div:nth-child(1) > div.card",
  )

  await takeScreenshot(t, screenshotDirName, "section-tours-card-hovered.png")

  await scrollTo(t, "body > main > section.section-stories")

  await takeScreenshot(t, screenshotDirName, "section-stories.png")

  await t.hover(
    "body > main > section.section-stories > div:nth-child(4) > div.story > div > p",
  )

  await takeScreenshot(t, screenshotDirName, "section-stories-jack-hovered.png")

  await scrollTo(t, "body > main > section.section-book")

  await takeScreenshot(t, screenshotDirName, "section-book.png")

  await scrollTo(t, "body > footer")

  await takeScreenshot(t, screenshotDirName, "footer.png")
})

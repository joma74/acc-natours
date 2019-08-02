import { scrollTo } from "./utils/scroll"
import { selectImg } from "./utils/img-elm"
import { takeScreenshotAtRunInfoContext } from "./utils/screenshot"
import { getRunInfoCtx } from "./utils/runinfos"
import { beforeEach } from "./utils/before-each"

const ENVAPPSRVPORT = require("../../config/env/ENVAPPSRVPORT")

fixture("Index_Page_Test")
  .beforeEach(async (t) => {
    await beforeEach(t)
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

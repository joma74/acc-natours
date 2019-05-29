import { getUA, identifyUserAgent } from "./utils/identify-useragent"
import { scrollTo } from "./utils/scroll"

const ENVAPPSRVPORT = require("../../config/env/ENVAPPSRVPORT")

fixture("Index_Page_Test")
  .page(`http://localhost:${ENVAPPSRVPORT.get()}/index.html`)
  .beforeEach(async (t) => {
    await t.resizeWindow(1280, 1024) // SXGA
  })

const testName = "dom_has_critical_elements"

test(testName, async (t) => {
  const ua = await getUA()
  const uaDir = identifyUserAgent(ua)

  await t.takeScreenshot(
    t.testRun.test.fixture.name +
      "/" +
      t.testRun.test.name +
      "/" +
      uaDir +
      "/" +
      "initial-page-load.png",
  )

  await scrollTo(t, "body > main > section.section-about")

  await t.takeScreenshot(
    t.testRun.test.fixture.name +
      "/" +
      t.testRun.test.name +
      "/" +
      uaDir +
      "/" +
      "section-about.png",
  )

  await scrollTo(t, "body > main > section.section-features")

  await t.takeScreenshot(
    t.testRun.test.fixture.name +
      "/" +
      t.testRun.test.name +
      "/" +
      uaDir +
      "/" +
      "section-features.png",
  )

  await scrollTo(t, "body > main > section.section-tours")

  await t.takeScreenshot(
    t.testRun.test.fixture.name +
      "/" +
      t.testRun.test.name +
      "/" +
      uaDir +
      "/" +
      "section-tours.png",
  )

  await t.hover(
    "body > main > section.section-tours > div.row > div:nth-child(1) > div.card",
  )

  await t.takeScreenshot(
    t.testRun.test.fixture.name +
      "/" +
      t.testRun.test.name +
      "/" +
      uaDir +
      "/" +
      "section-tours-card-turned.png",
  )

  await scrollTo(t, "body > main > section.section-stories")

  await t.takeScreenshot(
    t.testRun.test.fixture.name +
      "/" +
      t.testRun.test.name +
      "/" +
      uaDir +
      "/" +
      "section-stories.png",
  )

  await t.hover(
    "body > main > section.section-stories > div:nth-child(4) > div.story > div > p",
  )

  await t.takeScreenshot(
    t.testRun.test.fixture.name +
      "/" +
      t.testRun.test.name +
      "/" +
      uaDir +
      "/" +
      "section-stories-jack-hovered.png",
  )

  await scrollTo(t, "body > main > section.section-book")

  await t.takeScreenshot(
    t.testRun.test.fixture.name +
      "/" +
      t.testRun.test.name +
      "/" +
      uaDir +
      "/" +
      "section-book.png",
  )

  await scrollTo(t, "body > footer")

  await t.takeScreenshot(
    t.testRun.test.fixture.name +
      "/" +
      t.testRun.test.name +
      "/" +
      uaDir +
      "/" +
      "footer.png",
  )
})

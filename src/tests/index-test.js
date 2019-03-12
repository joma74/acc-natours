import { ClientFunction } from "testcafe"
import identifyUserAgent from "./utils/identify-useragent"

fixture("Index_Page_Test")
  .page("http://localhost:8080/dist/index.html")
  .beforeEach(async (t) => {
    await t.resizeWindow(1280, 1024) // SXGA
  })

const getUA = ClientFunction(() => navigator.userAgent)

const testName = "dom_has_critical_elements"

test(testName, async (t) => {
  const ua = await getUA()

  await t.takeScreenshot(
    t.testRun.test.fixture.name +
      "/" +
      t.testRun.test.name +
      "/" +
      identifyUserAgent(ua) +
      "/" +
      "scsh_1.png",
  )
})

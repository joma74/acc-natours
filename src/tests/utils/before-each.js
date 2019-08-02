import {
  parseUserAgentAsJson,
  renderSelectedWithReplacementsAsFileName,
} from "./useragent"
import {
  readUserAgent,
  readDevicePixelRatio,
  readClientDimensions as readViewportDimensions,
  readIsTouchEnabled,
} from "./stdfunc"

import {
  resizeToRunInfoDimensions,
  setRunInfoCtx,
  evaluateRunArgsBrowser,
} from "./runinfos"
import path from "path"

/**
 *
 * @param {TestController} t
 */
const beforeEach = async (t) => {
  const runArgsBrowser = await evaluateRunArgsBrowser(t)
  await resizeToRunInfoDimensions(t, runArgsBrowser)

  /** @type {import("./useragent").UserAgentInfos}  */
  let ua
  /** @type { {dpr: number}} */
  let dpr
  /** @type { {viewportWidth: number, viewportHeight: number}} */
  let viewportDimensions
  /** @type {boolean} */
  let isTouchEnabled
  //
  await Promise.all([
    parseUserAgentAsJson(await readUserAgent()),
    await readDevicePixelRatio(),
    await readViewportDimensions(),
    await readIsTouchEnabled(),
  ])
    .then((values) => {
      ua = values[0]
      dpr = values[1]
      viewportDimensions = values[2]
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
    viewportDimensions === undefined ||
    // @ts-ignore
    isTouchEnabled === undefined
  ) {
    throw new Error("Some of the read infos are not available, aborting.")
  }

  const runValuesBrowser = { ...dpr, ...viewportDimensions, isTouchEnabled }
  const screenshotLeafDirName = renderSelectedWithReplacementsAsFileName(
    "{{ ua.family }}_{{ ua.os.family }}_{{ browser.viewportWidth }}x{{ browser.viewportHeight }}_mob#{{ runArgs.mobile }}_dpr#{{ browser.dpr }}_tou#{{ browser.isTouchEnabled }}",
    [{ searchMask: "headless", replaceMask: "" }],
    { ua },
    { browser: runValuesBrowser, runArgs: runArgsBrowser },
  )
  /**
   * @type {import("./runinfos").RunInfoCtx}
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
}

export { beforeEach }

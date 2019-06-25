Handling PNG Screenshots is slow

### What is your Test Scenario?

Test scenario is taking screenshots for visual regression verfication.

### What are you suggesting?

1. Optimize use of png operations

   1.1 Identify and minimize costly png operations within testcafe(reparsing, reading anew from file).

   1.2 Forward png within testcafe as in-memory object.

   1.1-1.2 E.g. in headless mode `capturer.js` relates to `base.js` for taking the screenshot for chrome and firefox. In `base.js` it is cropped to dimensions and written to disk. Back to `capturer.js`, the screenshot is read from disk for cropping to dimensions, just to see that nothing needs to be done.

   1.3 Options to make png handling gradually really async. E.g. must complete only before test ends. User decides on sync waiting for each, callback on all completion or all auto async.

   1.4 Forward png to testcafe users as in-memory object. E.g. give access to Byte Buffer and reserved file path from `t.takeScreenshot`. Let user decide if screenshot needs to be written to disk. Let user access screenshot more easily.

2. Option to disable thumbnail generation. Beside the personal non-usage and therefore extra time spent, e.g. a [thumbnail](https://github.com/joma74/acc-natours/blob/testcafe-pngslow-issue/docs/testcafe-png/thumbnail/footer-thumbnail.png) of [this](https://github.com/joma74/acc-natours/blob/testcafe-pngslow-issue/docs/testcafe-png/thumbnail/footer-screenshot.png) is rendered distorted, so the usage is non-obvious to me.

#### Out of scope

1. Requesting browser providers to speed up screenshot delivery

### What alternatives have you considered?

1. Analyse why upstream `pngjs` takes it's time

2. Evaluate https://www.npmjs.com/package/node-libpng because of an [advertised ~ 4x speed gain](https://www.npmjs.com/package/node-libpng#read-access-decoding)

### Additional context

First planned step was to let testcafe take screenshots of my [multi-100-vvh, nearly static SPA](https://github.com/joma74/acc-natours/tree/testcafe-pngslow-issue) at all it's media breakpoints. Both for firefox and chrome, plus some variatons on different dpr(device-pixel-ratio) and mobile emulations, and all of that againts a dev setup and a prod setup.

As of now there is [a single test](https://github.com/joma74/acc-natours/blob/testcafe-pngslow-issue/src/tests/index-test.js) which scrolls to the relevant sections of the web app and then takes a screenshot. Sums up to 10 screenshots per browser.

Each breakpoint-browser-... combination is driven by [runTestCafe's browser configurations](https://github.com/joma74/acc-natours/blob/testcafe-pngslow-issue/src/tests/run-testcafe.js). But after adding my seventh browser setup testcafe became unstable. Screenshots appeared slowly on disk, then halted. Test run never finished, intervened manually by aborting after 15 minutes, left with no status whatsoever.

First thought was that just 7\*2 browser instances 'killed' my laptop, but after i 'disabled' the taking of screenshots, all test runs finished successfully within 70s together(dev+prod setup concurrently).

So i was curious and employed [clinic js](https://clinicjs.org/) to the setup, decreased the browser setup to four, and was pointed to a cpu bound issue. Therefore generated a flame graph, which you can download at https://github.com/joma74/acc-natours/blob/testcafe-pngslow-issue/docs/testcafe-png/clinic/25000.clinic-flame.html.

As you can see, the hot spots are all about [pngjs](https://github.com/DevExpress/testcafe/blob/master/package.json#L106).

Next i sprinkled some `console.time` measurements at [base.js](https://github.com/joma74/acc-natours/blob/testcafe-pngslow-issue/docs/testcafe-png/changed-sources/base.js) and [capturer.js](https://github.com/joma74/acc-natours/blob/testcafe-pngslow-issue/docs/testcafe-png/changed-sources/capturer.js). [Logged them away](https://github.com/joma74/acc-natours/blob/testcafe-pngslow-issue/docs/testcafe-png/yarn.ci-prod.log.txt#L45) and built a [report sheet](https://github.com/joma74/acc-natours/blob/testcafe-pngslow-issue/docs/testcafe-png/testcafe-pngisslow.ods) from the data.

Key take-away from the data is that more than an overall 3 minutes worth were spent on png read+deserialize../serialize+write.. access from/to disk for a total build time of around 2 minutes. Reading or writing a png to disk take both each around 1.3 seconds per operation on average. The time spent on png read/write access is proportional to the dimension of the png t.i. count of coded pixels.

Additional conclusion is that chrome 75.0.3770 takes twice as long for a screenshot compared to firefox 67.0.0, budgeting nearly 1 second per screenshot as opposed to 0.5 second respectively.

What it is about: A literally single page application that reacts per CSS different to the following
browser setups

- at different Media Breakpoints based on
  - width and/or
  - resolution and/or
  - touch capability
- at different Device Pixel Ratios
- at different Touch Modes
- at different Device Types(Mobile or Desktop)

The application is really a single HTML page with sections summing up to multiples of `100 vh`(CSS for "hundredths of the viewport height"). But each section is not exactly `100 vh`( A point that i have a look at later).

Target browsers are chrome and firefox(FF), as i prefer to be bound to desktop browsers available on
Linux(so no Mac or Windows). Also as cloud based CIs for Windows and Mac are not so easily supported and you have to take extra care in your project setup e.g. regarding file paths.

Additionally, the project for the app has have two different Delivery Modes: Dev Mode and Prod Mode. Dev Mode is based on webpack-dev-server with hot reload. Prod Mode is physically compiled and served from a single dir. Beyond Dev Mode being served by a quite different base than Prod Mode, Dev Mode has a Mode dependent POSTCSS option which shows a visually translucent 32x32px grid in the browser.

To reiterate my use case with testcafe: Check for some combinations of

- browser settings
- browser vendors
- delivery modes

by screenshot to see if the app works visually as expected.

Now into the course of how my implementation run

1. How to configure browser setup
2. How to write test
3. How to take screenshot

# How To Configure Browser Setup

First takeaway for me was that by only supplying browser CLI arguments ala chrome's `window-size` do
not get you something when it comes to above browser setup list. That meant for
chrome to check out the emulation options wrapped by testcafe, which cover all of the above browser setup requirements.

But on firefox i was first clueless - there is no CLI for emulation mode. So i prepared an own FF profile prior to FF startup. Along with the automatic removal of the tmp profile(which btw did not work consistently as does testcafe's), I did some amount of copying testcafe's firefox profile handling procedure (Enhancement #1).

On that way i also converted from package.json driven testcafe parameters to testcafe's programmatic
runTestCafe approach. As the browsers array therein was initially not pretty either, i wrapped that in a Builder pattern (Enhancement #2) with my sensible defaults and hiding/harmonizing browser setups e.g.

```js
;(await new ChromeBrowserConfig.Builder().withWidth(600).build()).output()
```

Where `output()` renders the browser configuration to the per testcafe expected string format.

_[Rant] That `await` before `new` is so cruel as anything in Node that is trapped by using a single async function anywhere below. And wants to continue sync again._

Still, how to set width/height for the media breakpoints in FF were not clear to me. `t.resizeWindow` documents itself as `Sets the browser window size.` How does that help to meet the viewport size?

To peek how all this is handled with chrome I discovered testcafe's `setEmulationBounds` using Chrome Developer Protocols's(CDP) `setDeviceMetricsOverride` and `setVisibleSize`.

Tried to make sense out of that one's documentation at
https://chromedevtools.github.io/devtools-protocol/tot/Emulation/#method-setDeviceMetricsOverride.
Describes iteself as

> `...window.screen.width, window.screen.height, window.innerWidth, window.innerHeight, ...`

Whaaaat? For me it looked like, and after researching still is, a complete specification naming disaster followed by a browser vendor interpretation disaster.

Following along i tried to make sense out of
https://chromedevtools.github.io/devtools-protocol/tot/Emulation/#method-setVisibleSize. `Resizes the frame/viewport of the page.` Whaaaat? _Which is btw currently marked as "experimental" and
"deprecated".(Issue #1)_

Out of those two and other references - of whom i would like to highlight https://www.quirksmode.org/blog/archives/2013/12/desktop_media_q.html - i chrocheted a mental model, which boils down to

```js
                 window.innerWidth x window.innerHeight
                 = The browser's inner window
```

where this includes the width/height of the eventual scrollbar(s). This one would kick in on CSS media breakpoints defined by `device-width/device-height`(which i do not use). For the mobile Device Type, these are referenced as visual viewport dimensions.

While the viewport - a special term for a conceptual rectangle area that does not change while zooming, but only somewhat setable via the HTML `meta viewport` tag -

```js
                document.documentElement.clientWidth x document.documentElement.clientHeight
                = The browser's inner window's viewport
```

contains the root element, like <html>, and does not include the scrollbars. This one kicks on
CSS media breakpoints defined by width/height. In mobile mode, these are referenced as the layout
viewport dimensions.

So, i have written a length about finding out how make chrome matching CSS Media query boundaries in emulation mode. But what about FF, having no emulation mode? Turns out that only if you run FF via marionettePort(which is tescafe's default of operation), `t.resizeWindow` first fetches

```
width: window.innerWidth,
height: window.innerHeight,
outerWidth: window.outerWidth,
outerHeight: window.outerHeight,
availableWidth: screen.availWidth,
availableHeight: screen.availHeight
```

Then it calls FF's `getWindowRect` (which i assume to be `window.outerWidth`), calculates the diff between `currentRect.width/height` and `window.innerWidth/Height` and adds that to the width/height given to `t.resizeWindow` and sends that via marionette's setWindowRect(which eventually succeeds, see sources about cases where that value is too small or too big).

_If this conclusion is right, i vote that t.resizeWindow should be aliased renamed (resizeInnerWindow), documented as such and sensible variants (outer,...) should be built into testcafe(Issue #2)_

And so one can expect to have `window.innerWidth/Height` been set via `t.resizeWindow` - which is the same as we accomplished via CDP's `setDeviceMetricsOverride`. Interferes with chrome emulation mode? Nope TBD

But still, will I never have the viewport related media query kicking in FF? To check on that, turned out that resizing at the 0/+1 pixel cases on one of my media query width's, the media query kicked in?!?!

Turns out that https://www.quirksmode.org/blog/archives/2013/12/desktop_media_q.html also made the following related observation about some desktop browser vendors

> The width and height media queries are no longer slaved to
> document.documentElement.clientWidth/Height.
> Instead, they take their cues from window.innerWidth/Height. This means desktop browsers now treat
> these media queries differently than mobile browsers.

You can observe this effect with your chrome or FF browser by opening
https://www.quirksmode.org/css/tests/mediaqueries/width.html, which still proves what was written in
2013! Hmmm. In chrome's Toggle Device Mode, the result of https://www.quirksmode.org/css/tests/mediaqueries/width.html changes when you toggle the Device Type from desktop to mobile. In FF in Responsive Design Mode, the result changes too. So, FF's Responsive Design Mode == Chrome's Device Type's Mobile mode? Dunno FF, anyone anywhere documented?

So, to use `t.resizeWindow` seems to be working for FF. But wait a second, if the same test should run under chrome and FF, does `t.resizeWindow` for FF interfere with chrome in emulation mode? Turns out that i was in luck again. `t.resizeWindow` for chrome in emulation mode syncs with the set parameters.

# How to write test

Overall point is that, inside your test, you have no access to the arguments of the run or the configuration of the browser currently run. Examples where this would be beneficial

- set viewport width and height (see chapter "How To Configure Browser Setup")
- check that the configuration of the browser setup aligns to the current browser
- build a subdirectory for screenshots for each running browser instance

Infos from the running testcafe configuration to current live data - that is all about options, browser instance and current test are already orderly parsed and evaluated, held in sync by testcafe and is (i assume) unit tested. But these infos are not (officially) accessible for the end user, meaning effort and code duplication.

Additionally there is also an API lacking, between `runTestCafe` and the current test(Enhancement #3). Let me show you an example of usage: As explained before, for FF i need to call `t.resizeWindow` with a height and width. Therefore i put the run arguments on the testcafe browser configuration, even, like `scaleFactor` or `touch`, they do not exist as FF CLI params. But are enacted via building a FF profile.

`"firefox:headless:marionettePort=42939 -profile /tmp/testcafe-ext/firefox-profile-309573pwGWM1c30Pe -width=600 -height=1024 -scaleFactor=2 -touch=true -mobile=false"`

Then, in my test i do

```js
const runArgsBrowser = await evaluateRunArgsBrowser(t)
await resizeToRunInfoDimensions(t, runArgsBrowser)
```

Where `runArgsBrowser` are evaluated

```js
const HEIGHT_RUNINFO_RE = /(?:height=)([0-9]+|$)/
const WIDTH_RUNINFO_RE = /(?:width=)([0-9]+|$)/
...
/**
 *
 * @param {TestController} t
 * @return {Promise<RunArgsBrowser>} runArgsBrowser
 */
const evaluateRunArgsBrowser = async function(t) {
  /**
   * @type {RunArgsBrowser}
   */
  const result = {}

  const runArgsBrowser = await t.testRun.browserConnection.browserInfo.alias

  result.height = evalRegexAsInt(HEIGHT_RUNINFO_RE, runArgsBrowser)

  result.width = evalRegexAsInt(WIDTH_RUNINFO_RE, runArgsBrowser)
  ...
```

As you can see in `evaluateRunArgsBrowser`, i dabbled into testcafe interna and parsed the line(can't remember where, but i saw testcafe code that does that kind of parsing already).

# How to take screenshot

TBD

# Other

## Browser Setup And It's Relation To Testcafe Behaviours Are Lacking Documentation

As can be seen in the pargraphs of the Browser Setup chapter, overall testcafe lacks documentation under which condition which behaviour is shown in which browser vendor. Read e.g.

- chrome with and without emulation
- FF with and without marionette port and/or with and without own profile
- other browsers without a built-in browser plugin

Example #1

> Starting FF via testcafe defining an own profile, testcafe will not use FF's marionette protocol. One has to set the marionette port explicitly on the command line.

Example #2

> Starting FF in non-headless mode, testcafe does not allow you to set a marionette port to it's options. Which it should offer, if you define an own FF's profile. Instead, a testcafe's own marionette client with some other port is opened.

## Testcafe Under-The-Hood

Another point about my understanding of testcafe is that - as one might presume falsely by now speaking at length about CDP and marionette - testcafe is not just yet another wrapper over Chrome's CDP or FF's Marionette. Many of the other testcafe commands are routed via a JS proxy(hammerhead) directly into/onto the browser runnning the application under test. In the whole documentation of testcafe this point is never mentioned and AFAIK very unique.

Would love to hear about the architectural decision process and pros and cons. Or why it does not relate to the w3c driver protocol, or where it does at least. This would be beneficial for decisions about the ins and outs when evaluating.

## Testcafe Supports Only Latest Browsers

Also lacking is a more prominent section about why testcafe supports only the latest browser
versions.

## Testcafe Delivers ES3 Code

Why testcafe delivers transpiled es3 code? `Promises` are resolved to some promisify framework :frowning:, whatever that does. Thing is, it makes debugging testcafe for me quite difficult. While delivered with source mappings, this is rather bothersome, from initial setting breakpoints till the source mapping is recognized to funny line jumps while debugging to stepping through nested technical crutch sources i am not interested in.

## Provide ESM for node

Testcafe already uses `esm` underneath. Would love support for es6 modules in node for my tests too. Had to learn to run my runTestCafe via `node -r esm src/tests/run-testcafe`.

## Enhance Logging

Tracing what testcafe does while running a test is - well - not existing. Some debug level that shows timestamped console messages like "Starting browser", "Started browser", "Taking screenshot".

## Make Browser Window Assignable To Current Run

If you debug tests with more than one browser, one can not deduct which browser belongs to the current instance of the test. See also "Enhance Logging".

## Reporting, Esp xunit

## Auto Fetch Standard DOM Properties Per HTML Element Type

What to fetch for eg HTMLImageElement see `lib.dom.ts`. Do not know if there is a performance or memory penalty.

## Debugging Chrome in headless mode should be allowed

Chrome allows more than one session, so even in headless mode i wanted to use it.

## Support more TS type flowing

I know, the TS hints make this look like complete madness. And it is.

```
/**
 * Selects
 *
 * @param {string} imgSelector
 * @return the selected img element by the given imgSelector
 */
const selectImg = async (imgSelector) => {
  /** @type { SelectorAPI & HTMLImageElement} */
  const result = await /** @type { ? } */ (Selector(
    imgSelector,
  )).addCustomDOMProperties({
    // @ts-ignore
    complete: (/** @type {HTMLImageElement} */ el) => {
      return el.complete
    },
    // @ts-ignore
    naturalHeight: (/** @type {HTMLImageElement} */ el) => el.naturalHeight,
    // @ts-ignore
    naturalWidth: (/** @type {HTMLImageElement} */ el) => el.naturalWidth,
    // @ts-ignore
    currentSrc: (/** @type {HTMLImageElement} */ el) => el.currentSrc,
  })
  return result
}
```

Usage

```
const about_comp_img_3 = await selectImg(
    "body > main > section.section-about > div.row > div:nth-child(2) > div > img.composition__photo.composition__photo--p3",
  )

  await t.expect(about_comp_img_3.complete).ok()

  if (getRunInfoCtx(t).runValuesBrowser.dpr >= 2) {
    await t.expect(about_comp_img_3.currentSrc).contains("nat-3-large.")
  } else {
    await t.expect(about_comp_img_3.currentSrc).contains("nat-3.")
  }
```
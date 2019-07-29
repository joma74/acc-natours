What it is about: A literally single page application that reacts per CSS different to the following
browser setups

- at different Media Breakpoints based on
  - width and/or
  - resolution and/or
  - touch capability
- at different Device Pixel Ratios
- at different Touch Modes
- at different Screen Modes

The application is really a single HTML page with sections summing up to multiples of `100 vh`(CSS for "hundredths of the viewport height"). But each section is not exactly `100 vh`( A point that i have a look at later).

Target browsers are chrome and firefox(FF), as i prefer to be bound to desktop browsers available on
Linux(so no Mac or Windows). Also as cloud based CIs for Windows and Mac are not so easily supported and you have to take extra care in your project setup e.g. regarding file paths.

Additionally, the project for the app has have two different delivery modes: Dev Mode and Prod Mode. Dev Mode is based on webpack-dev-server with hot reload. Prod Mode is physically compiled and served from a single dir. Beyond Dev Mode being served by a quite different base than Prod Mode, Dev Mode has a Mode dependent POSTCSS option which shows a visually translucent 32x32px grid in the browser.

To reiterate my use case with testcafe: Check for some combinations of

- browser settings
- browser vendors
- operation modes
  by screenshot if it works visually as expected.

Now into the course of how my implementation run

1. How to configure browser setup
2. How to write test
3. How to take screenshot

First takeaway for me was that by only supplying browser CLI arguments ala window-size do
not get you something when it comes to the items on the above browser setup list. That meant for
chrome to check out the emulation options wrapped by testcafe, which cover some of the browser setup
requirements.

But on firefox i was first clueless(no CLI for emulation mode), had to prepare an own FF profile
prior to FF startup. Along with the automatic removal of the tmp profile(which btw did not work
consistently as does testcafe's), I did some amount of copying testcafe's firefox profile handling
procedure (Enhancement #1).

On that way i also converted from package.json driven testcafe parameters to testcafe's programmatic
runTestCafe approach. As the browsers array therein was initially not pretty either, i wrapped that in
a Builder pattern (Enhancement #2) with my sensible defaults and hiding/harmonizing browser setups e.g.

```
(await new ChromeBrowserConfig.Builder()
          .withWidth(600)
          .build()).output()
```

_[Rant] That await before new is so cruel as anything in Node that is just trapped by using just a
single async function anywhere below._

Still how to set width/height for the media breakpoints were not clear to me. `t.resizeWindow`
documents itself as `Sets the browser window size.` How does that help to meet the viewport size?

For chrome in emulation mode - nothing really.
I discovered testcafe's setEmulationBounds for chrome using Chrome Developer Tool's(cdp)
setDeviceMetricsOverride and setVisibleSize.

Tried to make sense out of
https://chromedevtools.github.io/devtools-protocol/tot/Emulation/#method-setDeviceMetricsOverride.
window.screen.width, window.screen.height, window.innerWidth, window.innerHeight, ... Whaaaat?
For me it looked like, and still is, a complete specification naming disaster followed by a browser
vendor interpretation disaster.

Then tried to make sense out of
https://chromedevtools.github.io/devtools-protocol/tot/Emulation/#method-setVisibleSize. Resizes the
frame/viewport of the page. Whaaaat? _Which is btw currently marked as "experimental" and
"deprecated"._

Out of those two and other references like https://www.quirksmode.org/blog/archives/2013/12/desktop_media_q.html,
i chrocheted a mental model, which boils down to

                 window.innerWidth x window.innerHeight
                 = The browser's inner window

where this eventually includes the width/height of the scrollbar(s) and/or activated developer tools.
This one would kick in on CSS media breakpoints defined by device-width/device-height(which i do not use).
For mobile mode, these are referenced as visual viewport dimensions.

While the viewport - a special term for a rectangle that does not change while zooming -

                document.documentElement.clientWidth x document.documentElement.clientHeight
                = The browser's inner window's viewport

contains the root element, like <html>, and does not include the scrollbars. This one kicks on
CSS media breakpoints defined by width/height. For mobile mode, these are referenced as the layout
viewport dimensions.

So, i have written a length about how to make chrome matching CSS Media query boundaries. But what
about FF, having no emulation mode? Turns out that only if you run FF via marionettePort,
t.resizeWindow first fetches
width: window.innerWidth,
height: window.innerHeight,
outerWidth: window.outerWidth,
outerHeight: window.outerHeight,
availableWidth: screen.availWidth,
availableHeight: screen.availHeight

Then it fetches FF's getWindowRect (which should be window.outerWidth), calculates the diff between
currentRect.width/height and window.innerWidth/Height and adds that to the width/height given via
t.resizeWindow and sends that via marionette's setWindowRect(which eventually succeeds, see sources
about cases where that value is too small or too big). And so one can expect to have
window.innerWidth/Height been set - which is the same as we accomplished via CDP's
setDeviceMetricsOverride. _If this conclusion is right, i vote for t.resizeWindow should be aliased
renamed (resizeInnerWindow) and sensible variants (outer,...) should be built into testcafe_

But wait, will I never have the viewport related media query have kicking in in FF? On making
screenshots at the +1 pixel edge on one of my media query width's, all went as expected?!?!

Turns out that https://www.quirksmode.org/blog/archives/2013/12/desktop_media_q.html made the
following observation
<q>
The width and height media queries are no longer slaved to
document.documentElement.clientWidth/Height.
Instead, they take their cues from window.innerWidth/Height. This means desktop browsers now treat
these media queries differently than mobile browsers.
<q>
You can observe this effect with your chrome or firefox browser by opening
https://www.quirksmode.org/css/tests/mediaqueries/width.html, which still proves what was written in
2013 at https://www.quirksmode.org/blog/archives/2013/12/desktop_media_q.html!

In chrome's Toggle Device Mode, the result of https://www.quirksmode.org/css/tests/mediaqueries/width.html
changes when you toggle the device type from "desktop" to "mobile". In FF in Responsive Design Mode, 0
the result changes too. So, Responsive Design Mode == Mobile Mode - dunno FF, anywhere documented?

A point along the previous paragraphs is that testcafe lacks documentation under which condition
which behaviour is shown in which browser vendor. (chrome with and without emulation, FF with and
without marionette port and/or with and without own profile, other browsers without a built-in
plugin)

Also, to recap, starting headless FF via testcafe defining an own profile will not use marionette. One
has to set the marionette port explicitly.

Also note that, starting FF in non-headless mode, testcafe does not allow you to set a marionette
port to it's options. Which it should offer. Instead, a testcafe's own marionette client with some
port is always opened.

Another point about my understanding of testcafe is that - as you might presume falsely by now -
testcafe is not just yet another wrapper over Chrome's CDP or FF's Marionette. Many of the other
testcafe commands are routed via a JS proxy(hammerhead) directly into/onto the browser runnning the
application under test. In the whole documentation of testcafe this point is never mentioned and
AFAIK very unique. Would love to hear about the architectural decision process and pros and cons. Or
why it does not relate to the w3c driver protocol, or where it does at least. This would be
beneficial for decision makers.

Also lacking is a more prominent section about why testcafe supports only the latest browser
versions.

Also provide support for es6 modules in node - testcafe already uses esm underneath. I had to learn
to run my runTestCafe via node -r esm src/tests/run-testcafe.

Another point is why testcafe transpiles itself to es3 or is it es5? At least promises are resolved
to some promisify framework, so it is not es6 :) Other thing is, it makes debugging testcafe for users quite difficult. Because
you only set breakpoints in the es5 code, which mostly do not match anything in the source mappings.

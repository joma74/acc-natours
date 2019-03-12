# tailwind-spa-ws

[![Build Status](https://travis-ci.org/joma74/tailwind-spa-ws.svg?branch=master)](https://travis-ci.org/joma74/tailwind-spa-ws) [![Dependabot Status](https://api.dependabot.com/badges/status?host=github&repo=joma74/tailwind-spa-ws)](https://dependabot.com)

A `tailwind-css` :heart_eyes: enabled html/css-based single page application(spa) workspace(ws) with hot reload. Powered by `webpack 3.x`, `vue 2.x` and `vue-template-loader`.

It is targeted for online presentations/pocs/playgrounds which revolve around mostly a single html and a single css.

:sunglasses: Speeds up your fun building a webpage :sunglasses:

![tailwind-spa-ws-screenshot](https://user-images.githubusercontent.com/5314859/52288734-05fab000-296d-11e9-9133-664fea6496ae.png)

## Showing you around

One of your primary files you will be working with is the file `app.html`. It starts and ends with the `<body>` element. This `<body>` is then included within `src/template.html`, where - out of technical reasons - the rest of your `<html>` page is defined.

To see it in action, after `yarn install` run `yarn serve` on your workstation, then open a browser pointing at <link>http://localhost:8080/dist/index.html</link>. This will show you the screen from above.

The assets, like images and svgs you see there, are expected to be under `src/assets`. The expected location and handling of your assets are configureable via `webpack.config.js`.

Last but not least note the applied CSS classes from `tailwind-css` in `app.html`.

## How do i save my work for e.g. distribution

Forking this project and commiting your changes there is certainly the right first option, but there is an additional option I am using: Run `Save as` from your browser and put it e.g. to the `dist` folder. This should save all the html, including all css as head's style and other assets. If you have put no other magic inside your page - e.g. JS that does more than render html with some css - these files are all you need. Just open the `dist/Template.html` file delivered here in the browser of your choice.

_P.S. Image assets get downloaded, but the svgs are not. Dunno. [Ask your browser vendor](https://bugs.chromium.org/p/chromium/issues/detail?id=874670)._

## Some details

There are two entry points configured for you in webpack.

The first one is `src/js/index.js`. That will be what your spa will primarly be showing. Essentially it makes a `vue` app (see also `src/js/components/App.js`) with special support from `vue-template-loader`. `vue-template-loader` is what JS-ifies your `app.html` file and assets within that and renders them in your browser.

The second one is `src/js/dummy.js`, which is just a dummy for forcing webpack to make a live physical `build/styles.css` file, which is configured by a once-generated `tailwind.js`, and outputs what is configured in your `app.css`. The same CSS content is applied inline as javascript via webpack as a ~311.819 column wide module text source. What is somewhat hard to find and digest in your browsers dev tool, but performant for hot-reloaded changes :smirk:. Hence this second entry point.

Another point to note is that `src/template.html` is processed and hence required, as configured, by webpack. It contains a mount point `div` element for the vue app marked `id="app"`. Do not let that confuse you - there is a workaround, the final mount point will be the `<body>` element.

_P.S. I know, `vue` is strictly against mounting on the `<body>` element as prefered in `app.html`, but_ `¯\_(ツ)_/¯`

## The debug grid

_TBD_

## Anything further

This shall not hinder you to sprinkle some additional `vue` powered components, rendering further html, inside your page.
Like this `vue` component...

```js
// src/js/components/OptionLine.js

// @ts-ignore
import renderFnkt from "@html/option-line.html"
import Vue from "vue"

let vueComponentOptions = Vue.extend({
  name: "OptionLine",
  props: {
    name: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
  },
})

export default renderFnkt(vueComponentOptions)
```

...rendering this html...

```html
// src/html/option-line.html
<div class="flex -mb-px">
  <button
    type="button"
    href="#"
    v-bind:class="[{'text-blue-dark': isActive, 'border-blue-dark': isActive, 'hover:border-grey-dark': !isActive}]"
    class="appearance-none no-underline py-4 border-b text-grey-dark border-transparent"
  >
    <span v-html="name"></span>
  </button>
</div>
```

...applied to your...

```html
// app.html ...
<div id="x-rates-timelines-options" class="flex mr-2-ex-last">
  <optionline name="1H"></optionline>
  <optionline name="1D"></optionline>
  <optionline name="1W"></optionline>
  <optionline name="1M" :isActive="true"></optionline>
  <optionline name="1Y"></optionline>
  <optionline name="ALL"></optionline>
</div>
...
```

## Install instructions

```
yarn install
```

## License

MIT

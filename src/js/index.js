/// <reference types="webpack-env" />

import "./modernizr"

Vue.prototype.MODE = process.env.NODE_ENV

import Vue from "vue"
import App from "@components/App"

// @ts-ignore
window.app = new Vue({
  el: "#app",
  render: (h) => h(App),
})

if (module.hot) {
  module.hot.accept()
}

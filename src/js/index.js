/// <reference types="webpack-env" />

import Vue from "vue"
import App from "@components/App"

new Vue({
  el: "#app",
  render: (h) => h(App),
})

if (module.hot) {
  module.hot.accept()
}

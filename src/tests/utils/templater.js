import Mustache from "mustache"

/**
 * @param template {string}
 * @param tagValues {AnyJson}
 * @returns {string} the filename-safe sanitized user agent string
 */
const render = function (template, tagValues) {
  const rendered = Mustache.render(template, tagValues)
  return rendered
}

export { render }

import sanitizeFilename from "sanitize-filename"
import { render } from "./templater"
import { parse } from "useragent"

/**
 * @typedef {{
 *  "family": string,
 *  "major":string,
 *  "minor":string,
 *  "patch":string,
 *  "device":{
 *    "family":string,
 *    "major":string,
 *    "minor":string,
 *    "patch":string
 *   },
 *   "os":{
 *      "family":string,
 *      "major":string,
 *      "minor":string,
 *      "patch":string
 *   }
 * }} UserAgentInfos - the "true" JSON from UserAgent.Agent
 */

/**
 * @param ua {string} a user agent string
 * @returns {UserAgentInfos} the user agent infos
 */
const parseUserAgentAsJson = function(ua) {
  // @ts-ignore
  return parseUserAgent(ua).toJSON()
}

/**
 * @param ua {string} a user agent string
 * @returns the user agent infos
 */
const parseUserAgent = function(ua) {
  return parse(ua)
}

/**
 * @param ua {string} a user agent string
 * @returns the filename-safe sanitized user agent string
 */
const renderFullAsFileName = function(ua) {
  const userAgent = parseUserAgent(ua)
  /**
   * @type {string}
   */
  const sanitizedFileName = sanitizeFilename(userAgent.toString())
  return sanitizedFileName.replace(/\s+/g, "_").toLowerCase()
}

/**
 * Available tag values for usage in given userAgentTemplate are merged from given uaTagValues merged with given otherTagValues.
 *
 * @param userAgentTemplate {string}
 * @param uaTagValues { { ua : UserAgentInfos} } user agent infos
 * @param otherTagValues {...AnyJson}
 * @returns the filename-safe sanitized user agent string
 */
const renderSelectedAsFileName = function(
  userAgentTemplate,
  uaTagValues,
  ...otherTagValues
) {
  const rendered = render(
    userAgentTemplate,
    Object.assign(uaTagValues, ...otherTagValues),
  )
  /**
   * @type {string}
   */
  const sanitizedFileName = sanitizeFilename(rendered)
  return sanitizedFileName.replace(/\s+/g, "_").toLowerCase()
}

export {
  parseUserAgent,
  parseUserAgentAsJson,
  renderFullAsFileName,
  renderSelectedAsFileName,
}

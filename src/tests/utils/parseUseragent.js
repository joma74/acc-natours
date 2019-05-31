import sanitizeFilename from "sanitize-filename"
import { parse } from "useragent"

/**
 * @param ua {string} a user agent string
 * @returns {string} the filename-safe sanitized user agent string
 */
const parseUserAgentAsFileName = function(ua) {
  const userAgent = parseUserAgent(ua)
  return sanitizeFilename(userAgent.toString()).replace(/\s+/g, "_")
}

/**
 * family, major, minor, patch, source, os, device
 * {
 *  "family": "Chrome",
 *  "major":"74",
 *  "minor":"0",
 *  "patch":"3729",
 *  "device":{
 *    "family":"Other",
 *    "major":"0",
 *    "minor":"0",
 *    "patch":"0"
 *   },
 *   "os":{
 *      "family":"Linux",
 *      "major":"0",
 *      "minor":"0",
 *      "patch":"0"
 *   }
 * }
 *
 * @param ua {string} a user agent string
 * @param mustachePattern {string}
 * @returns {string} the filename-safe sanitized user agent string
 * @see https://stackoverflow.com/questions/38750705/filter-object-properties-by-key-in-es6
 */
const parseUserAgentSelectedAsFileName = function(ua, mustachePattern) {
  const userAgent = parseUserAgent(ua)
  const r = userAgent.toJSON
  return sanitizeFilename(userAgent.toString()).replace(/\s+/g, "_")
}

/**
 * @param ua {string} a user agent string
 * @returns the user agent infos
 */
const parseUserAgentAsJson = function(ua) {
  return parseUserAgent(ua).toJSON()
}

/**
 * @param ua {string} a user agent string
 * @returns the user agent infos
 */
const parseUserAgent = function(ua) {
  return parse(ua)
}

export { parseUserAgent, parseUserAgentAsJson, parseUserAgentAsFileName }

import sanitizeFilename from "sanitize-filename"
import { parse } from "useragent"
import { ClientFunction } from "testcafe"

const getUA = ClientFunction(() => navigator.userAgent)

/**
 * @param ua {string} a user agent string
 * @returns the sanitized user agent string
 */
const parseUserAgentAsFileName = function (ua) {
  const userAgent = parseUserAgent(ua)
  return sanitizeFilename(userAgent.toString()).replace(/\s+/g, "_")
}

/**
 * @param ua {string} a user agent string
 * @returns the parsed user agent infos
 */
const parseUserAgentAsJson = function (ua) {
  return parseUserAgent(ua).toJSON
}

/**
 * @param ua {string} a user agent string
 * @returns the user agent infos
 */
const parseUserAgent = function (ua) {
  return parse(ua)
}

export { getUA, parseUserAgentAsFileName }

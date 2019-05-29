import sanitizeFilename from "sanitize-filename"
import { parse as parseUserAgent } from "useragent"
import { ClientFunction } from "testcafe"

const getUA = ClientFunction(() => navigator.userAgent)

/**
 * @param ua {string}
 */
const identifyUserAgent = function(ua) {
  const userAgent = parseUserAgent(ua)
  return sanitizeFilename(userAgent.toString()).replace(/\s+/g, "_")
}

export { getUA, identifyUserAgent }

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
 * @param ua {string} a user agent string
 * @param filter {{
        family: boolean;
        major: boolean;
        minor: boolean;
        patch: boolean;
        source: boolean;
        os: boolean;
        device: boolean;
    }}
 * @returns {string} the filename-safe sanitized user agent string
 */
const parseUserAgentSelectedAsFileName = function(ua, filter) {
  const userAgent = parseUserAgent(ua)
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

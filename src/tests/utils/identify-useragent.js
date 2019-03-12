import sanitizeFilename from "sanitize-filename"
import { parse as parseUserAgent } from "useragent"

/**
 * @param ua {string}
 */
export default function identifyUserAgent(ua) {
  const userAgent = parseUserAgent(ua)
  return sanitizeFilename(userAgent.toString()).replace(/\s+/g, "_")
}

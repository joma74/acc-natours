"use strict"
var __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, "__esModule", { value: true })
const path_1 = require("path")
const testcafe_browser_tools_1 = require("testcafe-browser-tools")
const crop_1 = require("./crop")
const make_dir_1 = __importDefault(require("make-dir"))
const async_queue_1 = require("../utils/async-queue")
const warning_message_1 = __importDefault(
  require("../notifications/warning-message"),
)
const escape_user_agent_1 = __importDefault(
  require("../utils/escape-user-agent"),
)
const correct_file_path_1 = __importDefault(
  require("../utils/correct-file-path"),
)
const promisified_functions_1 = require("../utils/promisified-functions")
class Capturer {
  constructor(
    baseScreenshotsPath,
    testEntry,
    connection,
    pathPattern,
    warningLog,
  ) {
    this.enabled = !!baseScreenshotsPath
    this.baseScreenshotsPath = baseScreenshotsPath
    this.testEntry = testEntry
    this.provider = connection.provider
    this.browserId = connection.id
    this.warningLog = warningLog
    this.pathPattern = pathPattern
  }
  static _getDimensionWithoutScrollbar(
    fullDimension,
    documentDimension,
    bodyDimension,
  ) {
    if (bodyDimension > fullDimension) return documentDimension
    if (documentDimension > fullDimension) return bodyDimension
    return Math.max(documentDimension, bodyDimension)
  }
  static _getCropDimensions(cropDimensions, pageDimensions) {
    if (!cropDimensions || !pageDimensions) return null
    const { dpr } = pageDimensions
    const { top, left, bottom, right } = cropDimensions
    return {
      top: Math.round(top * dpr),
      left: Math.round(left * dpr),
      bottom: Math.round(bottom * dpr),
      right: Math.round(right * dpr),
    }
  }
  static _getClientAreaDimensions(pageDimensions) {
    if (!pageDimensions) return null
    const {
      innerWidth,
      documentWidth,
      bodyWidth,
      innerHeight,
      documentHeight,
      bodyHeight,
      dpr,
    } = pageDimensions
    return {
      width: Math.floor(
        Capturer._getDimensionWithoutScrollbar(
          innerWidth,
          documentWidth,
          bodyWidth,
        ) * dpr,
      ),
      height: Math.floor(
        Capturer._getDimensionWithoutScrollbar(
          innerHeight,
          documentHeight,
          bodyHeight,
        ) * dpr,
      ),
    }
  }
  static async _isScreenshotCaptured(screenshotPath) {
    try {
      const stats = await promisified_functions_1.stat(screenshotPath)
      return stats.isFile()
    } catch (e) {
      return false
    }
  }
  _joinWithBaseScreenshotPath(path) {
    return path_1.join(this.baseScreenshotsPath, path)
  }
  _incrementFileIndexes(forError) {
    if (forError) this.pathPattern.data.errorFileIndex++
    else this.pathPattern.data.fileIndex++
  }
  _getCustomScreenshotPath(customPath) {
    const correctedCustomPath = correct_file_path_1.default(customPath)
    return this._joinWithBaseScreenshotPath(correctedCustomPath)
  }
  _getScreenshotPath(forError) {
    const path = this.pathPattern.getPath(forError)
    this._incrementFileIndexes(forError)
    return this._joinWithBaseScreenshotPath(path)
  }
  _getThumbnailPath(screenshotPath) {
    const imageName = path_1.basename(screenshotPath)
    const imageDir = path_1.dirname(screenshotPath)
    return path_1.join(imageDir, "thumbnails", imageName)
  }
  async _takeScreenshot(filePath, pageWidth, pageHeight) {
    await make_dir_1.default(path_1.dirname(filePath))
    await this.provider.takeScreenshot(
      this.browserId,
      filePath,
      pageWidth,
      pageHeight,
    )
  }
  async _capture(
    forError,
    { pageDimensions, cropDimensions, markSeed, customPath } = {},
  ) {
    if (!this.enabled) return null
    const screenshotPath = customPath
      ? this._getCustomScreenshotPath(customPath)
      : this._getScreenshotPath(forError)
    const thumbnailPath = this._getThumbnailPath(screenshotPath)
    if (async_queue_1.isInQueue(screenshotPath))
      this.warningLog.addWarning(
        warning_message_1.default.screenshotRewritingError,
        screenshotPath,
      )
    await async_queue_1.addToQueue(screenshotPath, async () => {
      const clientAreaDimensions = Capturer._getClientAreaDimensions(
        pageDimensions,
      )
      await this._takeScreenshot(
        screenshotPath,
        ...(clientAreaDimensions
          ? [clientAreaDimensions.width, clientAreaDimensions.height]
          : []),
      )
      if (!(await Capturer._isScreenshotCaptured(screenshotPath))) return
      try {
        console.time("readPng@capturer.js" + screenshotPath)
        const image = await promisified_functions_1.readPngFile(screenshotPath)
        console.timeEnd("readPng@capturer.js" + screenshotPath)
        console.time("cropDimensions@capturer.js" + screenshotPath)
        const croppedImage = await crop_1.cropScreenshot(image, {
          markSeed,
          clientAreaDimensions,
          path: screenshotPath,
          cropDimensions: Capturer._getCropDimensions(
            cropDimensions,
            pageDimensions,
          ),
        })
        console.timeEnd("cropDimensions@capturer.js" + screenshotPath)
        if (croppedImage) {
          console.time("writePng@capturer.js" + screenshotPath)
          await promisified_functions_1.writePng(screenshotPath, croppedImage)
          console.timeEnd("writePng@capturer.js" + screenshotPath)
        }
      } catch (err) {
        await promisified_functions_1.deleteFile(screenshotPath)
        throw err
      }
      console.time("generateThumbnail@capturer.js" + screenshotPath)
      await testcafe_browser_tools_1.generateThumbnail(
        screenshotPath,
        thumbnailPath,
      )
      console.timeEnd("generateThumbnail@capturer.js" + screenshotPath)
    })
    const screenshot = {
      screenshotPath,
      thumbnailPath,
      userAgent: escape_user_agent_1.default(
        this.pathPattern.data.parsedUserAgent,
      ),
      quarantineAttempt: this.pathPattern.data.quarantineAttempt,
      takenOnFail: forError,
    }
    this.testEntry.screenshots.push(screenshot)
    return screenshotPath
  }
  async captureAction(options) {
    return await this._capture(false, options)
  }
  async captureError(options) {
    return await this._capture(true, options)
  }
}
exports.default = Capturer
module.exports = exports.default
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FwdHVyZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc2NyZWVuc2hvdHMvY2FwdHVyZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSwrQkFBMkQ7QUFDM0QsbUVBQTJEO0FBQzNELGlDQUF3QztBQUN4Qyx3REFBK0I7QUFDL0Isc0RBQTZEO0FBQzdELHVGQUErRDtBQUMvRCxtRkFBeUQ7QUFDekQsbUZBQXlEO0FBQ3pELDBFQUF5RjtBQUd6RixNQUFxQixRQUFRO0lBQ3pCLFlBQWEsbUJBQW1CLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxXQUFXLEVBQUUsVUFBVTtRQUM1RSxJQUFJLENBQUMsT0FBTyxHQUFlLENBQUMsQ0FBQyxtQkFBbUIsQ0FBQztRQUNqRCxJQUFJLENBQUMsbUJBQW1CLEdBQUcsbUJBQW1CLENBQUM7UUFDL0MsSUFBSSxDQUFDLFNBQVMsR0FBYSxTQUFTLENBQUM7UUFDckMsSUFBSSxDQUFDLFFBQVEsR0FBYyxVQUFVLENBQUMsUUFBUSxDQUFDO1FBQy9DLElBQUksQ0FBQyxTQUFTLEdBQWEsVUFBVSxDQUFDLEVBQUUsQ0FBQztRQUN6QyxJQUFJLENBQUMsVUFBVSxHQUFZLFVBQVUsQ0FBQztRQUN0QyxJQUFJLENBQUMsV0FBVyxHQUFXLFdBQVcsQ0FBQztJQUMzQyxDQUFDO0lBRUQsTUFBTSxDQUFDLDZCQUE2QixDQUFFLGFBQWEsRUFBRSxpQkFBaUIsRUFBRSxhQUFhO1FBQ2pGLElBQUksYUFBYSxHQUFHLGFBQWE7WUFDN0IsT0FBTyxpQkFBaUIsQ0FBQztRQUU3QixJQUFJLGlCQUFpQixHQUFHLGFBQWE7WUFDakMsT0FBTyxhQUFhLENBQUM7UUFFekIsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLGlCQUFpQixFQUFFLGFBQWEsQ0FBQyxDQUFDO0lBQ3RELENBQUM7SUFFRCxNQUFNLENBQUMsa0JBQWtCLENBQUUsY0FBYyxFQUFFLGNBQWM7UUFDckQsSUFBSSxDQUFDLGNBQWMs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TyxNQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQzlDLENBQUM7Q0FDSjtBQTlKRCwyQkE4SkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBqb2luIGFzIGpvaW5QYXRoLCBkaXJuYW1lLCBiYXNlbmFtZSB9IGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgZ2VuZXJhdGVUaHVtYm5haWwgfSBmcm9tICd0ZXN0Y2FmZS1icm93c2VyLXRvb2xzJztcbmltcG9ydCB7IGNyb3BTY3JlZW5zaG90IH0gZnJvbSAnLi9jcm9wJztcbmltcG9ydCBtYWtlRGlyIGZyb20gJ21ha2UtZGlyJztcbmltcG9ydCB7IGlzSW5RdWV1ZSwgYWRkVG9RdWV1ZSB9IGZyb20gJy4uL3V0aWxzL2FzeW5jLXF1ZXVlJztcbmltcG9ydCBXQVJOSU5HX01FU1NBR0UgZnJvbSAnLi4vbm90aWZpY2F0aW9ucy93YXJuaW5nLW1lc3NhZ2UnO1xuaW1wb3J0IGVzY2FwZVVzZXJBZ2VudCBmcm9tICcuLi91dGlscy9lc2NhcGUtdXNlci1hZ2VudCc7XG5pbXBvcnQgY29ycmVjdEZpbGVQYXRoIGZyb20gJy4uL3V0aWxzL2NvcnJlY3QtZmlsZS1wYXRoJztcbmltcG9ydCB7IHJlYWRQbmdGaWxlLCBkZWxldGVGaWxlLCBzdGF0LCB3cml0ZVBuZyB9IGZyb20gJy4uL3V0aWxzL3Byb21pc2lmaWVkLWZ1bmN0aW9ucyc7XG5cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ2FwdHVyZXIge1xuICAgIGNvbnN0cnVjdG9yIChiYXNlU2NyZWVuc2hvdHNQYXRoLCB0ZXN0RW50cnksIGNvbm5lY3Rpb24sIHBhdGhQYXR0ZXJuLCB3YXJuaW5nTG9nKSB7XG4gICAgICAgIHRoaXMuZW5hYmxlZCAgICAgICAgICAgICA9ICEhYmFzZVNjcmVlbnNob3RzUGF0aDtcbiAgICAgICAgdGhpcy5iYXNlU2NyZWVuc2hvdHNQYXRoID0gYmFzZVNjcmVlbnNob3RzUGF0aDtcbiAgICAgICAgdGhpcy50ZXN0RW50cnkgICAgICAgICAgID0gdGVzdEVudHJ5O1xuICAgICAgICB0aGlzLnByb3ZpZGVyICAgICAgICAgICAgPSBjb25uZWN0aW9uLnByb3ZpZGVyO1xuICAgICAgICB0aGlzLmJyb3dzZXJJZCAgICAgICAgICAgPSBjb25uZWN0aW9uLmlkO1xuICAgICAgICB0aGlzLndhcm5pbmdMb2cgICAgICAgICAgPSB3YXJuaW5nTG9nO1xuICAgICAgICB0aGlzLnBhdGhQYXR0ZXJuICAgICAgICAgPSBwYXRoUGF0dGVybjtcbiAgICB9XG5cbiAgICBzdGF0aWMgX2dldERpbWVuc2lvbldpdGhvdXRTY3JvbGxiYXIgKGZ1bGxEaW1lbnNpb24sIGRvY3VtZW50RGltZW5zaW9uLCBib2R5RGltZW5zaW9uKSB7XG4gICAgICAgIGlmIChib2R5RGltZW5zaW9uID4gZnVsbERpbWVuc2lvbilcbiAgICAgICAgICAgIHJldHVybiBkb2N1bWVudERpbWVuc2lvbjtcblxuICAgICAgICBpZiAoZG9jdW1lbnREaW1lbnNpb24gPiBmdWxsRGltZW5zaW9uKVxuICAgICAgICAgICAgcmV0dXJuIGJvZHlEaW1lbnNpb247XG5cbiAgICAgICAgcmV0dXJuIE1hdGgubWF4KGRvY3VtZW50RGltZW5zaW9uLCBib2R5RGltZW5zaW9uKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgX2dldENyb3BEaW1lbnNpb25zIChjcm9wRGltZW5zaW9ucywgcGFnZURpbWVuc2lvbnMpIHtcbiAgICAgICAgaWYgKCFjcm9wRGltZW5zaW9ucyB8fCAhcGFnZURpbWVuc2lvbnMpXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcblxuICAgICAgICBjb25zdCB7IGRwciB9ICAgICAgICAgICAgICAgICAgICAgID0gcGFnZURpbWVuc2lvbnM7XG4gICAgICAgIGNvbnN0IHsgdG9wLCBsZWZ0LCBib3R0b20sIHJpZ2h0IH0gPSBjcm9wRGltZW5zaW9ucztcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdG9wOiAgICBNYXRoLnJvdW5kKHRvcCAqIGRwciksXG4gICAgICAgICAgICBsZWZ0OiAgIE1hdGgucm91bmQobGVmdCAqIGRwciksXG4gICAgICAgICAgICBib3R0b206IE1hdGgucm91bmQoYm90dG9tICogZHByKSxcbiAgICAgICAgICAgIHJpZ2h0OiAgTWF0aC5yb3VuZChyaWdodCAqIGRwcilcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBzdGF0aWMgX2dldENsaWVudEFyZWFEaW1lbnNpb25zIChwYWdlRGltZW5zaW9ucykge1xuICAgICAgICBpZiAoIXBhZ2VEaW1lbnNpb25zKVxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG5cbiAgICAgICAgY29uc3QgeyBpbm5lcldpZHRoLCBkb2N1bWVudFdpZHRoLCBib2R5V2lkdGgsIGlubmVySGVpZ2h0LCBkb2N1bWVudEhlaWdodCwgYm9keUhlaWdodCwgZHByIH0gPSBwYWdlRGltZW5zaW9ucztcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgd2lkdGg6ICBNYXRoLmZsb29yKENhcHR1cmVyLl9nZXREaW1lbnNpb25XaXRob3V0U2Nyb2xsYmFyKGlubmVyV2lkdGgsIGRvY3VtZW50V2lkdGgsIGJvZHlXaWR0aCkgKiBkcHIpLFxuICAgICAgICAgICAgaGVpZ2h0OiBNYXRoLmZsb29yKENhcHR1cmVyLl9nZXREaW1lbnNpb25XaXRob3V0U2Nyb2xsYmFyKGlubmVySGVpZ2h0LCBkb2N1bWVudEhlaWdodCwgYm9keUhlaWdodCkgKiBkcHIpXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgc3RhdGljIGFzeW5jIF9pc1NjcmVlbnNob3RDYXB0dXJlZCAoc2NyZWVuc2hvdFBhdGgpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHN0YXRzID0gYXdhaXQgc3RhdChzY3JlZW5zaG90UGF0aCk7XG5cbiAgICAgICAgICAgIHJldHVybiBzdGF0cy5pc0ZpbGUoKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgX2pvaW5XaXRoQmFzZVNjcmVlbnNob3RQYXRoIChwYXRoKSB7XG4gICAgICAgIHJldHVybiBqb2luUGF0aCh0aGlzLmJhc2VTY3JlZW5zaG90c1BhdGgsIHBhdGgpO1xuICAgIH1cblxuICAgIF9pbmNyZW1lbnRGaWxlSW5kZXhlcyAoZm9yRXJyb3IpIHtcbiAgICAgICAgaWYgKGZvckVycm9yKVxuICAgICAgICAgICAgdGhpcy5wYXRoUGF0dGVybi5kYXRhLmVycm9yRmlsZUluZGV4Kys7XG5cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdGhpcy5wYXRoUGF0dGVybi5kYXRhLmZpbGVJbmRleCsrO1xuICAgIH1cblxuICAgIF9nZXRDdXN0b21TY3JlZW5zaG90UGF0aCAoY3VzdG9tUGF0aCkge1xuICAgICAgICBjb25zdCBjb3JyZWN0ZWRDdXN0b21QYXRoID0gY29ycmVjdEZpbGVQYXRoKGN1c3RvbVBhdGgpO1xuXG4gICAgICAgIHJldHVybiB0aGlzLl9qb2luV2l0aEJhc2VTY3JlZW5zaG90UGF0aChjb3JyZWN0ZWRDdXN0b21QYXRoKTtcbiAgICB9XG5cbiAgICBfZ2V0U2NyZWVuc2hvdFBhdGggKGZvckVycm9yKSB7XG4gICAgICAgIGNvbnN0IHBhdGggPSB0aGlzLnBhdGhQYXR0ZXJuLmdldFBhdGgoZm9yRXJyb3IpO1xuXG4gICAgICAgIHRoaXMuX2luY3JlbWVudEZpbGVJbmRleGVzKGZvckVycm9yKTtcblxuICAgICAgICByZXR1cm4gdGhpcy5fam9pbldpdGhCYXNlU2NyZWVuc2hvdFBhdGgocGF0aCk7XG4gICAgfVxuXG4gICAgX2dldFRodW1ibmFpbFBhdGggKHNjcmVlbnNob3RQYXRoKSB7XG4gICAgICAgIGNvbnN0IGltYWdlTmFtZSA9IGJhc2VuYW1lKHNjcmVlbnNob3RQYXRoKTtcbiAgICAgICAgY29uc3QgaW1hZ2VEaXIgID0gZGlybmFtZShzY3JlZW5zaG90UGF0aCk7XG5cbiAgICAgICAgcmV0dXJuIGpvaW5QYXRoKGltYWdlRGlyLCAndGh1bWJuYWlscycsIGltYWdlTmFtZSk7XG4gICAgfVxuXG4gICAgYXN5bmMgX3Rha2VTY3JlZW5zaG90IChmaWxlUGF0aCwgcGFnZVdpZHRoLCBwYWdlSGVpZ2h0KSB7XG4gICAgICAgIGF3YWl0IG1ha2VEaXIoZGlybmFtZShmaWxlUGF0aCkpO1xuICAgICAgICBhd2FpdCB0aGlzLnByb3ZpZGVyLnRha2VTY3JlZW5zaG90KHRoaXMuYnJvd3NlcklkLCBmaWxlUGF0aCwgcGFnZVdpZHRoLCBwYWdlSGVpZ2h0KTtcbiAgICB9XG5cbiAgICBhc3luYyBfY2FwdHVyZSAoZm9yRXJyb3IsIHsgcGFnZURpbWVuc2lvbnMsIGNyb3BEaW1lbnNpb25zLCBtYXJrU2VlZCwgY3VzdG9tUGF0aCB9ID0ge30pIHtcbiAgICAgICAgaWYgKCF0aGlzLmVuYWJsZWQpXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcblxuICAgICAgICBjb25zdCBzY3JlZW5zaG90UGF0aCA9IGN1c3RvbVBhdGggPyB0aGlzLl9nZXRDdXN0b21TY3JlZW5zaG90UGF0aChjdXN0b21QYXRoKSA6IHRoaXMuX2dldFNjcmVlbnNob3RQYXRoKGZvckVycm9yKTtcbiAgICAgICAgY29uc3QgdGh1bWJuYWlsUGF0aCAgPSB0aGlzLl9nZXRUaHVtYm5haWxQYXRoKHNjcmVlbnNob3RQYXRoKTtcblxuICAgICAgICBpZiAoaXNJblF1ZXVlKHNjcmVlbnNob3RQYXRoKSlcbiAgICAgICAgICAgIHRoaXMud2FybmluZ0xvZy5hZGRXYXJuaW5nKFdBUk5JTkdfTUVTU0FHRS5zY3JlZW5zaG90UmV3cml0aW5nRXJyb3IsIHNjcmVlbnNob3RQYXRoKTtcblxuICAgICAgICBhd2FpdCBhZGRUb1F1ZXVlKHNjcmVlbnNob3RQYXRoLCBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBjbGllbnRBcmVhRGltZW5zaW9ucyA9IENhcHR1cmVyLl9nZXRDbGllbnRBcmVhRGltZW5zaW9ucyhwYWdlRGltZW5zaW9ucyk7XG5cbiAgICAgICAgICAgIGF3YWl0IHRoaXMuX3Rha2VTY3JlZW5zaG90KHNjcmVlbnNob3RQYXRoLCAuLi5jbGllbnRBcmVhRGltZW5zaW9ucyA/IFtjbGllbnRBcmVhRGltZW5zaW9ucy53aWR0aCwgY2xpZW50QXJlYURpbWVuc2lvbnMuaGVpZ2h0XSA6IFtdKTtcblxuICAgICAgICAgICAgaWYgKCFhd2FpdCBDYXB0dXJlci5faXNTY3JlZW5zaG90Q2FwdHVyZWQoc2NyZWVuc2hvdFBhdGgpKVxuICAgICAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBjb25zdCBpbWFnZSA9IGF3YWl0IHJlYWRQbmdGaWxlKHNjcmVlbnNob3RQYXRoKTtcblxuICAgICAgICAgICAgICAgIGNvbnN0IGNyb3BwZWRJbWFnZSA9IGF3YWl0IGNyb3BTY3JlZW5zaG90KGltYWdlLCB7XG4gICAgICAgICAgICAgICAgICAgIG1hcmtTZWVkLFxuICAgICAgICAgICAgICAgICAgICBjbGllbnRBcmVhRGltZW5zaW9ucyxcblxuICAgICAgICAgICAgICAgICAgICBwYXRoOiAgICAgICAgICAgc2NyZWVuc2hvdFBhdGgsXG4gICAgICAgICAgICAgICAgICAgIGNyb3BEaW1lbnNpb25zOiBDYXB0dXJlci5fZ2V0Q3JvcERpbWVuc2lvbnMoY3JvcERpbWVuc2lvbnMsIHBhZ2VEaW1lbnNpb25zKVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgaWYgKGNyb3BwZWRJbWFnZSlcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgd3JpdGVQbmcoc2NyZWVuc2hvdFBhdGgsIGNyb3BwZWRJbWFnZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgZGVsZXRlRmlsZShzY3JlZW5zaG90UGF0aCk7XG5cbiAgICAgICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGF3YWl0IGdlbmVyYXRlVGh1bWJuYWlsKHNjcmVlbnNob3RQYXRoLCB0aHVtYm5haWxQYXRoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3Qgc2NyZWVuc2hvdCA9IHtcbiAgICAgICAgICAgIHNjcmVlbnNob3RQYXRoLFxuICAgICAgICAgICAgdGh1bWJuYWlsUGF0aCxcbiAgICAgICAgICAgIHVzZXJBZ2VudDogICAgICAgICBlc2NhcGVVc2VyQWdlbnQodGhpcy5wYXRoUGF0dGVybi5kYXRhLnBhcnNlZFVzZXJBZ2VudCksXG4gICAgICAgICAgICBxdWFyYW50aW5lQXR0ZW1wdDogdGhpcy5wYXRoUGF0dGVybi5kYXRhLnF1YXJhbnRpbmVBdHRlbXB0LFxuICAgICAgICAgICAgdGFrZW5PbkZhaWw6ICAgICAgIGZvckVycm9yLFxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMudGVzdEVudHJ5LnNjcmVlbnNob3RzLnB1c2goc2NyZWVuc2hvdCk7XG5cbiAgICAgICAgcmV0dXJuIHNjcmVlbnNob3RQYXRoO1xuICAgIH1cblxuICAgIGFzeW5jIGNhcHR1cmVBY3Rpb24gKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuX2NhcHR1cmUoZmFsc2UsIG9wdGlvbnMpO1xuICAgIH1cblxuICAgIGFzeW5jIGNhcHR1cmVFcnJvciAob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5fY2FwdHVyZSh0cnVlLCBvcHRpb25zKTtcbiAgICB9XG59XG5cbiJdfQ==

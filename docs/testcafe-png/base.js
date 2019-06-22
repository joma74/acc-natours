"use strict"
var __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, "__esModule", { value: true })
const testcafe_browser_tools_1 = require("testcafe-browser-tools")
const get_maximized_headless_window_size_1 = __importDefault(
  require("../../utils/get-maximized-headless-window-size"),
)
const crop_1 = require("../../../../screenshots/crop")
const promisified_functions_1 = require("../../../../utils/promisified-functions")
exports.default = {
  openedBrowsers: {},
  isMultiBrowser: false,
  _getConfig() {
    throw new Error("Not implemented")
  },
  _getBrowserProtocolClient(/* runtimeInfo */) {
    throw new Error("Not implemented")
  },
  _getBrowserName() {
    return this.providerName.replace(":", "")
  },
  async isValidBrowserName(browserName) {
    const config = await this._getConfig(browserName)
    const browserInfo = await testcafe_browser_tools_1.getBrowserInfo(
      config.path || this._getBrowserName(),
    )
    return !!browserInfo
  },
  async isLocalBrowser() {
    return true
  },
  isHeadlessBrowser(browserId) {
    return this.openedBrowsers[browserId].config.headless
  },
  _getCropDimensions(viewportWidth, viewportHeight) {
    if (!viewportWidth || !viewportHeight) return null
    return {
      left: 0,
      top: 0,
      right: viewportWidth,
      bottom: viewportHeight,
    }
  },
  async takeScreenshot(browserId, path, viewportWidth, viewportHeight) {
    const runtimeInfo = this.openedBrowsers[browserId]
    const browserClient = this._getBrowserProtocolClient(runtimeInfo)
    console.time("getScreenshotData@base.js" + path)
    const binaryImage = await browserClient.getScreenshotData(runtimeInfo)
    console.timeEnd("getScreenshotData@base.js" + path)
    console.time("readPng@base.js" + path)
    const pngImage = await promisified_functions_1.readPng(binaryImage)
    console.timeEnd("readPng@base.js" + path)
    console.time("cropDimensions@base.js" + path)
    const cropDimensions = this._getCropDimensions(
      viewportWidth,
      viewportHeight,
    )
    const croppedImage = await crop_1.cropScreenshot(pngImage, {
      path,
      cropDimensions,
    })
    console.timeEnd("cropDimensions@base.js" + path)
    console.time("writePng@base.js" + path)
    await promisified_functions_1.writePng(path, croppedImage || pngImage)
    console.timeEnd("writePng@base.js" + path)
  },
  async maximizeWindow(browserId) {
    const maximumSize = get_maximized_headless_window_size_1.default()
    await this.resizeWindow(
      browserId,
      maximumSize.width,
      maximumSize.height,
      maximumSize.width,
      maximumSize.height,
    )
  },
}
module.exports = exports.default
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9icm93c2VyL3Byb3ZpZGVyL2J1aWx0LWluL2RlZGljYXRlZC9iYXNlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsbUVBQXdEO0FBQ3hELHdIQUE0RjtBQUM1Rix1REFBOEQ7QUFDOUQsbUZBQTRFO0FBRTVFLGtCQUFlO0lBQ1gsY0FBYyxFQUFFLEVBQUU7SUFFbEIsY0FBYyxFQUFFLEtBQUs7SUFFckIsVUFBVTtRQUNOLE1BQU0sSUFBSSxLQUFLLENBQUMsaUJBQWlCLENBQUMsQ0FBQztJQUN2QyxDQUFDO0lBRUQseUJBQXlCLEVBQUUsaUJBQWlCO1FBQ3hDLE1BQU0sSUFBSSxLQUFLLENBQUMsaUJBQWlCLENBQUMsQ0FBQztJQUN2QyxDQUFDO0lBRUQsZUFBZTtRQUNYLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQzlDLENBQUM7SUFFRCxLQUFLLENBQUMsa0JBQWtCLENBQUUsV0FBVztRQUNqQyxNQUFNLE1BQU0sR0FBUSxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDdkQsTUFBTSxXQUFXLEdBQUcsTUFBTSx1Q0FBYyxDQUFDLE1BQU0sQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDLENBQUM7UUFFaEYsT0FBTyxDQUFDLENBQUMsV0FBVyxDQUFDO0lBQ3pCLENBQUM7SUFFRCxLQUFLLENBQUMsY0FBYztRQUNoQixPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRUQsaUJBQWlCLENBQUUsU0FBUztRQUN4QixPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQztJQUMxRCxDQUFDO0lBRUQsa0JBQWtCLENBQUUsYUFBYSxFQUFFLGNBQWM7UUFDN0MsSUFBSSxDQUFDLGFBQWEsSUFBSSxDQUFDLGNBQWM7WUFDakMsT0FBTyxJQUFJLENBQUM7UUFFaEIsT0FBTztZQUNILElBQUksRUFBSSxDQUFDO1lBQ1QsR0FBRyxFQUFLLENBQUM7WUFDVCxLQUFLLEVBQUcsYUFBYTtZQUNyQixNQUFNLEVBQUUsY0FBYztTQUN6QixDQUFDO0lBQ04sQ0FBQztJQUVELEtBQUssQ0FBQyxjQUFjLENBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxhQUFhLEVBQUUsY0FBYztRQUNoRSxNQUFNLFdBQVcsR0FBTSxJQUFJLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3RELE1BQU0sYUFBYSxHQUFJLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUNuRSxNQUFNLFdBQVcsR0FBTSxNQUFNLGFBQWEsQ0FBQyxpQkFBaUIsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUMxRSxNQUFNLFFBQVEsR0FBUyxNQUFNLCtCQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDbEQsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLGFBQWEsRUFBRSxjQUFjLENBQUMsQ0FBQztRQUM5RSxNQUFNLFlBQVksR0FBSyxNQUFNLHFCQUFjLENBQUMsUUFBUSxFQUFFLEVBQUUsSUFBSSxFQUFFLGNBQWMsRUFBRSxDQUFDLENBQUM7UUFFaEYsTUFBTSxnQ0FBUSxDQUFDLElBQUksRUFBRSxZQUFZLElBQUksUUFBUSxDQUFDLENBQUM7SUFDbkQsQ0FBQztJQUVELEtBQUssQ0FBQyxjQUFjLENBQUUsU0FBUztRQUMzQixNQUFNLFdBQVcsR0FBRyw0Q0FBOEIsRUFBRSxDQUFDO1FBRXJELE1BQU0sSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxXQUFXLENBQUMsTUFBTSxFQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3JILENBQUM7Q0FDSixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZ2V0QnJvd3NlckluZm8gfSBmcm9tICd0ZXN0Y2FmZS1icm93c2VyLXRvb2xzJztcbmltcG9ydCBnZXRNYXhpbWl6ZWRIZWFkbGVzc1dpbmRvd1NpemUgZnJvbSAnLi4vLi4vdXRpbHMvZ2V0LW1heGltaXplZC1oZWFkbGVzcy13aW5kb3ctc2l6ZSc7XG5pbXBvcnQgeyBjcm9wU2NyZWVuc2hvdCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjcmVlbnNob3RzL2Nyb3AnO1xuaW1wb3J0IHsgcmVhZFBuZywgd3JpdGVQbmcgfSBmcm9tICcuLi8uLi8uLi8uLi91dGlscy9wcm9taXNpZmllZC1mdW5jdGlvbnMnO1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gICAgb3BlbmVkQnJvd3NlcnM6IHt9LFxuXG4gICAgaXNNdWx0aUJyb3dzZXI6IGZhbHNlLFxuXG4gICAgX2dldENvbmZpZyAoKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignTm90IGltcGxlbWVudGVkJyk7XG4gICAgfSxcblxuICAgIF9nZXRCcm93c2VyUHJvdG9jb2xDbGllbnQgKC8qIHJ1bnRpbWVJbmZvICovKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignTm90IGltcGxlbWVudGVkJyk7XG4gICAgfSxcblxuICAgIF9nZXRCcm93c2VyTmFtZSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByb3ZpZGVyTmFtZS5yZXBsYWNlKCc6JywgJycpO1xuICAgIH0sXG5cbiAgICBhc3luYyBpc1ZhbGlkQnJvd3Nlck5hbWUgKGJyb3dzZXJOYW1lKSB7XG4gICAgICAgIGNvbnN0IGNvbmZpZyAgICAgID0gYXdhaXQgdGhpcy5fZ2V0Q29uZmlnKGJyb3dzZXJOYW1lKTtcbiAgICAgICAgY29uc3QgYnJvd3NlckluZm8gPSBhd2FpdCBnZXRCcm93c2VySW5mbyhjb25maWcucGF0aCB8fCB0aGlzLl9nZXRCcm93c2VyTmFtZSgpKTtcblxuICAgICAgICByZXR1cm4gISFicm93c2VySW5mbztcbiAgICB9LFxuXG4gICAgYXN5bmMgaXNMb2NhbEJyb3dzZXIgKCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9LFxuXG4gICAgaXNIZWFkbGVzc0Jyb3dzZXIgKGJyb3dzZXJJZCkge1xuICAgICAgICByZXR1cm4gdGhpcy5vcGVuZWRCcm93c2Vyc1ticm93c2VySWRdLmNvbmZpZy5oZWFkbGVzcztcbiAgICB9LFxuXG4gICAgX2dldENyb3BEaW1lbnNpb25zICh2aWV3cG9ydFdpZHRoLCB2aWV3cG9ydEhlaWdodCkge1xuICAgICAgICBpZiAoIXZpZXdwb3J0V2lkdGggfHwgIXZpZXdwb3J0SGVpZ2h0KVxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGxlZnQ6ICAgMCxcbiAgICAgICAgICAgIHRvcDogICAgMCxcbiAgICAgICAgICAgIHJpZ2h0OiAgdmlld3BvcnRXaWR0aCxcbiAgICAgICAgICAgIGJvdHRvbTogdmlld3BvcnRIZWlnaHRcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgYXN5bmMgdGFrZVNjcmVlbnNob3QgKGJyb3dzZXJJZCwgcGF0aCwgdmlld3BvcnRXaWR0aCwgdmlld3BvcnRIZWlnaHQpIHtcbiAgICAgICAgY29uc3QgcnVudGltZUluZm8gICAgPSB0aGlzLm9wZW5lZEJyb3dzZXJzW2Jyb3dzZXJJZF07XG4gICAgICAgIGNvbnN0IGJyb3dzZXJDbGllbnQgID0gdGhpcy5fZ2V0QnJvd3NlclByb3RvY29sQ2xpZW50KHJ1bnRpbWVJbmZvKTtcbiAgICAgICAgY29uc3QgYmluYXJ5SW1hZ2UgICAgPSBhd2FpdCBicm93c2VyQ2xpZW50LmdldFNjcmVlbnNob3REYXRhKHJ1bnRpbWVJbmZvKTtcbiAgICAgICAgY29uc3QgcG5nSW1hZ2UgICAgICAgPSBhd2FpdCByZWFkUG5nKGJpbmFyeUltYWdlKTtcbiAgICAgICAgY29uc3QgY3JvcERpbWVuc2lvbnMgPSB0aGlzLl9nZXRDcm9wRGltZW5zaW9ucyh2aWV3cG9ydFdpZHRoLCB2aWV3cG9ydEhlaWdodCk7XG4gICAgICAgIGNvbnN0IGNyb3BwZWRJbWFnZSAgID0gYXdhaXQgY3JvcFNjcmVlbnNob3QocG5nSW1hZ2UsIHsgcGF0aCwgY3JvcERpbWVuc2lvbnMgfSk7XG5cbiAgICAgICAgYXdhaXQgd3JpdGVQbmcocGF0aCwgY3JvcHBlZEltYWdlIHx8IHBuZ0ltYWdlKTtcbiAgICB9LFxuXG4gICAgYXN5bmMgbWF4aW1pemVXaW5kb3cgKGJyb3dzZXJJZCkge1xuICAgICAgICBjb25zdCBtYXhpbXVtU2l6ZSA9IGdldE1heGltaXplZEhlYWRsZXNzV2luZG93U2l6ZSgpO1xuXG4gICAgICAgIGF3YWl0IHRoaXMucmVzaXplV2luZG93KGJyb3dzZXJJZCwgbWF4aW11bVNpemUud2lkdGgsIG1heGltdW1TaXplLmhlaWdodCwgbWF4aW11bVNpemUud2lkdGgsIG1heGltdW1TaXplLmhlaWdodCk7XG4gICAgfVxufTtcbiJdfQ==

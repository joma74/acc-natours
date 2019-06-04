import * as TESTCAFE from "testcafe"

interface TestRun {
  readonly opts: TestOpts
  readonly test: TestProps
  readonly browserConnection: TestConnection
}

interface TestOpts {
  readonly screenshotPath: string
  readonly screenshotPathPattern: string
  readonly browserInfo: any
}

interface TestProps {
  readonly name: string
  readonly fixture: FixtureProps
}

interface TestConnection {
  readonly browserInfo: TestInfo
  public isHeadlessBrowser(): boolean
}

interface TestInfo {
  /** chrome */
  readonly providerName: string
  /** chrome:headless:emulation:scaleFactor=2 */
  readonly alias: string
}

interface FixtureProps {
  readonly name: string
}

declare global {
  interface TestController {
    testRun: TestRun
  }
}

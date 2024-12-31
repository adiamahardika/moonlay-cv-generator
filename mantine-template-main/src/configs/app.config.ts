import {LayoutTypes} from "@/@types/layout";

export type AppConfig = {
  apiPrefix: string
  authenticatedEntryPath: string
  unAuthenticatedEntryPath: string
  enableMock: boolean
  locale: string
  layoutType: LayoutTypes,
}

const appConfig: AppConfig = {
  layoutType: LayoutTypes.CollapsedSideBar,
  apiPrefix: '',
  authenticatedEntryPath: '/applicantdata',
  unAuthenticatedEntryPath: '/sign-in',
  enableMock: false,
  locale: 'en',
}

export default appConfig

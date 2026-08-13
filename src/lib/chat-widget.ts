export function shouldShowFloatingChatOnMobile(pathname: string) {
  return !pathname.startsWith("/artwork/")
}

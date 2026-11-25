/**
 * dsh-footer-buttons — Host half.
 *
 * 这个插件的全部行为都在浏览器半侧（client.js）：它是一段针对
 * sidebar.footer.action 槽位的 CSS 布局 + 一个「更多」管理面板，
 * 不涉及任何服务端状态或 HTTP 路由。
 *
 * 因此 Host 半侧保持为空：bundle 需要一个可 import 的入口，
 * 这里只导出插件名，不注册任何 Service/Event/路由。
 */

export const name = 'dsh-footer-buttons'

export function apply() {}

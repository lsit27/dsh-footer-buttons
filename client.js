/**
 * dsh-footer-buttons — Client half.
 *
 * 一个自包含的「侧栏底部按钮管理器」：
 *   · 用一段 CSS 把所有注入 sidebar.footer.action 的插件按钮统一成
 *     竖排、左对齐、宽度自适应的布局，并拉齐高度；
 *   · 在同一槽位末尾放一个「更多」入口，面板列出当前所有按钮，
 *     点击即可隐藏某个按钮，隐藏后可在「更多」里恢复；
 *   · 隐藏状态存 localStorage，刷新页面后保持。
 *
 * 它不依赖、也不需要修改任何其它插件：读取的是同槽位已经渲染出来的按钮，
 * 只设置它们的 style.display（不移动 DOM 节点），因此对 React 渲染是安全的。
 */
window.__ModuleLoader__.load({
  id: 'dsh-footer-buttons',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const STYLE_ID = 'dsh-footer-buttons-style'
    const LS_KEY = 'dsh.footer.buttons.hidden.v1'
    const SLOT = 'sidebar.footer.action'

    const CSS = `
/* ── 统一布局：竖排、左对齐、宽度自适应 ───────────────────────────────────── */
div:has(> [data-slot='sidebar.footer.action']){
  flex-direction:column;flex-wrap:nowrap;align-items:flex-start;gap:4px;padding:4px 6px
}
[data-slot='sidebar.footer.action'] button:not(.dfb-more-btn){
  box-sizing:border-box;height:30px;min-height:30px;max-width:100%;
  font-family:inherit;font-size:12px;line-height:1;white-space:nowrap;
  justify-content:flex-start;text-align:left
}
/* ── 更多入口 ─────────────────────────────────────────────────────────────── */
.dfb-more{position:relative;align-self:flex-start}
.dfb-more-btn{
  box-sizing:border-box;height:26px;padding:0 9px;border:1px solid var(--dsw-alias-border-l1);
  border-radius:6px;background:transparent;color:var(--dsw-alias-label-secondary);
  font-family:inherit;font-size:11px;line-height:1;cursor:pointer;white-space:nowrap
}
.dfb-more-btn:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.dfb-panel{
  position:absolute;bottom:calc(100% + 4px);left:0;z-index:60;min-width:180px;max-width:240px;
  padding:5px;border-radius:9px;border:1px solid var(--dsw-alias-border-l1);
  background:var(--dsw-alias-bg-layer-2,var(--dsw-alias-bg-overlay,#202024));
  box-shadow:var(--dsw-elevation-prominent,0 8px 24px rgba(0,0,0,.3));
  color:var(--dsw-alias-label-primary)
}
.dfb-panel-title{padding:3px 8px 6px;font-size:11px;color:var(--dsw-alias-label-secondary)}
.dfb-empty{padding:8px;font-size:12px;color:var(--dsw-alias-label-secondary)}
.dfb-more .dfb-panel button{
  display:flex;align-items:center;justify-content:space-between;gap:10px;
  width:100%;height:28px;min-height:28px;padding:0 8px;border:none;border-radius:6px;
  background:transparent;color:inherit;font-family:inherit;font-size:12px;line-height:1;
  cursor:pointer;text-align:left
}
.dfb-more .dfb-panel button:hover{background:var(--dsw-alias-interactive-bg-hover)}
.dfb-item-hint{flex:none;font-size:10px;color:var(--dsw-alias-label-secondary)}
`.trim()

    function loadHidden() {
      try {
        const v = JSON.parse(window.localStorage.getItem(LS_KEY) || '{}')
        return v && typeof v === 'object' ? v : {}
      } catch {
        return {}
      }
    }

    function saveHidden(value) {
      try { window.localStorage.setItem(LS_KEY, JSON.stringify(value)) } catch {}
    }

    /** 按钮的可读标识：优先 aria-label / title，其次可见文字。 */
    function labelOf(button) {
      return String(
        button.getAttribute('aria-label')
        || button.getAttribute('title')
        || button.textContent
        || ''
      ).trim()
    }

    /** 读取当前槽位里所有可管理的按钮（排除本插件自己的更多入口）。 */
    function collectButtons() {
      const slot = document.querySelector('[data-slot="' + SLOT + '"]')
      if (slot === null) return []
      const seen = new Set()
      const out = []
      for (const button of slot.querySelectorAll('button')) {
        if (button.closest('.dfb-more') !== null) continue
        const label = labelOf(button)
        if (label === '' || seen.has(label)) continue
        seen.add(label)
        out.push({ key: label, label })
      }
      return out
    }

    function FooterManager() {
      const [open, setOpen] = React.useState(false)
      const [items, setItems] = React.useState([])
      const [hidden, setHidden] = React.useState(loadHidden)
      const wrapRef = React.useRef(null)

      // 面板打开时重新读取按钮列表（按钮可能来自其它插件，延迟挂载）。
      React.useEffect(() => {
        if (!open) return
        setItems(collectButtons())
      }, [open])

      // 把隐藏状态应用到当前 DOM。只改 style.display，不动节点结构。
      React.useEffect(() => {
        const slot = document.querySelector('[data-slot="' + SLOT + '"]')
        if (slot === null) return
        for (const button of slot.querySelectorAll('button')) {
          if (button.closest('.dfb-more') !== null) continue
          const label = labelOf(button)
          if (label === '') continue
          button.style.display = hidden[label] ? 'none' : ''
        }
      }, [hidden, open])

      // 点击面板外部关闭。
      React.useEffect(() => {
        if (!open) return undefined
        const onDoc = (event) => {
          if (wrapRef.current !== null && !wrapRef.current.contains(event.target)) setOpen(false)
        }
        document.addEventListener('click', onDoc)
        return () => document.removeEventListener('click', onDoc)
      }, [open])

      const toggle = (key) => setHidden((prev) => {
        const next = Object.assign({}, prev, { [key]: !prev[key] })
        saveHidden(next)
        return next
      })

      const hiddenCount = Object.values(hidden).filter(Boolean).length

      return h(
        'div',
        { className: 'dfb-more', ref: wrapRef },
        h(
          'button',
          {
            type: 'button',
            className: 'dfb-more-btn',
            'aria-label': '管理侧栏底部按钮',
            onClick: (event) => { event.stopPropagation(); setOpen((value) => !value) },
          },
          '更多' + (hiddenCount > 0 ? ' (' + hiddenCount + ')' : ''),
        ),
        open
          ? h(
            'div',
            { className: 'dfb-panel' },
            h('div', { className: 'dfb-panel-title' }, '侧栏按钮'),
            items.length === 0
              ? h('div', { className: 'dfb-empty' }, '暂无可管理的按钮')
              : items.map((item) => h(
                'button',
                {
                  type: 'button',
                  key: item.key,
                  className: 'dfb-item',
                  onClick: (event) => { event.stopPropagation(); toggle(item.key) },
                },
                h('span', null, item.label),
                h('span', { className: 'dfb-item-hint' }, hidden[item.key] ? '显示' : '隐藏'),
              )),
          )
          : null,
      )
    }

    return {
      inject: ['slots'],
      apply(ctx) {
        ctx.effect(() => {
          if (typeof document === 'undefined') return () => {}
          if (document.getElementById(STYLE_ID) !== null) return () => {}
          const tag = document.createElement('style')
          tag.id = STYLE_ID
          tag.textContent = CSS
          document.head.appendChild(tag)
          return () => { tag.remove() }
        }, 'dsh-footer-buttons-style')

        ctx.slots.inject(SLOT, () => ctx.slots.register(
          { name: SLOT, id: 'dsh-footer-buttons', order: 9999, label: '管理侧栏按钮' },
          FooterManager,
        ))
      },
    }
  },
})

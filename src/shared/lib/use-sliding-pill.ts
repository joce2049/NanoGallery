"use client"

import * as React from 'react'

// 组件参与 SSR 时，服务端调用 useLayoutEffect 会告警；只有浏览器端需要在布局期测量。
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect

/**
 * 滑动药丸（transitions.dev · tabs sliding）的测量逻辑，由 Tabs 与 SegmentedControl 共用。
 *
 * JS 只负责量激活项的盒子并写到药丸上，补间归 `.t-tabs-pill` 的 CSS。用实际盒子而不是
 * 固定的 top/height，容器换内衬或换尺寸都不必重算。
 *
 * 量到位后给容器挂 `t-tabs-ready`，撤掉激活项自身的 SSR 兜底底色，交棒给药丸。
 *
 * @param activeSelector 在容器内定位「当前激活项」的 CSS 选择器
 */
export function useSlidingPill<
  TContainer extends HTMLElement,
  TPill extends HTMLElement,
>(activeSelector: string) {
  const containerRef = React.useRef<TContainer>(null)
  const pillRef = React.useRef<TPill>(null)

  useIsomorphicLayoutEffect(() => {
    const container = containerRef.current
    const pill = pillRef.current
    if (!container || !pill) return

    const move = (animate: boolean) => {
      const active = container.querySelector<HTMLElement>(activeSelector)
      if (!active) return

      if (!animate) pill.classList.add('is-static')
      pill.style.width = `${active.offsetWidth}px`
      pill.style.height = `${active.offsetHeight}px`
      pill.style.transform = `translate(${active.offsetLeft}px, ${active.offsetTop}px)`
      if (!animate) {
        void pill.offsetWidth // 强制回流，让下一次移动重新走补间
        pill.classList.remove('is-static')
      }
      container.classList.add('t-tabs-ready')
    }

    // 激活项切换：Radix 翻 data-state、SegmentedControl 翻 data-active，据此重新定位
    const stateObserver = new MutationObserver(() => move(true))
    stateObserver.observe(container, {
      attributes: true,
      attributeFilter: ['data-state', 'data-active'],
      subtree: true,
    })

    // 尺寸变化（断点切换、字体加载）直接吸附，不做补间
    const sizeObserver = new ResizeObserver(() => move(false))
    sizeObserver.observe(container)

    return () => {
      stateObserver.disconnect()
      sizeObserver.disconnect()
    }
  }, [activeSelector])

  return { containerRef, pillRef }
}

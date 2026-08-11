/**
 * 动效相关的通用工具。数值一律取 src/app/globals.css 里的动效令牌，此处只做编排。
 */

/**
 * 重放一次性 CSS 动画。
 *
 * 同一个错误连续触发两次时，元素的类名没有变化，浏览器不会重跑关键帧。必须先摘掉
 * 类、强制一次回流让样式落定，再挂回去，动画才会从 0 重新开始。
 */
export function replayAnimation(el: HTMLElement | null | undefined, className: string) {
    if (!el) return
    el.classList.remove(className)
    void el.offsetWidth
    el.classList.add(className)
}

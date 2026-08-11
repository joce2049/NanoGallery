"use client"

import * as React from 'react'
import { Check } from 'lucide-react'

import { cn } from '@/shared/lib/utils'

/**
 * 成功打勾（transitions.dev · success check）。
 *
 * 淡入 + 转正 + 去模糊 + Y 轴回弹落位四条动画并行，同时描出对勾路径（延迟一个
 * --duration-micro 起笔）。配方只覆盖「出现」，隐藏交给调用方卸载组件即可。
 *
 * 每次挂载都从 out 起跳并强制回流，保证重复触发时关键帧从 0 重跑。
 */
export function SuccessCheck({ className }: { className?: string }) {
  const ref = React.useRef<HTMLSpanElement>(null)

  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    el.setAttribute('data-state', 'out')
    void el.offsetWidth
    el.setAttribute('data-state', 'in')
  }, [])

  return (
    <span
      ref={ref}
      data-state="out"
      aria-hidden="true"
      className={cn('t-success-check t-success-check-inline size-4', className)}
    >
      <Check className="size-full" />
    </span>
  )
}

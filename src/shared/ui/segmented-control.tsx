"use client"

import * as React from 'react'

import { cn } from '@/shared/lib/utils'
import { useSlidingPill } from '@/shared/lib/use-sliding-pill'

export interface SegmentedControlOption<T extends string> {
  value: T
  label: React.ReactNode
}

interface SegmentedControlProps<T extends string> {
  value: T
  onValueChange: (value: T) => void
  options: readonly SegmentedControlOption<T>[]
  /** 无障碍分组名，例如「排序方式」 */
  label: string
  className?: string
}

/**
 * 分段控件（transitions.dev · tabs sliding，见 skills/transitions-dev/16-tabs-sliding.md）。
 *
 * 一小组互斥选项 + 跟随激活项滑动的药丸 —— 排序切换、视图切换、筛选段都用它。
 * 几何照搬配方：容器 / 段 / 药丸全部全圆（配方 `border-radius: 48px`），段间 `gap: 3px`、
 * 容器内衬 `3px`、段高 `30px`、段内衬 `4px 12px`、段无边框、**全程无 box-shadow**；
 * 未选中段 hover 提亮到激活色。
 * 配方里的 6 个颜色变量按 CLAUDE.md 要求换成语义令牌：
 * `--tabs-bar-bg`→`bg-muted`、`--tabs-text-muted`→`text-muted-foreground`、
 * `--tabs-text-active`→`text-foreground`、`--tabs-dur`→`--duration-fast`、
 * `--tabs-ease`→`--ease-smooth-out`。
 *
 * 药丸底色（`--tabs-pill-bg`）要分主题给：配方两套变量里**药丸恒比条底亮一档**
 * （亮色 #f1f1f1 条 → #ffffff 药丸；暗色 #202020 条 → #454545 药丸）。亮色用
 * `bg-background`(#fff) 正好对上；暗色不能继续用 `bg-background`（≈#242424，比
 * `bg-muted` 条底还暗，药丸会像凹下去的洞），故叠一层 `dark:bg-white/12` 提亮，
 * 与项目里 Toast `dark:border-white/12` 的提亮惯例一致。
 *
 * 与 shadcn `Tabs` 的区别：这里的选项不控制任何 tabpanel，所以**不能**用配方示例里的
 * tablist 语义（会出现指向空面板的 aria-controls）；改用 `role="group"` + `aria-pressed`
 * 的一组切换按钮，Tab 键即可逐个到达，无需自行实现 roving focus。
 *
 * 药丸就位前，激活段自带底色作为 SSR 兜底（配方是纯 CSS demo，没有这个问题）；
 * `useSlidingPill` 量好位置后给容器挂 `t-tabs-ready` 撤掉它，避免药丸与底色叠成两层。
 */
export function SegmentedControl<T extends string>({
  value,
  onValueChange,
  options,
  label,
  className,
}: SegmentedControlProps<T>) {
  const { containerRef, pillRef } = useSlidingPill<HTMLDivElement, HTMLSpanElement>(
    '[data-slot="segment"][data-active="true"]',
  )

  return (
    <div
      ref={containerRef}
      role="group"
      aria-label={label}
      className={cn(
        'bg-muted relative inline-flex w-fit items-center gap-[3px] rounded-full p-[3px]',
        className,
      )}
    >
      <span
        ref={pillRef}
        aria-hidden="true"
        className="t-tabs-pill bg-background dark:bg-white/12 rounded-full"
      />
      {options.map(option => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            data-slot="segment"
            data-active={active}
            aria-pressed={active}
            onClick={() => onValueChange(option.value)}
            className={cn(
              'text-muted-foreground hover:text-foreground data-[active=true]:text-foreground relative z-10 inline-flex h-[30px] cursor-pointer items-center justify-center rounded-full px-3 py-1 text-sm font-medium whitespace-nowrap transition-colors duration-[var(--duration-fast)] ease-[var(--ease-smooth-out)]',
              'focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none',
              active && 'bg-background dark:bg-white/12',
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

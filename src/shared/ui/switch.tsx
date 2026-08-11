'use client'

import * as React from 'react'
import * as SwitchPrimitive from '@radix-ui/react-switch'

import { cn } from '@/shared/lib/utils'

function Switch({
  className,
  onCheckedChange,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  // .is-init 只在首次拨动后挂上，否则整页开关会在挂载时集体播一遍回弹
  const [interacted, setInteracted] = React.useState(false)

  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        't-toggle peer data-[state=checked]:bg-primary data-[state=unchecked]:bg-input focus-visible:border-ring focus-visible:ring-ring/50 dark:data-[state=unchecked]:bg-input/80 inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent shadow-xs transition-colors duration-[var(--duration-quick)] ease-[var(--ease-smooth-out)] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
        interacted && 'is-init',
        className,
      )}
      onCheckedChange={checked => {
        setInteracted(true)
        onCheckedChange?.(checked)
      }}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={
          't-toggle-thumb bg-background dark:data-[state=unchecked]:bg-foreground dark:data-[state=checked]:bg-primary-foreground pointer-events-none block size-4 rounded-full ring-0'
        }
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }

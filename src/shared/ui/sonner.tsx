'use client'

import { useTheme } from 'next-themes'
import { Toaster as Sonner, ToasterProps } from 'sonner'

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'border border-white/35 bg-white/78 text-slate-900 shadow-2xl shadow-slate-900/10 backdrop-blur-2xl dark:border-white/12 dark:bg-zinc-950/78 dark:text-zinc-50',
          title: 'text-sm font-semibold tracking-normal',
          description: 'text-xs text-slate-600 dark:text-zinc-300',
          success:
            'border-emerald-200/70 text-emerald-500 dark:border-emerald-300/20 dark:text-emerald-300 [&_[data-title]]:text-emerald-500 dark:[&_[data-title]]:text-emerald-300 [&_[data-icon]]:text-emerald-400 [&_svg]:text-emerald-400',
          error: 'border-red-200/80 dark:border-red-300/20',
          warning: 'border-amber-200/80 dark:border-amber-300/20',
          info: 'border-slate-200/80 dark:border-white/12',
          closeButton:
            'border-white/40 bg-white/70 text-slate-500 backdrop-blur-md hover:bg-white hover:text-slate-900 dark:border-white/10 dark:bg-white/10 dark:text-zinc-300 dark:hover:bg-white/20 dark:hover:text-white',
        },
      }}
      style={
        {
          '--normal-bg': 'color-mix(in srgb, var(--background) 78%, transparent)',
          '--normal-text': 'var(--foreground)',
          '--normal-border': 'color-mix(in srgb, var(--border) 70%, transparent)',
          '--success-bg': 'color-mix(in srgb, var(--background) 78%, transparent)',
          '--success-text': '#34d399',
          '--success-border': 'color-mix(in srgb, #a7f3d0 80%, transparent)',
          '--error-bg': 'color-mix(in srgb, var(--background) 78%, transparent)',
          '--error-text': 'var(--foreground)',
          '--error-border': 'color-mix(in srgb, #fecaca 80%, transparent)',
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }

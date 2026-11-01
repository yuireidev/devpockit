'use client'

import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut'
import { Coffee, CodeXml, Keyboard, Lightbulb } from 'lucide-react'
import Link from 'next/link'

function KeyboardShortcutsPanel() {
  const paletteShortcut = useKeyboardShortcut()
  const openPalette = paletteShortcut ?? '⌘K / Ctrl+K'
  const sidebarShortcut = useKeyboardShortcut('sidebar')
  const toggleSidebarLabel = sidebarShortcut ?? '⌘B / Ctrl+B'

  return (
    <div className="border-border bg-muted/30 mt-10 w-full max-w-[560px] rounded-lg border p-5">
      <div className="text-foreground mb-4 flex items-center gap-2 font-semibold">
        <Keyboard className="h-5 w-5 shrink-0" aria-hidden />
        Keyboard shortcuts
      </div>
      <dl className="grid gap-3 text-sm">
        <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
          <dt className="text-muted-foreground">Open command palette</dt>
          <dd className="text-foreground font-mono">{openPalette}</dd>
        </div>
        <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
          <dt className="text-muted-foreground">Close palette</dt>
          <dd className="text-foreground font-mono">Esc</dd>
        </div>
        <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
          <dt className="text-muted-foreground">Back to welcome (with a tool open)</dt>
          <dd className="text-foreground font-mono">Esc</dd>
        </div>
        <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
          <dt className="text-muted-foreground">Navigate palette results</dt>
          <dd className="text-foreground font-mono">↑ ↓ Enter</dd>
        </div>
        <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
          <dt className="text-muted-foreground">Toggle sidebar</dt>
          <dd className="text-foreground font-mono">{toggleSidebarLabel}</dd>
        </div>
      </dl>
    </div>
  )
}

export function AboutPage() {
  return (
    <div className="flex h-full flex-col">
      {/* Header Section */}
      <div className="bg-background px-[64px] pt-[36px] pb-[20px]">
        <h1 className="mb-3 text-[32px] leading-6 font-normal tracking-normal text-neutral-900 dark:text-neutral-100">
          About DevPockit
        </h1>
      </div>

      {/* Body Section */}
      <div className="bg-background flex flex-1 flex-col items-start justify-start gap-16 px-[64px] pt-4 pb-10 md:flex-row">
        <div className="flex w-full flex-col gap-6 self-start">
          <p className="text-foreground w-full max-w-[560px] text-base leading-7 text-pretty">
            Hi! We are a team of two who love creating small tools with a focus on design and function.
            <br />
            <br />
            We built <strong className="font-semibold">DevPockit</strong> to bring essential developer tools into one
            workspace, in one browser tab. We tried a few apps before, but eventually got tired of bouncing between
            multiple sites just to format JSON or decode tokens, frequently unsure about how our data was being handled.
            <br />
            <br />
            So we took a simpler route: <strong className="font-semibold">no backend, no servers, no tracking</strong>.
            Everything you type stays in your browser. Nothing is stored, sent, or logged.
            <br />
            <br />
            We hope you find it as useful as we do.
            <br />
            <br />
            DevPockit is <strong className="font-semibold">open source and free</strong>. If it makes your workday a
            little easier, feel free to share, contribute, or support us with a coffee or two. We&apos;d love to hear
            your feedback and ideas for what we should build next.
            <br />
            <br />
            Happy Coding!
          </p>
          <KeyboardShortcutsPanel />
        </div>

        {/* Cards */}
        <div className="flex w-full flex-col gap-4 self-start">
          <Link
            href="https://github.com/yuireidev/devpockit"
            target="_blank"
            rel="noopener noreferrer"
            className="border-border hover:bg-accent flex items-center gap-3 rounded-lg border p-4 transition-colors"
          >
            <CodeXml className="text-foreground h-6 w-6 shrink-0" />
            <div>
              <div className="font-semibold">Contribute & Star</div>
              <p className="text-muted-foreground text-sm">View source, report bugs, or submit a PR.</p>
            </div>
          </Link>

          <Link
            href="https://github.com/yuireidev/devpockit/issues/new"
            target="_blank"
            rel="noopener noreferrer"
            className="border-border hover:bg-accent flex items-center gap-3 rounded-lg border p-4 transition-colors"
          >
            <Lightbulb className="text-foreground h-6 w-6 shrink-0" />
            <div>
              <div className="font-semibold">Suggest a Tool</div>
              <p className="text-muted-foreground text-sm">Open an issue with your idea.</p>
            </div>
          </Link>

          <Link
            href="https://buymeacoffee.com/hypkey"
            target="_blank"
            rel="noopener noreferrer"
            className="border-border hover:bg-accent flex items-center gap-3 rounded-lg border p-4 transition-colors"
          >
            <Coffee className="text-foreground h-6 w-6 shrink-0" />
            <div>
              <div className="font-semibold">Buy Us a Coffee</div>
              <p className="text-muted-foreground text-sm">Fuel for late-night bug fixes.</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}

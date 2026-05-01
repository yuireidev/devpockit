'use client';

import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';
import { Coffee, Github, Keyboard, Lightbulb } from 'lucide-react';
import Link from 'next/link';

function KeyboardShortcutsPanel() {
  const paletteShortcut = useKeyboardShortcut();
  const openPalette = paletteShortcut ?? '⌘K / Ctrl+K';

  return (
    <div className="mt-10 w-full max-w-[560px] rounded-lg border border-border bg-muted/30 p-5">
      <div className="mb-4 flex items-center gap-2 font-semibold text-foreground">
        <Keyboard className="h-5 w-5 shrink-0" aria-hidden />
        Keyboard shortcuts
      </div>
      <dl className="grid gap-3 text-sm">
        <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
          <dt className="text-muted-foreground">Open command palette</dt>
          <dd className="font-mono text-foreground">{openPalette}</dd>
        </div>
        <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
          <dt className="text-muted-foreground">Close palette</dt>
          <dd className="font-mono text-foreground">Esc</dd>
        </div>
        <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
          <dt className="text-muted-foreground">Back to welcome (with a tool open)</dt>
          <dd className="font-mono text-foreground">Esc</dd>
        </div>
        <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
          <dt className="text-muted-foreground">Navigate palette results</dt>
          <dd className="font-mono text-foreground">↑ ↓ Enter</dd>
        </div>
      </dl>
    </div>
  );
}

export function AboutPage() {
  return (
    <div className="flex flex-col h-full">
      {/* Header Section */}
      <div className="bg-background px-[64px] pt-[36px] pb-[20px]">
        <h1 className="text-[32px] font-normal leading-6 tracking-normal text-neutral-900 dark:text-neutral-100 mb-3">
          About DevPockit
        </h1>
      </div>

      {/* Body Section */}
      <div className="flex flex-col md:flex-row flex-1 items-start justify-start bg-background px-[64px] pt-4 pb-10 gap-16">
        <div className="flex flex-col gap-6 w-full self-start">
          <p className="text-base leading-7 text-foreground w-full max-w-[560px] text-pretty">
            Hi! We are a team of two who love creating small tools with a focus on design and function.
            <br /><br />We built <strong className="font-semibold">DevPockit</strong> to bring essential developer tools into one workspace, in one browser tab.
            We tried a few apps before, but eventually got tired of bouncing between multiple sites just
            to format JSON or decode tokens, frequently unsure about how our data was being handled.
            <br /><br />So we took a simpler route:{' '}
            <strong className="font-semibold">no backend, no servers, no tracking</strong>.
            Everything you type stays in your browser. Nothing is stored, sent, or logged.
            <br /><br />We hope you find it as useful as we do.
            <br /><br />DevPockit is <strong className="font-semibold">open source and free</strong>. If it makes your workday a little easier, feel free to
            share, contribute, or support us with a coffee or two. We&apos;d love to hear your feedback
            and ideas for what we should build next.
            <br /><br />Happy Coding!
          </p>
          <KeyboardShortcutsPanel />
        </div>

        {/* Cards */}
        <div className="flex flex-col gap-4 w-full self-start">
            <Link
              href="https://github.com/hypkey/devpockit"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-accent transition-colors"
            >
              <Github className="h-6 w-6 shrink-0 text-foreground" />
              <div>
                <div className="font-semibold">Contribute & Star</div>
                <p className="text-sm text-muted-foreground">
                  View source, report bugs, or submit a PR.
                </p>
              </div>
            </Link>

            <Link
              href="https://github.com/hypkey/devpockit/issues/new"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-accent transition-colors"
            >
              <Lightbulb className="h-6 w-6 shrink-0 text-foreground" />
              <div>
                <div className="font-semibold">Suggest a Tool</div>
                <p className="text-sm text-muted-foreground">
                  Open an issue with your idea.
                </p>
              </div>
            </Link>

            <Link
              href="https://buymeacoffee.com/hypkey"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-accent transition-colors"
            >
              <Coffee className="h-6 w-6 shrink-0 text-foreground" />
              <div>
                <div className="font-semibold">Buy Us a Coffee</div>
                <p className="text-sm text-muted-foreground">
                  Fuel for late-night bug fixes.
                </p>
              </div>
            </Link>
        </div>
      </div>
    </div>
  );
}

'use client';

interface LocalProcessingNoticeProps {
  /** Extra tool-specific detail after the standard sentence */
  detail?: string;
}

export function LocalProcessingNotice({ detail }: LocalProcessingNoticeProps) {
  return (
    <p className="mt-2 max-w-3xl border-l-2 border-orange-400 pl-3 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
      Everything you enter is processed only in this browser tab—it is not sent to our servers.
      {detail ? ` ${detail}` : ''}
    </p>
  );
}

'use client'

import { redirect } from 'next/navigation'

export default function ToolsPage() {
  // Redirect to home page since tools should be accessed via specific tool routes
  redirect('/')
}

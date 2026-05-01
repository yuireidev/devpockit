import { getToolById, getTools } from '@/libs/tools-data';
import { absoluteAssetUrl, absoluteSiteUrl } from '@/libs/site-url';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface ToolPageProps {
  params: Promise<{
    category: string;
    toolId: string;
    instanceId: string;
  }>;
}

// Disallow dynamic params that weren't generated at build time
// This ensures invalid routes show 404 instead of causing errors
export const dynamicParams = false;

// Force static generation (required for static export)
export const dynamic = 'force-static';

export async function generateStaticParams() {
  const tools = getTools();
  // Generate instances 1-5 for each tool (max instances per tool)
  const params: Array<{ category: string; toolId: string; instanceId: string }> = [];

  for (const tool of tools) {
    for (let i = 1; i <= 5; i++) {
      params.push({
        category: tool.category,
        toolId: tool.id,
        instanceId: i.toString(),
      });
    }
  }

  return params;
}

export async function generateMetadata({ params }: ToolPageProps): Promise<Metadata> {
  const { category, toolId, instanceId } = await params;
  const tool = getToolById(toolId);

  if (!tool || tool.category !== category) {
    return { title: 'Tool' };
  }

  const title = `${tool.name} - Free Online Tool`;
  const description = `${tool.description} Free, fast, and runs locally in your browser. No sign-up required.`;
  const canonicalPath = `/tools/${category}/${toolId}/${instanceId}/`;
  const canonical = absoluteSiteUrl(canonicalPath);
  const ogImage = absoluteAssetUrl('/og-image.png');

  return {
    title,
    description,
    openGraph: {
      title: `${tool.name} | DevPockit`,
      description,
      url: canonical,
      type: 'website',
      images: [{ url: ogImage, width: 1200, height: 630, alt: tool.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${tool.name} | DevPockit`,
      description,
    },
    alternates: { canonical },
  };
}

export default async function ToolPage({ params }: ToolPageProps) {
  try {
    const { category, toolId, instanceId } = await params;

    // Early validation - if params are missing or invalid, show 404
    if (!category || !toolId || !instanceId) {
      notFound();
    }

    const tool = getToolById(toolId);

    // Validate tool exists
    if (!tool) {
      notFound();
    }

    // Verify the tool belongs to the specified category
    if (tool.category !== category) {
      notFound();
    }

    // Validate instanceId is a non-empty string
    if (instanceId.trim() === '') {
      notFound();
    }

    // The AppLayout is now handled by the layout.tsx file
    return null;
  } catch (error) {
    // If anything goes wrong (including route validation errors), show 404
    console.error('Tool page error:', error);
    notFound();
  }
}


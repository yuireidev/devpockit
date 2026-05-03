import { getCategories, getCategoryById } from '@/libs/tools-data';
import { absoluteSiteUrl } from '@/libs/site-url';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
}

// Disallow dynamic params that weren't generated at build time
export const dynamicParams = false;

// Force static generation (required for static export)
export const dynamic = 'force-static';

export async function generateStaticParams() {
  const categories = getCategories();
  return categories.map((category) => ({
    category: category.id,
  }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category: categoryId } = await params;
  const category = getCategoryById(categoryId);
  if (!category) {
    return { title: 'Tools' };
  }

  const title = `${category.name} — Developer Tools`;
  const description = `${category.description}. Free browser-based tools on DevPockit.`;
  const canonical = absoluteSiteUrl(`/tools/${category.id}/`);

  return {
    title,
    description,
    openGraph: {
      title: `${category.name} | DevPockit`,
      description,
      url: canonical,
      type: 'website',
    },
    alternates: { canonical },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  try {
    const { category: categoryId } = await params;

    // Early validation
    if (!categoryId) {
      notFound();
    }

    const category = getCategoryById(categoryId);

    if (!category) {
      notFound();
    }

    // The AppLayout is now handled by the layout.tsx file
    return null;
  } catch (error) {
    // If anything goes wrong, show 404
    console.error('Category page error:', error);
    notFound();
  }
}

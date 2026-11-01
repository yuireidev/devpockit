import { getCategoryById, getToolById } from './tools-data'

const MAX_INSTANCES = 5

/**
 * Generate next available instance ID (1, 2, 3, etc.)
 * Finds the first gap or next number in the sequence
 */
export function generateInstanceId(existingInstanceIds: string[]): string {
  // Convert existing IDs to numbers and find next available
  const existingNumbers = existingInstanceIds
    .map((id) => parseInt(id, 10))
    .filter((num) => !isNaN(num))
    .sort((a, b) => a - b)

  // Find first gap or next number
  for (let i = 1; i <= MAX_INSTANCES; i++) {
    if (!existingNumbers.includes(i)) {
      return i.toString()
    }
  }

  // If all instances are taken, return next (shouldn't happen due to max limit)
  return (existingNumbers.length + 1).toString()
}

/**
 * Generate URL path for a tool based on its category and ID
 */
export function getToolUrl(toolId: string): string | null {
  const tool = getToolById(toolId)
  if (!tool) return null

  return `/tools/${tool.category}/${toolId}`
}

/**
 * Generate URL path for a tool with instance ID
 */
export function getToolUrlWithInstance(toolId: string, instanceId: string): string | null {
  const tool = getToolById(toolId)
  if (!tool) return null

  return `/tools/${tool.category}/${toolId}/${instanceId}`
}

/**
 * Generate URL path for a category
 */
export function getCategoryUrl(categoryId: string): string | null {
  const category = getCategoryById(categoryId)
  if (!category) return null

  return `/tools/${categoryId}`
}

/**
 * Parse URL path to extract tool information
 * Supports both old format (3 segments) and new format (4 segments with instanceId)
 */
export function parseToolUrl(pathname: string): { category: string; toolId: string; instanceId: string | null } | null {
  const pathSegments = pathname.split('/').filter(Boolean)

  // New format: /tools/category/toolId/instanceId (4 segments)
  if (pathSegments.length === 4 && pathSegments[0] === 'tools') {
    const [, category, toolId, instanceId] = pathSegments
    return { category, toolId, instanceId }
  }

  // Old format: /tools/category/toolId (3 segments) - instanceId is null
  if (pathSegments.length === 3 && pathSegments[0] === 'tools') {
    const [, category, toolId] = pathSegments
    return { category, toolId, instanceId: null }
  }

  return null
}

/**
 * Parse URL path to extract category information
 */
export function parseCategoryUrl(pathname: string): string | null {
  const pathSegments = pathname.split('/').filter(Boolean)

  if (pathSegments.length === 2 && pathSegments[0] === 'tools') {
    return pathSegments[1]
  }

  return null
}

/**
 * Validate if a tool URL is valid
 * Accepts both old format (without instanceId) and new format (with instanceId)
 */
export function isValidToolUrl(pathname: string): boolean {
  const parsed = parseToolUrl(pathname)
  if (!parsed) return false

  const tool = getToolById(parsed.toolId)
  if (!tool || tool.category !== parsed.category) {
    return false
  }

  // If instanceId is provided, validate it's a valid string (non-empty)
  if (parsed.instanceId !== null && parsed.instanceId.trim() === '') {
    return false
  }

  return true
}

/**
 * Validate if a category URL is valid
 */
export function isValidCategoryUrl(pathname: string): boolean {
  const categoryId = parseCategoryUrl(pathname)
  if (!categoryId) return false

  const category = getCategoryById(categoryId)
  return category !== null
}

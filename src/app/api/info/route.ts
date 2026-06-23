import { NextRequest, NextResponse } from 'next/server'
import { textComplete } from '../_provider'

export const runtime = 'nodejs'
export const maxDuration = 60

// Guidance action. The product rule is "Remove safely" everywhere — never any
// aggressive removal wording in UI or copy.
type GuidanceAction = 'grow' | 'remove'

interface InfoRequest {
  action?: GuidanceAction
  commonName?: string
  scientificName?: string
  category?: string
  shortDescription?: string
}

const SAFE_EMPTY_ERROR =
  'We couldn’t generate guidance just now. Please try again in a moment.'
const SAFE_SERVER_ERROR =
  'Something went wrong while preparing guidance. Please try again in a moment.'

function buildPrompt(input: InfoRequest): string {
  const { action, commonName, scientificName, category, shortDescription } =
    input

  const nameParts = [commonName, scientificName].filter(Boolean).join(' (')
  const nameDisplay = nameParts
    ? nameParts + (scientificName ? ')' : '')
    : 'this plant'

  if (action === 'grow') {
    return `You are an expert horticulturist and gardener. The user has identified a plant and wants to know how to GROW it successfully.

Plant details:
- Common name: ${commonName || 'Unknown'}
- Scientific name: ${scientificName || 'Unknown'}
- Category: ${category || 'Unknown'}
- Description: ${shortDescription || 'N/A'}

Provide a comprehensive, friendly, practical guide on how to grow "${nameDisplay}". Use clear Markdown formatting with the following sections (use ## headings):

## Overview
A 2-3 sentence summary of why someone might grow this plant and what to expect.

## Ideal Conditions
Bullet list covering sunlight, soil type, pH preference, hardiness zones (if applicable), and climate preferences.

## Planting
Step-by-step instructions for planting (from seed, seedling, cutting, or bulb — whichever is most appropriate). Include timing, depth, and spacing.

## Watering & Feeding
How often to water, signs of over/under-watering, and fertilizer recommendations.

## Maintenance
Pruning, mulching, and ongoing care tips.

## Common Problems
2-4 common pests/diseases and how to handle them organically when possible.

## Pro Tips
2-3 expert tips for success.

Keep each section concise but informative. Use bullet points where helpful. Do not include emojis.`
  }

  if (action === 'remove') {
    return `You are an expert in weed control, invasive species management, and responsible gardening. The user has identified a plant and wants to know how to REMOVE it SAFELY and responsibly from their yard.

Plant details:
- Common name: ${commonName || 'Unknown'}
- Scientific name: ${scientificName || 'Unknown'}
- Category: ${category || 'Unknown'}
- Description: ${shortDescription || 'N/A'}

Provide a comprehensive, practical, SAFETY-FIRST guide on how to remove "${nameDisplay}" safely. Lead with non-chemical methods. Use clear Markdown formatting with the following sections (use ## headings):

## Overview
A 2-3 sentence summary of why this plant is often considered undesirable and how challenging it typically is to remove.

## Verify First
A short reminder to confirm the identification with a second source before removing anything, plus 2-3 key features to double-check.

## Manual Removal (recommended first)
Step-by-step instructions for hand-pulling, digging, or mechanical removal. Include the best time of year, tools needed, and any root considerations (e.g. taproot depth, rhizomes). Frame this as the preferred, lowest-risk option.

## Targeted Treatment (use caution)
If hand removal isn't practical, describe selective vs non-selective options and active-ingredient categories in GENERAL terms only. Stress reading and following the full product label, spot-application, protecting desirable plants, and that requirements vary by region. If chemical treatment is not appropriate (e.g. desirable lawn grass), say so clearly and explain why.

## Smothering / Cultural Methods
Mulching, solarization, or covering techniques if applicable.

## Preventing Regrowth
How to stop it from coming back — disposing of removed material, monitoring, and lawn/garden hygiene tips.

## Safety & Environment
2-3 important cautions: follow local laws and product labels, and protect children, pets, pollinators, and waterways.

Keep each section concise but informative. Use bullet points where helpful. Do not use aggressive language. Do not include emojis.`
  }

  return ''
}

export async function POST(req: NextRequest) {
  try {
    const body = ((await req.json().catch(() => null)) ?? {}) as InfoRequest
    const { action, commonName, scientificName, category, shortDescription } =
      body

    if (action !== 'grow' && action !== 'remove') {
      return NextResponse.json(
        { error: 'Choose “Grow it” or “Remove safely”.' },
        { status: 400 }
      )
    }

    if (!commonName && !scientificName) {
      return NextResponse.json(
        { error: 'A plant name is required to generate guidance.' },
        { status: 400 }
      )
    }

    const prompt = buildPrompt({
      action,
      commonName,
      scientificName,
      category,
      shortDescription
    })

    const systemText =
      action === 'grow'
        ? 'You are a friendly, knowledgeable master gardener with decades of experience growing plants of all kinds.'
        : 'You are a friendly, safety-conscious expert in responsible weed and invasive-species management.'

    const content = await textComplete(systemText, prompt)

    if (!content.trim()) {
      console.error('info: model returned empty content')
      return NextResponse.json({ error: SAFE_EMPTY_ERROR }, { status: 502 })
    }

    return NextResponse.json({
      action,
      commonName: commonName || '',
      scientificName: scientificName || '',
      content
    })
  } catch {
    console.error('info: unhandled server error')
    return NextResponse.json({ error: SAFE_SERVER_ERROR }, { status: 500 })
  }
}

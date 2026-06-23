import { NextRequest, NextResponse } from 'next/server'
import { visionComplete } from '../_provider'

export const runtime = 'nodejs'
export const maxDuration = 60

type PlantCategory =
  | 'grass'
  | 'weed'
  | 'flower'
  | 'shrub'
  | 'tree'
  | 'succulent'
  | 'other'

type Confidence = 'high' | 'medium' | 'low'

interface PlantCandidate {
  category: PlantCategory
  commonName: string
  scientificName: string
  shortDescription: string
  keyTraits: string[]
  confidence: Confidence
  /** Display match score 0–100, derived from confidence + rank. */
  matchPercent: number
  careNote: string
  reason: string // why this candidate was ranked this way
}

interface IdentifyResult {
  identified: boolean
  isPlant: boolean
  primary: PlantCandidate | null
  candidates: PlantCandidate[]
}

const ALLOWED_CATEGORIES: PlantCategory[] = [
  'grass',
  'weed',
  'flower',
  'shrub',
  'tree',
  'succulent',
  'other'
]

// Generic, user-safe error copy. We NEVER return raw model output, internal
// error strings, or provider details to the client.
const SAFE_PARSE_ERROR =
  'We couldn’t read that photo clearly. Please try again with a sharper, well-lit close-up.'
const SAFE_SERVER_ERROR =
  'Something went wrong while analyzing your photo. Please try again in a moment.'

const IDENTIFY_PROMPT = `You are an expert botanist, horticulturist, and weed-science specialist. Analyze the provided image and identify EVERY distinct plant that is clearly visible.

CRITICAL — CHOOSING THE PRIMARY SUBJECT:
Most photos taken in a yard or lawn will contain MULTIPLE plants. The user is almost NEVER asking about the lawn grass itself — they are asking about the WEED, FLOWER, or unusual plant growing in or next to it. So:

- Lawn / turf grass (Bermuda, St. Augustine, Kentucky Bluegrass, Fescue, Zoysia, etc.) is almost always the BACKGROUND, not the subject. Only treat it as the primary subject if it is the ONLY plant visible AND the photo is a clear close-up of just grass blades.
- If you see a weed, flower, clover, dandelion, thistle, crabgrass, nutsedge, oxalis, spurge, or any other distinctive plant growing in or alongside lawn grass, that distinctive plant MUST be the primary subject — NOT the grass.
- If you see multiple non-grass plants, rank the most prominent / sharply-focused / centrally-located one as primary.
- When uncertain about the species of a weed, still rank it as primary (with confidence "low") rather than falling back to the lawn grass.

Return up to 3 distinct candidates, ranked from most-likely-subject to least-likely. If only one plant is visible, return just one candidate. If the image is not a plant at all (person, building, car, food, animal), return zero candidates with identified=true, isPlant=false.

Respond ONLY with a valid JSON object (no markdown, no code fences, no extra text) with this exact structure:
{
  "identified": boolean,           // true if the image was successfully analyzed
  "isPlant": boolean,              // true if at least one plant was detected
  "primary": <Candidate | null>,   // the top-ranked candidate (the user's likely subject)
  "candidates": [ <Candidate>, ... ] // 0-3 ranked candidates, candidates[0] === primary when isPlant
}

Candidate shape:
{
  "category": string,              // one of: "grass", "weed", "flower", "shrub", "tree", "succulent", "other"
  "commonName": string,            // e.g. "Dandelion"
  "scientificName": string,        // e.g. "Taraxacum officinale"
  "shortDescription": string,      // 1-2 sentence description
  "keyTraits": string[],           // 3-6 brief identifying traits (leaf shape, color, flowers, etc.)
  "confidence": string,            // "high" | "medium" | "low"
  "careNote": string,              // one short note: typically grown intentionally or considered invasive?
  "reason": string                 // one short sentence explaining why this candidate was ranked here
}

Rules:
- candidates[0] MUST equal primary whenever isPlant is true.
- If isPlant is false, primary MUST be null and candidates MUST be an empty array.
- If the image is blurry or a plant cannot be confidently identified, still make your best guess and set confidence to "low".
- Always return valid JSON. No trailing commas, no comments, no surrounding text.`

// Map confidence + rank to a stable display percentage ("94% match").
function matchPercentFor(confidence: Confidence, rank: number): number {
  const base = confidence === 'high' ? 94 : confidence === 'medium' ? 82 : 68
  // Each lower rank trims a few points so the list reads as descending.
  const trimmed = base - rank * 6
  return Math.max(35, Math.min(99, trimmed))
}

function normalizeCandidate(raw: unknown, rank: number): PlantCandidate {
  const c = (raw ?? {}) as Partial<PlantCandidate>
  const category: PlantCategory = ALLOWED_CATEGORIES.includes(
    c.category as PlantCategory
  )
    ? (c.category as PlantCategory)
    : 'other'
  const confidence: Confidence =
    c.confidence === 'high' || c.confidence === 'medium' || c.confidence === 'low'
      ? c.confidence
      : 'low'
  return {
    category,
    commonName: typeof c.commonName === 'string' ? c.commonName : '',
    scientificName:
      typeof c.scientificName === 'string' ? c.scientificName : '',
    shortDescription:
      typeof c.shortDescription === 'string' ? c.shortDescription : '',
    keyTraits: Array.isArray(c.keyTraits)
      ? c.keyTraits.filter((t): t is string => typeof t === 'string').slice(0, 6)
      : [],
    confidence,
    matchPercent: matchPercentFor(confidence, rank),
    careNote: typeof c.careNote === 'string' ? c.careNote : '',
    reason: typeof c.reason === 'string' ? c.reason : ''
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)
    const image = (body as { image?: string } | null)?.image

    if (!image || typeof image !== 'string') {
      return NextResponse.json(
        { error: 'Missing image. Please attach a photo and try again.' },
        { status: 400 }
      )
    }

    if (!image.startsWith('data:image/')) {
      return NextResponse.json(
        { error: 'That file isn’t a supported image. Please choose a photo.' },
        { status: 400 }
      )
    }

    const rawContent = await visionComplete(IDENTIFY_PROMPT, image)

    let raw: Partial<IdentifyResult>
    try {
      const cleaned = rawContent
        .trim()
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```$/i, '')
      raw = JSON.parse(cleaned) as Partial<IdentifyResult>
    } catch {
      // Log only a short, sanitized note server-side — never the raw payload,
      // and never return raw model output to the client.
      console.error('identify: model returned non-JSON content')
      return NextResponse.json({ error: SAFE_PARSE_ERROR }, { status: 502 })
    }

    const rawCandidates = Array.isArray(raw.candidates) ? raw.candidates : []
    const candidates: PlantCandidate[] = rawCandidates
      .slice(0, 3)
      .map((c, i) => normalizeCandidate(c, i))
      .filter((c) => c.commonName || c.scientificName)
      // Re-rank match% after filtering so indices line up.
      .map((c, i) => ({ ...c, matchPercent: matchPercentFor(c.confidence, i) }))

    let primary: PlantCandidate | null = null
    const isPlant = !!raw.isPlant && candidates.length > 0
    if (isPlant) {
      primary = candidates[0]
    } else if (raw.primary) {
      primary = normalizeCandidate(raw.primary, 0)
      candidates.unshift(primary)
    }

    const result: IdentifyResult = {
      identified: raw.identified !== false,
      isPlant,
      primary,
      candidates
    }

    return NextResponse.json(result)
  } catch {
    // Never surface internal error messages or provider details.
    console.error('identify: unhandled server error')
    return NextResponse.json({ error: SAFE_SERVER_ERROR }, { status: 500 })
  }
}

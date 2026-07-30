export type MarketingCollection = {
  slug: string
  title: string
  shortTitle: string
  description: string
  intro: string
  categories?: string[]
  keywords: string[]
  rooms: string[]
  buyerGuide: string[]
  sizeAdvice: string
  customPrompt: string
  faqs: Array<{
    question: string
    answer: string
  }>
  group?: "style" | "room" | "scale" | "color"
}

export const marketingCollections: MarketingCollection[] = [
  {
    slug: "abstract-art-for-living-room",
    title: "Abstract Art for Living Rooms",
    shortTitle: "Living Room Abstracts",
    description:
      "Browse original abstract paintings selected for calm living rooms, open-plan spaces, and modern interiors.",
    intro:
      "A focused edit of original abstract paintings with balanced color, strong surface presence, and sizes that hold a room without overwhelming it.",
    categories: ["Abstract"],
    keywords: ["abstract wall art", "living room art", "original canvas painting"],
    rooms: ["Living rooms", "Open-plan apartments", "Quiet statement walls"],
    buyerGuide: [
      "Start with the sofa or main seating wall, then choose a painting that feels wide enough to anchor the furniture.",
      "Use calmer abstract works for rooms with strong furniture, and bolder movement when the room needs a clear focal point.",
      "Ask for extra daylight photos if the wall color, rug, or sofa fabric needs a close palette match.",
    ],
    sizeAdvice:
      "For most sofas, artwork around two-thirds to three-quarters of the sofa width feels balanced. A single large canvas often works better than several small works on a main living room wall.",
    customPrompt:
      "If the available abstracts are close but not the right size or color mood, request a custom canvas based on your room photo and wall measurements.",
    faqs: [
      {
        question: "What abstract art works best above a sofa?",
        answer: "Look for a width that relates to the sofa, enough visual presence for the wall, and colors that repeat or calmly contrast with the room.",
      },
      {
        question: "Can I send a room photo before choosing?",
        answer: "Yes. YiiArt can help compare scale, palette, and orientation before you buy.",
      },
      {
        question: "Can an abstract work be customized?",
        answer: "A listed original is sold as shown, but a custom canvas can be discussed if you need a different size, palette, or composition direction.",
      },
    ],
    group: "room",
  },
  {
    slug: "textured-wall-art",
    title: "Textured Wall Art",
    shortTitle: "Textured Wall Art",
    description:
      "Explore original textured paintings and mixed-media canvas works with tactile surfaces for modern homes.",
    intro:
      "Textured works bring depth to simple rooms. This collection highlights pieces with visible brushwork, mineral surfaces, and layered paint.",
    categories: ["Texture", "Textured Art"],
    keywords: ["textured wall art", "mixed media painting", "neutral canvas art"],
    rooms: ["Entryways", "Bedrooms", "Minimal interiors"],
    buyerGuide: [
      "Choose textured work when the room needs depth without relying on bright color.",
      "Ask for close-up and side-angle photos so you can understand the surface before purchase.",
      "For narrow spaces, consider smaller or portrait-oriented textured pieces that can be appreciated at close range.",
    ],
    sizeAdvice:
      "Texture reads differently at different distances. Medium works suit close viewing in bedrooms and entries; large textured canvas pieces work well when the wall has enough breathing room.",
    customPrompt:
      "For a specific neutral palette, mineral surface, or larger textured wall art size, start a custom painting request before checkout.",
    faqs: [
      {
        question: "Will the texture look exactly like the photos?",
        answer: "Photos show the surface as clearly as possible, but light angle and screen color can change how texture appears. Ask for extra detail photos if needed.",
      },
      {
        question: "Is textured wall art fragile?",
        answer: "Textured paintings are physical surfaces and should be handled carefully. YiiArt confirms safe packaging format before dispatch.",
      },
      {
        question: "Can textured art ship rolled?",
        answer: "Some textured works can ship rolled, while heavier surfaces may need special handling. The safest format depends on the actual artwork.",
      },
    ],
    group: "style",
  },
  {
    slug: "large-canvas-art",
    title: "Large Canvas Art",
    shortTitle: "Large Canvas Art",
    description:
      "Shop large original canvas paintings for feature walls, collector homes, offices, and hospitality spaces.",
    intro:
      "Large-format works are selected for rooms that need presence from a single piece: generous walls, above-sofa placements, and calm commercial spaces.",
    keywords: ["large canvas art", "oversized original painting", "statement wall art"],
    rooms: ["Feature walls", "Offices", "Hotels and studios"],
    buyerGuide: [
      "Measure the wall width, furniture width, and viewing distance before choosing oversized art.",
      "Large wall art should feel intentional from across the room, not crowded against ceilings, lamps, or side furniture.",
      "Confirm shipping format before purchase, because oversized canvas may ship rolled for safety.",
    ],
    sizeAdvice:
      "For a large feature wall, leave visual breathing room on each side. Above furniture, a work around two-thirds to three-quarters of the furniture width is usually a reliable starting point.",
    customPrompt:
      "If your wall needs an exact oversized size, custom canvas art is often the better path than forcing a ready-made painting to fit.",
    faqs: [
      {
        question: "How large should wall art be above a sofa or bed?",
        answer: "A useful starting point is two-thirds to three-quarters of the furniture width, adjusted for ceiling height and room openness.",
      },
      {
        question: "Can large canvas art ship internationally?",
        answer: "Yes, but the shipping format depends on size and safety. Oversized works may ship rolled in a protective tube.",
      },
      {
        question: "Should I choose one large painting or several smaller works?",
        answer: "One large canvas is usually cleaner for a feature wall. Smaller groupings can work when the room needs rhythm instead of a single focal point.",
      },
    ],
    group: "scale",
  },
  {
    slug: "wabi-sabi-wall-art",
    title: "Wabi-sabi Wall Art",
    shortTitle: "Wabi-sabi Art",
    description:
      "Browse original wabi-sabi and textured paintings with grounded palettes, quiet movement, and imperfect surfaces.",
    intro:
      "A calm edit of original works for collectors who prefer texture, restraint, natural marks, and rooms that do not feel over-decorated.",
    categories: ["Wabi-sabi", "Texture"],
    keywords: ["wabi-sabi wall art", "neutral textured painting", "quiet luxury art"],
    rooms: ["Bedrooms", "Reading corners", "Minimal living rooms"],
    buyerGuide: [
      "Look for quiet movement, imperfect marks, and natural palettes when the room should feel calm rather than decorated.",
      "Pair wabi-sabi art with linen, wood, stone, plaster, muted metal, and simple furniture lines.",
      "Use WhatsApp to confirm undertones if your room already has warm beige, cool gray, or earth materials.",
    ],
    sizeAdvice:
      "Wabi-sabi work often benefits from space around it. Choose a size that lets the surface breathe instead of filling every inch of the wall.",
    customPrompt:
      "If you need a specific earthy palette, quiet texture, or unusual proportion, discuss a custom canvas before production.",
    faqs: [
      {
        question: "What makes art feel wabi-sabi?",
        answer: "Quiet color, natural marks, visible surface, restraint, and a sense of imperfection usually matter more than a perfect graphic composition.",
      },
      {
        question: "Is wabi-sabi art only neutral?",
        answer: "Not always, but neutral, earthy, and muted palettes are often easier to place in calm interiors.",
      },
      {
        question: "Can I request a softer or warmer palette?",
        answer: "Yes. A custom painting request can start from room photos, material samples, and preferred color direction.",
      },
    ],
    group: "style",
  },
  {
    slug: "bedroom-wall-art",
    title: "Bedroom Wall Art",
    shortTitle: "Bedroom Art",
    description:
      "Original paintings selected for bedrooms, private spaces, and calm rooms that need measured color and texture.",
    intro:
      "Bedroom works should support the room instead of dominating it. This collection favors softer color, balanced scale, and quieter surfaces.",
    categories: ["Abstract", "Landscape", "Texture", "Wabi-sabi"],
    keywords: ["bedroom wall art", "calm original painting", "soft abstract art"],
    rooms: ["Bedrooms", "Guest rooms", "Private sitting areas"],
    buyerGuide: [
      "Choose softer contrast and calmer movement for bedrooms, especially above a headboard.",
      "Measure the headboard width and nearby lamps before choosing a horizontal or square work.",
      "Avoid overly busy color if the room is meant to feel restful at night.",
    ],
    sizeAdvice:
      "Above a bed, the artwork should relate to the headboard width while leaving space around lamps, side tables, and ceiling lines.",
    customPrompt:
      "If your bedroom needs a very specific soft palette or headboard width, a custom canvas can be planned around the actual room.",
    faqs: [
      {
        question: "What colors are best for bedroom wall art?",
        answer: "Soft neutrals, muted blues, earth tones, and gentle abstract movement are often easier to live with in a bedroom.",
      },
      {
        question: "Should bedroom art be framed?",
        answer: "It depends on the room. A float frame can feel finished, while unframed canvas can feel quieter and more relaxed.",
      },
      {
        question: "Can I use large art in a small bedroom?",
        answer: "Yes, if the wall and furniture proportions support it. Send measurements if you are unsure.",
      },
    ],
    group: "room",
  },
  {
    slug: "neutral-canvas-art",
    title: "Neutral Canvas Art",
    shortTitle: "Neutral Art",
    description:
      "Explore original neutral canvas paintings, textured works, and minimalist pieces for restrained modern interiors.",
    intro:
      "Neutral art is useful when the room already has strong materials or furniture. These pieces focus on surface, proportion, and subtle color.",
    categories: ["Texture", "Wabi-sabi", "Minimalist"],
    keywords: ["neutral canvas art", "minimalist painting", "earth tone wall art"],
    rooms: ["Minimal interiors", "Entryways", "Quiet offices"],
    buyerGuide: [
      "Neutral art works best when surface, proportion, and undertone are chosen carefully.",
      "Check whether the room leans warm, cool, gray, beige, cream, taupe, or earth-toned before choosing.",
      "Use texture or scale when you want presence without adding strong color.",
    ],
    sizeAdvice:
      "Neutral canvas art can be larger without overwhelming a room, but the undertone should still work with walls, flooring, and upholstery.",
    customPrompt:
      "For a precise neutral palette or a minimalist size made for your wall, start a custom painting request with room photos.",
    faqs: [
      {
        question: "How do I choose between warm and cool neutral art?",
        answer: "Compare the painting with your wall color, sofa fabric, flooring, and natural light. Ask for daylight photos if the undertone matters.",
      },
      {
        question: "Will neutral art look too plain?",
        answer: "It can still have strong presence through scale, surface texture, brushwork, and proportion.",
      },
      {
        question: "Can neutral canvas art be customized?",
        answer: "Yes. Custom work can be planned around a warmer, cooler, lighter, darker, or more textured neutral direction.",
      },
    ],
    group: "color",
  },
]

export function getMarketingCollection(slug: string) {
  return marketingCollections.find((collection) => collection.slug === slug)
}

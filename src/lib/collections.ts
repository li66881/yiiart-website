export type MarketingCollection = {
  slug: string
  title: string
  shortTitle: string
  description: string
  metaDescription: string
  intro: string
  categories?: string[]
  roomTypes?: string[]
  seriesSlug?: string
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
      "Browse hand-painted abstract paintings selected for calm living rooms, open-plan spaces, and modern interiors.",
    metaDescription:
      "Shop hand-painted abstract art for living rooms and open-plan homes. Compare original paintings by size, palette, and room fit.",
    intro:
      "A focused edit of hand-painted abstract paintings with balanced color, strong surface presence, and sizes that hold a room without overwhelming it.",
    categories: ["Abstract"],
    roomTypes: ["Living room"],
    keywords: ["abstract wall art", "living room art", "hand-painted canvas painting"],
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
        answer: "A listed design can be recreated with a custom canvas if you need a different size, palette, or composition direction.",
      },
    ],
    group: "room",
  },
  {
    slug: "textured-wall-art",
    title: "Textured Wall Art",
    shortTitle: "Textured Wall Art",
    description:
      "Explore hand-painted textured paintings and mixed-media canvas works with tactile surfaces for modern homes.",
    metaDescription:
      "Explore hand-painted textured wall art and mixed-media canvas for bedrooms and entryways. Compare original works by surface, size, and palette.",
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
      "Shop large hand-painted canvas paintings for feature walls, collector homes, offices, and hospitality spaces.",
    metaDescription:
      "Shop large hand-painted canvas art for feature walls, offices, and hospitality spaces. Compare available sizes and shipping options.",
    intro:
      "Large-format works are selected for rooms that need presence from a single piece: generous walls, above-sofa placements, and calm commercial spaces.",
    keywords: ["large canvas art", "oversized hand-painted painting", "statement wall art"],
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
      "Browse hand-painted wabi-sabi and textured paintings with grounded palettes, quiet movement, and imperfect surfaces.",
    metaDescription:
      "Explore hand-painted wabi-sabi wall art with tactile surfaces and grounded palettes. Find original paintings for calm, understated rooms.",
    intro:
      "A calm edit of hand-painted works for collectors who prefer texture, restraint, natural marks, and rooms that do not feel over-decorated.",
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
      "Hand-painted paintings selected for bedrooms, private spaces, and calm rooms that need measured color and texture.",
    metaDescription:
      "Find hand-painted bedroom wall art in calm colors and soft textures. Compare original paintings by scale, orientation, and room fit.",
    intro:
      "Bedroom works should support the room instead of dominating it. This collection favors softer color, balanced scale, and quieter surfaces.",
    roomTypes: ["Bedroom"],
    keywords: ["bedroom wall art", "calm hand-painted painting", "soft abstract art"],
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
    slug: "dining-room-wall-art",
    title: "Dining Room Wall Art",
    shortTitle: "Dining Room Art",
    description: "Browse original hand-painted art selected for dining rooms, breakfast areas, and relaxed open-plan entertaining spaces.",
    metaDescription: "Shop original dining room wall art chosen for welcoming meals and open-plan homes. Compare hand-painted works by size, color, and room fit.",
    intro: "Choose dining room art that gives the table a clear focal point while keeping conversation and everyday meals comfortable.",
    roomTypes: ["Dining room"],
    keywords: ["dining room wall art", "dining room paintings", "art above dining table"],
    rooms: ["Dining rooms", "Breakfast areas", "Open-plan dining spaces"],
    buyerGuide: [
      "Measure the table and wall together so the artwork relates to the dining zone rather than the entire open-plan room.",
      "Choose a palette that works in both daylight and evening lighting, when dining spaces can feel noticeably different.",
      "Leave enough space around chairs, sconces, and cabinets so the painting remains the focal point without crowding the room.",
    ],
    sizeAdvice: "Above a dining table, choose a work around one-half to two-thirds of the table width and account for chair movement and pendant lights.",
    customPrompt: "For a dining wall with unusual proportions or a specific table palette, share its measurements and a room photo when requesting a custom painting.",
    faqs: [
      { question: "How wide should dining room art be?", answer: "A useful starting point is about one-half to two-thirds of the table width, adjusted for the wall and nearby lighting." },
      { question: "What art works above a dining table?", answer: "Choose a composition with a comfortable viewing distance and a palette that works in both daytime and evening light." },
      { question: "Can I choose dining room art for an open-plan space?", answer: "Yes. Relate the artwork to the dining table and repeat one or two colors from nearby furnishings to connect the zones." },
    ],
    group: "room",
  },
  {
    slug: "office-wall-art",
    title: "Office Wall Art",
    shortTitle: "Office Wall Art",
    description: "Explore original hand-painted office art for focused workspaces, home offices, studios, and considered professional interiors.",
    metaDescription: "Find original office wall art for focused home and professional workspaces. Compare hand-painted paintings by scale, palette, and placement.",
    intro: "Office art can bring personality to a working space without competing with screens, shelves, or the task at hand.",
    roomTypes: ["Office"],
    keywords: ["office wall art", "home office paintings", "art for workspace"],
    rooms: ["Home offices", "Studios", "Professional workspaces"],
    buyerGuide: [
      "Consider what appears behind you on video calls and how the artwork reads from the desk and doorway.",
      "Use calmer compositions near a screen or focused work area; a stronger focal piece can suit a meeting or reception wall.",
      "Check glare from windows and task lighting before choosing a glossy or heavily textured surface.",
    ],
    sizeAdvice: "For a desk wall, select a width that relates to the desk while preserving space for monitors, shelving, and adjustable task lighting.",
    customPrompt: "Share a workspace photo, desk width, and viewing distance if you need a painting planned around a specific office layout.",
    faqs: [
      { question: "What artwork is suitable for an office?", answer: "Choose work that suits the room's purpose and viewing distance, with enough character to personalize the space without distracting from tasks." },
      { question: "How large should art be above a desk?", answer: "Relate the artwork to the desk width and leave room for monitors, shelves, and lighting." },
      { question: "Can office art work on video calls?", answer: "Yes. Check the background from your camera position and avoid placing strong reflections behind you." },
    ],
    group: "room",
  },
  {
    slug: "neutral-canvas-art",
    title: "Neutral Canvas Art",
    shortTitle: "Neutral Art",
    description:
      "Explore hand-painted neutral canvas paintings, textured works, and minimalist pieces for restrained modern interiors.",
    metaDescription:
      "Browse hand-painted neutral canvas art, textured paintings, and minimalist works for modern interiors. Compare palettes, sizes, and room fit.",
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

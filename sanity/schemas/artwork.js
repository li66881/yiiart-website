// sanity/schemas/artwork.js
// Artwork data model — global premium original art e-commerce
// Supports: multi-currency pricing, multiple shipping formats, UHD gallery, pre-shipment confirmation media

import { defineField, defineType } from 'sanity'
import { ImageIcon, TagIcon } from '@sanity/icons'

// ─────────────────────────────────────────────
// Helper: Currency options (ISO 4217)
// ─────────────────────────────────────────────
const CURRENCY_OPTIONS = [
  { title: 'CNY ¥ (RMB)', value: 'CNY' },
  { title: 'USD $ (US Dollar)', value: 'USD' },
  { title: 'EUR € (Euro)', value: 'EUR' },
  { title: 'JPY ¥ (Japanese Yen)', value: 'JPY' },
  { title: 'KRW ₩ (Korean Won)', value: 'KRW' },
  { title: 'GBP £ (British Pound)', value: 'GBP' },
  { title: 'HKD $ (Hong Kong Dollar)', value: 'HKD' },
  { title: 'AUD $ (Australian Dollar)', value: 'AUD' },
]

export default defineType({
  name: 'artwork',
  title: 'Artwork',
  type: 'document',
  icon: ImageIcon,

  // Studio list preview
  preview: {
    select: {
      title: 'title.en',
      subtitle: 'artist.name',
      media: 'mainImage',
    },
    prepare({ title, subtitle, media }) {
      return {
        title: title ?? '(Untitled)',
        subtitle: subtitle ? `Artist: ${subtitle}` : '(No artist linked)',
        media,
      }
    },
  },

  groups: [
    { name: 'basic', title: 'Basic', default: true },
    { name: 'pricing', title: 'Pricing & Inventory' },
    { name: 'physical', title: 'Physical Specs' },
    { name: 'media', title: 'Media' },
    { name: 'shipping', title: 'Shipping' },
    { name: 'seo', title: 'SEO' },
  ],

  fields: [
    // ─────────────────────────────────────────────
    // GROUP: Basic
    // ─────────────────────────────────────────────
    defineField({
      name: 'title',
      title: 'Title (i18n)',
      type: 'object',
      group: 'basic',
      description: 'At least English is recommended; add more languages for global storefront.',
      options: { collapsible: true, collapsed: false },
      fields: [
        { name: 'en', title: 'English', type: 'string', validation: (R) => R.required() },
        { name: 'zh', title: '中文', type: 'string' },
        { name: 'ja', title: '日本語', type: 'string' },
        { name: 'ko', title: '한국어', type: 'string' },
        { name: 'fr', title: 'Français', type: 'string' },
        { name: 'ar', title: 'العربية', type: 'string' },
        { name: 'es', title: 'Español', type: 'string' },
        { name: 'de', title: 'Deutsch', type: 'string' },
      ],
    }),

    defineField({
      name: 'slug',
      title: 'URL Slug',
      type: 'slug',
      group: 'basic',
      options: {
        source: 'title.en',
        maxLength: 96,
        isUnique: (value, context) => context.defaultIsUnique(value, context),
      },
      validation: (R) => R.required(),
    }),

    defineField({
      name: 'artist',
      title: 'Artist',
      type: 'reference',
      group: 'basic',
      to: [{ type: 'artist' }],
      validation: (R) => R.required(),
    }),

    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      group: 'basic',
      options: {
        list: [
          { title: 'Oil Painting', value: 'oil' },
          { title: 'Watercolor', value: 'watercolor' },
          { title: 'Chinese Ink', value: 'ink' },
          { title: 'Acrylic', value: 'acrylic' },
          { title: 'Drawing', value: 'drawing' },
          { title: 'Print', value: 'print' },
          { title: 'Mixed Media', value: 'mixed' },
        ],
        layout: 'radio',
      },
      validation: (R) => R.required(),
    }),

    defineField({
      name: 'description',
      title: 'Description (i18n)',
      type: 'object',
      group: 'basic',
      options: { collapsible: true, collapsed: true },
      fields: [
        { name: 'en', title: 'English', type: 'text', rows: 4 },
        { name: 'zh', title: '中文', type: 'text', rows: 4 },
        { name: 'ja', title: '日本語', type: 'text', rows: 4 },
        { name: 'ko', title: '한국어', type: 'text', rows: 4 },
        { name: 'fr', title: 'Français', type: 'text', rows: 4 },
        { name: 'ar', title: 'العربية', type: 'text', rows: 4 },
        { name: 'es', title: 'Español', type: 'text', rows: 4 },
        { name: 'de', title: 'Deutsch', type: 'text', rows: 4 },
      ],
    }),

    defineField({
      name: 'yearCreated',
      title: 'Year Created',
      type: 'number',
      group: 'basic',
      validation: (R) => R.integer().min(1800).max(new Date().getFullYear()),
    }),

    defineField({
      name: 'tags',
      title: 'Tags / Keywords',
      type: 'array',
      group: 'basic',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    }),

    defineField({
      name: 'status',
      title: 'Listing Status',
      type: 'string',
      group: 'basic',
      options: {
        list: [
          { title: 'Available', value: 'available' },
          { title: 'Sold', value: 'sold' },
          { title: 'Reserved', value: 'reserved' },
          { title: 'On Exhibition', value: 'exhibition' },
          { title: 'Draft', value: 'draft' },
        ],
        layout: 'radio',
      },
      initialValue: 'draft',
      validation: (R) => R.required(),
    }),

    // ─────────────────────────────────────────────
    // GROUP: Pricing
    // ─────────────────────────────────────────────
    defineField({
      name: 'prices',
      title: 'Multi-currency Pricing',
      type: 'array',
      group: 'pricing',
      description: 'Add list prices in multiple currencies. Recommended: at least CNY and USD.',
      of: [
        {
          type: 'object',
          name: 'priceEntry',
          title: 'Price Entry',
          icon: TagIcon,
          preview: {
            select: { currency: 'currency', amount: 'amount' },
            prepare: ({ currency, amount }) => ({
              title: `${currency ?? '?'} ${amount ?? 0}`,
            }),
          },
          fields: [
            {
              name: 'currency',
              title: 'Currency',
              type: 'string',
              options: { list: CURRENCY_OPTIONS, layout: 'radio' },
              validation: (R) => R.required(),
            },
            {
              name: 'amount',
              title: 'List price (tax included)',
              type: 'number',
              validation: (R) => R.required().min(0),
            },
            {
              name: 'saleAmount',
              title: 'Sale price (optional)',
              type: 'number',
              validation: (R) => R.min(0),
            },
            {
              name: 'taxIncluded',
              title: 'Tax included',
              type: 'boolean',
              initialValue: true,
            },
          ],
        },
      ],
      validation: (R) => R.unique(),
    }),

    defineField({
      name: 'isEdition',
      title: 'Limited Edition',
      type: 'boolean',
      group: 'pricing',
      initialValue: false,
      description: 'Enable for prints / limited reproductions.',
    }),

    defineField({
      name: 'editionInfo',
      title: 'Edition Info',
      type: 'object',
      group: 'pricing',
      hidden: ({ document }) => !document?.isEdition,
      fields: [
        { name: 'total', title: 'Total editions', type: 'number' },
        { name: 'current', title: 'Current number', type: 'number' },
      ],
    }),

    // ─────────────────────────────────────────────
    // GROUP: Physical
    // ─────────────────────────────────────────────
    defineField({
      name: 'dimensions',
      title: 'Dimensions (cm)',
      type: 'object',
      group: 'physical',
      description: 'Artwork size only (excluding frame).',
      options: { columns: 3 },
      fields: [
        { name: 'width', title: 'Width (cm)', type: 'number', validation: (R) => R.required().min(1) },
        { name: 'height', title: 'Height (cm)', type: 'number', validation: (R) => R.required().min(1) },
        { name: 'depth', title: 'Depth (cm)', type: 'number', description: 'Canvas depth (optional)' },
      ],
    }),

    defineField({
      name: 'framedDimensions',
      title: 'Framed Dimensions (cm, optional)',
      type: 'object',
      group: 'physical',
      options: { collapsible: true, collapsed: true, columns: 2 },
      fields: [
        { name: 'width', title: 'Width (cm)', type: 'number' },
        { name: 'height', title: 'Height (cm)', type: 'number' },
      ],
    }),

    defineField({
      name: 'weight',
      title: 'Weight (g)',
      type: 'number',
      group: 'physical',
      validation: (R) => R.min(0),
    }),

    defineField({
      name: 'medium',
      title: 'Medium (i18n)',
      type: 'object',
      group: 'physical',
      description: 'Example: Oil on linen',
      options: { collapsible: true, collapsed: false },
      fields: [
        { name: 'en', title: 'English', type: 'string' },
        { name: 'zh', title: '中文', type: 'string' },
      ],
    }),

    // ─────────────────────────────────────────────
    // GROUP: Media
    // ─────────────────────────────────────────────
    defineField({
      name: 'mainImage',
      title: 'Main image',
      type: 'image',
      group: 'media',
      options: { hotspot: true, metadata: ['lqip'] },
      fields: [
        { name: 'alt', title: 'Alt text', type: 'string', validation: (R) => R.required() },
        { name: 'caption', title: 'Caption (optional)', type: 'string' },
      ],
      validation: (R) => R.required(),
    }),

    defineField({
      name: 'gallery',
      title: 'UHD gallery',
      type: 'array',
      group: 'media',
      description: 'Recommended: full front, 2× detail, side view or room mockup.',
      of: [
        {
          type: 'object',
          name: 'galleryImage',
          title: 'Gallery image',
          preview: {
            select: { media: 'image', title: 'purpose' },
            prepare: ({ media, purpose }) => ({ media, title: purpose ?? '(Unlabeled)' }),
          },
          fields: [
            {
              name: 'image',
              title: 'Image',
              type: 'image',
              options: { hotspot: true, metadata: ['lqip', 'palette'] },
              validation: (R) => R.required(),
            },
            { name: 'alt', title: 'Alt text', type: 'string', validation: (R) => R.required() },
            {
              name: 'purpose',
              title: 'Purpose',
              type: 'string',
              options: {
                list: [
                  { title: 'Full Front', value: 'full_front' },
                  { title: 'Detail', value: 'detail' },
                  { title: 'Side View', value: 'side' },
                  { title: 'Room Mockup', value: 'room_mockup' },
                  { title: 'Framed View', value: 'framed' },
                  { title: 'Back / Signature', value: 'back' },
                  { title: 'Packaging', value: 'packaging' },
                ],
              },
            },
            { name: 'sortOrder', title: 'Sort order', type: 'number', initialValue: 99 },
          ],
        },
      ],
    }),

    // ─────────────────────────────────────────────
    // GROUP: Shipping
    // ─────────────────────────────────────────────
    defineField({
      name: 'shippingFormat',
      title: 'Shipping format',
      type: 'string',
      group: 'shipping',
      options: {
        list: [
          { title: 'Rolled — remove stretcher bars, ship in tube', value: 'rolled' },
          { title: 'Stretched — on stretcher bars, ready to hang', value: 'stretched' },
          { title: 'Framed — with premium frame', value: 'framed' },
          { title: 'Optional — customer chooses at checkout', value: 'optional' },
        ],
        layout: 'radio',
      },
      initialValue: 'rolled',
      validation: (R) => R.required(),
    }),

    defineField({
      name: 'shippingFormatNote',
      title: 'Shipping note (i18n)',
      type: 'object',
      group: 'shipping',
      options: { collapsible: true, collapsed: true },
      fields: [
        { name: 'en', title: 'English', type: 'text', rows: 2 },
        { name: 'zh', title: '中文', type: 'text', rows: 2 },
      ],
    }),

    defineField({
      name: 'originCountry',
      title: 'Origin country/region',
      type: 'string',
      group: 'shipping',
      initialValue: 'CN',
      description: 'ISO 3166-1 alpha-2 (e.g., CN / HK / US)',
    }),

    defineField({
      name: 'estimatedProductionDays',
      title: 'Production lead time (business days)',
      type: 'number',
      group: 'shipping',
      initialValue: 3,
    }),

    defineField({
      name: 'preShipmentConfirmation',
      title: 'Pre-shipment confirmation media',
      type: 'object',
      group: 'shipping',
      options: { collapsible: true, collapsed: true },
      fields: [
        {
          name: 'status',
          title: 'Status',
          type: 'string',
          options: {
            list: [
              { title: 'Pending', value: 'pending' },
              { title: 'Uploaded', value: 'uploaded' },
              { title: 'Confirmed', value: 'confirmed' },
              { title: 'Reshoot requested', value: 'reshoot' },
            ],
            layout: 'radio',
          },
          initialValue: 'pending',
        },
        {
          name: 'confirmationImages',
          title: 'Confirmation images (3–5 recommended)',
          type: 'array',
          of: [
            {
              type: 'image',
              options: { hotspot: true },
              fields: [
                { name: 'alt', title: 'Alt', type: 'string' },
                { name: 'caption', title: 'Caption', type: 'string' },
              ],
            },
          ],
        },
        { name: 'confirmationVideo', title: 'Confirmation video', type: 'file', options: { accept: 'video/*' } },
        { name: 'confirmationVideoUrl', title: 'External video URL', type: 'url' },
        {
          name: 'buyerNote',
          title: 'Buyer note (read-only)',
          type: 'text',
          rows: 2,
          readOnly: true,
          description: 'Synced from customer side. Do not edit manually.',
        },
        { name: 'uploadedAt', title: 'Uploaded at', type: 'datetime' },
      ],
    }),

    // ─────────────────────────────────────────────
    // GROUP: SEO
    // ─────────────────────────────────────────────
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'object',
      group: 'seo',
      options: { collapsible: true, collapsed: true },
      fields: [
        { name: 'metaTitle', title: 'Meta title', type: 'string', validation: (R) => R.max(70) },
        { name: 'metaDescription', title: 'Meta description', type: 'text', rows: 2, validation: (R) => R.max(160) },
        { name: 'ogImage', title: 'Open Graph image', type: 'image' },
      ],
    }),
  ],
})

export default {
  name: 'review',
  title: 'Review',
  type: 'document',
  fields: [
    {
      name: 'complianceNote',
      title: 'Compliance note',
      type: 'string',
      readOnly: true,
      initialValue: 'Publish only real collector feedback. Do not create fake reviews or suppress honest negative reviews.',
    },
    { name: 'artwork', title: 'Artwork', type: 'reference', to: [{ type: 'artwork' }], validation: (Rule: any) => Rule.required() },
    { name: 'artist', title: 'Artist', type: 'reference', to: [{ type: 'artist' }] },
    { name: 'verifiedBuyer', title: 'Verified buyer', type: 'boolean', initialValue: true },
    {
      name: 'orderIdInternal',
      title: 'Internal order ID',
      type: 'string',
      description: 'Internal only. Required for manual_verified reviews; never shown publicly.',
    },
    {
      name: 'customerEmailHash',
      title: 'Customer email hash',
      type: 'string',
      description: 'Internal only. Store a hash, not the raw customer email.',
    },
    {
      name: 'reviewSource',
      title: 'Review source',
      type: 'string',
      initialValue: 'manual_verified',
      options: {
        list: [
          { title: 'Purchase invite', value: 'purchase_invite' },
          { title: 'Manual verified', value: 'manual_verified' },
          { title: 'Imported verified', value: 'imported_verified' },
        ],
      },
      validation: (Rule: any) => Rule.required(),
    },
    { name: 'customerName', title: 'Display name', type: 'string', validation: (Rule: any) => Rule.required() },
    { name: 'customerCity', title: 'City', type: 'string' },
    { name: 'customerCountry', title: 'Country', type: 'string', validation: (Rule: any) => Rule.required() },
    { name: 'overallRating', title: 'Overall rating', type: 'number', validation: ratingRule },
    { name: 'artworkQualityRating', title: 'Artwork quality rating', type: 'number', validation: ratingRule },
    { name: 'textureColorAccuracyRating', title: 'Texture & color accuracy rating', type: 'number', validation: ratingRule },
    { name: 'packagingDeliveryRating', title: 'Packaging & delivery rating', type: 'number', validation: ratingRule },
    { name: 'customerSupportRating', title: 'Customer support rating', type: 'number', validation: ratingRule },
    { name: 'roomFitRating', title: 'Room fit rating', type: 'number', validation: ratingRule },
    { name: 'reviewTitle', title: 'Review title', type: 'string', validation: (Rule: any) => Rule.required() },
    { name: 'reviewText', title: 'Review text', type: 'text', validation: (Rule: any) => Rule.required().min(20) },
    {
      name: 'roomType',
      title: 'Room type',
      type: 'string',
      options: {
        list: ['Living Room', 'Bedroom', 'Dining Room', 'Office', 'Entryway', 'Studio', 'Other'],
      },
    },
    {
      name: 'photos',
      title: 'Collector photos',
      type: 'array',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            { name: 'alt', title: 'Alt text', type: 'string', validation: (Rule: any) => Rule.required() },
          ],
        },
      ],
    },
    {
      name: 'cloudflarePhotos',
      title: 'Cloudflare collector photos',
      type: 'array',
      description: 'R2-hosted review photo metadata. The website prefers these URLs and falls back to Sanity photos.',
      of: [{ type: 'cloudflareAsset' }],
    },
    { name: 'videoUrl', title: 'Video URL', type: 'url' },
    { name: 'displayPermission', title: 'Display permission', type: 'boolean', initialValue: false },
    { name: 'photoPermission', title: 'Photo display permission', type: 'boolean', initialValue: false },
    {
      name: 'status',
      title: 'Moderation status',
      type: 'string',
      initialValue: 'pending',
      options: {
        list: [
          { title: 'Pending', value: 'pending' },
          { title: 'Approved', value: 'approved' },
          { title: 'Rejected', value: 'rejected' },
        ],
      },
      validation: (Rule: any) => Rule.required(),
    },
    { name: 'rejectionReason', title: 'Rejection reason', type: 'text' },
    { name: 'featured', title: 'Featured', type: 'boolean', initialValue: false },
    { name: 'featuredOnHome', title: 'Featured on home', type: 'boolean', initialValue: false },
    { name: 'featuredOnGallery', title: 'Featured on real homes gallery', type: 'boolean', initialValue: false },
    { name: 'sortOrder', title: 'Sort order', type: 'number', initialValue: 0 },
    {
      name: 'language',
      title: 'Language',
      type: 'string',
      initialValue: 'en',
      options: { list: ['en', 'zh'] },
    },
    { name: 'storeReply', title: 'Store reply', type: 'text' },
    { name: 'submittedAt', title: 'Submitted at', type: 'datetime', initialValue: () => new Date().toISOString() },
    { name: 'approvedAt', title: 'Approved at', type: 'datetime' },
  ],
  preview: {
    select: {
      title: 'reviewTitle',
      subtitle: 'customerName',
      status: 'status',
      artwork: 'artwork.title.en',
      rating: 'overallRating',
    },
    prepare(selection: any) {
      const status = selection.status ? `[${selection.status}] ` : ''
      const rating = selection.rating ? `${selection.rating}/5` : 'No rating'
      return {
        title: `${status}${selection.title || 'Collector review'}`,
        subtitle: `${selection.subtitle || 'Collector'} - ${selection.artwork || 'Artwork'} - ${rating}`,
      }
    },
  },
}

function ratingRule(Rule: any) {
  return Rule.required().min(1).max(5).precision(1)
}

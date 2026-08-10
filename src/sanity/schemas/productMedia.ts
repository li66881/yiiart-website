const mediaRoles = [
  { title: 'Clean front view', value: 'front' },
  { title: 'Original artwork photo', value: 'original' },
  { title: 'Texture detail', value: 'detail' },
  { title: 'Living room scene', value: 'living_room' },
  { title: 'Angle / edge view', value: 'angle' },
  { title: 'Bedroom scene', value: 'bedroom' },
  { title: 'Dining room scene', value: 'dining_room' },
  { title: 'Studio process', value: 'process' },
  { title: 'Scale guide', value: 'scale' },
  { title: 'Other', value: 'other' },
]

export default {
  name: 'productMedia',
  title: 'Product media',
  type: 'object',
  fields: [
    {
      name: 'mediaType',
      title: 'Media type',
      type: 'string',
      initialValue: 'image',
      validation: (Rule: any) => Rule.required(),
      options: {
        layout: 'radio',
        list: [
          { title: 'Image', value: 'image' },
          { title: 'Video', value: 'video' },
        ],
      },
    },
    {
      name: 'role',
      title: 'Storefront role',
      type: 'string',
      initialValue: 'other',
      validation: (Rule: any) => Rule.required(),
      options: { list: mediaRoles },
    },
    { name: 'url', title: 'Public media URL', type: 'url', validation: (Rule: any) => Rule.required() },
    { name: 'posterUrl', title: 'Video poster URL', type: 'url' },
    { name: 'key', title: 'R2 object key', type: 'string' },
    { name: 'contentType', title: 'Content type', type: 'string' },
    { name: 'alt', title: 'Image alt text / video label', type: 'string' },
    { name: 'width', title: 'Pixel width', type: 'number' },
    { name: 'height', title: 'Pixel height', type: 'number' },
    { name: 'sortOrder', title: 'Display order', type: 'number' },
    {
      name: 'sourceFolder',
      title: 'Source folder code',
      type: 'string',
      description: 'Example: 80-120-13. Used by the audited bulk media workflow.',
    },
    {
      name: 'sourceNote',
      title: 'Source / provenance note',
      type: 'string',
      description: 'Record who created or supplied the media and any relevant approval note.',
    },
    {
      name: 'approvedForStorefront',
      title: 'Approved for storefront',
      type: 'boolean',
      initialValue: false,
      description: 'Only approved product media is used by the public gallery.',
    },
  ],
  preview: {
    select: {
      mediaType: 'mediaType',
      role: 'role',
      alt: 'alt',
      approved: 'approvedForStorefront',
    },
    prepare({ mediaType, role, alt, approved }: any) {
      const roleTitle = mediaRoles.find((item) => item.value === role)?.title || role || 'Product media'
      return {
        title: alt || roleTitle,
        subtitle: `${mediaType === 'video' ? 'Video' : 'Image'} · ${approved ? 'Approved' : 'Needs approval'}`,
      }
    },
  },
}

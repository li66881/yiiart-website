export default {
  name: 'artworkGalleryAsset',
  title: 'Artwork gallery asset',
  type: 'object',
  fields: [
    {
      name: 'role',
      title: 'Role',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
      options: {
        list: [
          { title: 'Room visualization', value: 'room' },
          { title: 'Full artwork', value: 'artwork' },
          { title: 'Texture detail', value: 'texture' },
          { title: 'Edge or presentation detail', value: 'edge' },
        ],
      },
    },
    { name: 'alt', title: 'Alt text', type: 'string' },
    { name: 'image', title: 'Sanity image', type: 'image', options: { hotspot: true } },
    { name: 'url', title: 'R2 or public URL', type: 'url' },
  ],
}

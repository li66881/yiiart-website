export default {
  name: 'cloudflareAsset',
  title: 'Cloudflare asset',
  type: 'object',
  fields: [
    { name: 'url', title: 'Public URL', type: 'url', validation: (Rule: any) => Rule.required() },
    { name: 'key', title: 'R2 object key', type: 'string' },
    { name: 'alt', title: 'Alt text', type: 'string' },
    { name: 'contentType', title: 'Content type', type: 'string' },
  ],
}

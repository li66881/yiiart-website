export default {
  name: 'artist',
  title: 'Artist',
  type: 'document',
  fields: [
    { name: 'name', title: 'Name', type: 'object', fields: [
        { name: 'zh', title: 'Chinese', type: 'string' },
        { name: 'en', title: 'English', type: 'string' },
    ]},
    { name: 'slug', title: 'Slug', type: 'slug', options: { source: 'name.zh' }},
    { name: 'image', title: 'Photo', type: 'image', options: { hotspot: true }},
    { name: 'location', title: 'City/Location', type: 'string'},
    { name: 'bio', title: 'Biography', type: 'object', fields: [
        { name: 'zh', title: 'Chinese', type: 'text' },
        { name: 'en', title: 'English', type: 'text' },
    ]},
    { name: 'style', title: 'Style', type: 'array', of: [{ type: 'string' }],
      options: { list: ['Abstract', 'Landscape', 'Portrait', 'Texture', 'Wabi-sabi', 'Minimalist']}},
  ],
}

export default {
  name: 'artwork',
  title: 'Artwork',
  type: 'document',
  fields: [
    { name: 'title', title: 'Title', type: 'object', fields: [
        { name: 'zh', title: 'Chinese', type: 'string' },
        { name: 'en', title: 'English', type: 'string' },
    ]},
    { name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title.zh' }},
    { name: 'artist', title: 'Artist', type: 'reference', to: [{ type: 'artist' }]},
    { name: 'price', title: 'Price (CNY)', type: 'number'},
    { name: 'dimensions', title: 'Dimensions', type: 'string', description: 'e.g. 60×80cm'},
    { name: 'medium', title: 'Medium', type: 'string',
      options: { list: ['Oil on Canvas', 'Acrylic on Canvas', 'Oil on Panel', 'Mixed Media'] }},
    { name: 'category', title: 'Category', type: 'string',
      options: { list: ['Abstract', 'Landscape', 'Portrait', 'Texture', 'Wabi-sabi', 'Minimalist'] }},
    { name: 'images', title: 'Images', type: 'array', of: [{ type: 'image', options: { hotspot: true } }]},
    { name: 'description', title: 'Description', type: 'object', fields: [
        { name: 'zh', title: 'Chinese', type: 'text' },
        { name: 'en', title: 'English', type: 'text' },
    ]},
    { name: 'featured', title: 'Featured', type: 'boolean', initialValue: false},
  ],
}

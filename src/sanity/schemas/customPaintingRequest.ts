export default {
  name: 'customPaintingRequest',
  title: 'Custom Painting Request',
  type: 'document',
  fields: [
    { name: 'requestReference', title: 'Request Reference', type: 'string', validation: (Rule: any) => Rule.required() },
    { name: 'customerName', title: 'Customer Name', type: 'string', validation: (Rule: any) => Rule.required() },
    { name: 'customerEmail', title: 'Customer Email', type: 'string', validation: (Rule: any) => Rule.required() },
    { name: 'artworkSize', title: 'Artwork Size', type: 'string' },
    { name: 'preferredColors', title: 'Preferred Colors', type: 'string' },
    { name: 'roomType', title: 'Room Type', type: 'string' },
    { name: 'budget', title: 'Budget', type: 'string' },
    { name: 'message', title: 'Project Details', type: 'text', rows: 5 },
    { name: 'referenceImages', title: 'Reference Images', type: 'array', of: [{ type: 'cloudflareAsset' }] },
    {
      name: 'status',
      title: 'Status',
      type: 'string',
      initialValue: 'new',
      options: {
        list: [
          { title: 'New', value: 'new' },
          { title: 'Contacted', value: 'contacted' },
          { title: 'Quoted', value: 'quoted' },
          { title: 'In production', value: 'in-production' },
          { title: 'Closed', value: 'closed' },
        ],
      },
    },
    { name: 'source', title: 'Source', type: 'string', readOnly: true },
    {
      name: 'notificationStatus',
      title: 'Notification Status',
      type: 'string',
      options: {
        list: [
          { title: 'Pending', value: 'pending' },
          { title: 'Sent', value: 'sent' },
          { title: 'Skipped', value: 'skipped' },
          { title: 'Failed', value: 'failed' },
        ],
      },
    },
    { name: 'submittedAt', title: 'Submitted At', type: 'datetime' },
    { name: 'internalNotes', title: 'Internal Notes', type: 'text', rows: 5 },
  ],
  orderings: [
    {
      title: 'Newest first',
      name: 'submittedAtDesc',
      by: [{ field: 'submittedAt', direction: 'desc' }],
    },
  ],
  preview: {
    select: {
      reference: 'requestReference',
      name: 'customerName',
      status: 'status',
    },
    prepare({ reference, name, status }: any) {
      return {
        title: `${reference || 'Custom request'} - ${name || 'Unknown customer'}`,
        subtitle: status || 'new',
      }
    },
  },
}

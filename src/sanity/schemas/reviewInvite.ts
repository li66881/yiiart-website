export default {
  name: 'reviewInvite',
  title: 'Review Invite',
  type: 'document',
  fields: [
    {
      name: 'complianceNote',
      title: 'Compliance note',
      type: 'string',
      readOnly: true,
      initialValue: 'Invite links are for real customers only. Reviews submitted from invites must be moderated before publication.',
    },
    { name: 'artwork', title: 'Artwork', type: 'reference', to: [{ type: 'artwork' }], validation: (Rule: any) => Rule.required() },
    { name: 'orderIdInternal', title: 'Internal order ID', type: 'string', validation: (Rule: any) => Rule.required() },
    { name: 'customerEmailHash', title: 'Customer email hash', type: 'string', validation: (Rule: any) => Rule.required() },
    { name: 'customerName', title: 'Customer name', type: 'string' },
    { name: 'token', title: 'Token', type: 'string', validation: (Rule: any) => Rule.required() },
    { name: 'expiresAt', title: 'Expires at', type: 'datetime', validation: (Rule: any) => Rule.required() },
    { name: 'usedAt', title: 'Used at', type: 'datetime' },
    {
      name: 'status',
      title: 'Status',
      type: 'string',
      initialValue: 'active',
      options: {
        list: [
          { title: 'Active', value: 'active' },
          { title: 'Used', value: 'used' },
          { title: 'Expired', value: 'expired' },
        ],
      },
      validation: (Rule: any) => Rule.required(),
    },
  ],
  preview: {
    select: {
      artwork: 'artwork.title.en',
      orderId: 'orderIdInternal',
      status: 'status',
      expiresAt: 'expiresAt',
    },
    prepare(selection: any) {
      return {
        title: `${selection.artwork || 'Artwork'} review invite`,
        subtitle: `${selection.status || 'active'} - ${selection.orderId || 'No order'} - expires ${selection.expiresAt || 'unset'}`,
      }
    },
  },
}

export default {
  name: 'newsletterSubscriber',
  title: 'Newsletter Subscriber',
  type: 'document',
  fields: [
    { name: 'email', title: 'Email', type: 'string' },
    { name: 'source', title: 'Source', type: 'string' },
    { name: 'subscribedAt', title: 'Subscribed At', type: 'datetime' },
    { name: 'lastSubscribedAt', title: 'Last Subscribed At', type: 'datetime' },
  ],
}

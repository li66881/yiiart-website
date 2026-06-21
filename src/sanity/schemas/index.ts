import { type SchemaTypeDefinition } from 'sanity'
import artist from './artist'
import artwork from './artwork'
import cloudflareAsset from './cloudflareAsset'
import newsletterSubscriber from './newsletterSubscriber'
import review from './review'
import reviewInvite from './reviewInvite'

export const schemaTypes: SchemaTypeDefinition[] = [artist, artwork, cloudflareAsset, newsletterSubscriber, review, reviewInvite]

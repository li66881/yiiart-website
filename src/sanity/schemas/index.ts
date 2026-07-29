import { type SchemaTypeDefinition } from 'sanity'
import artist from './artist'
import artwork from './artwork'
import cloudflareAsset from './cloudflareAsset'
import customRequest from './customRequest'
import newsletterSubscriber from './newsletterSubscriber'
import productMedia from './productMedia'
import review from './review'
import reviewInvite from './reviewInvite'

export const schemaTypes: SchemaTypeDefinition[] = [artist, artwork, cloudflareAsset, productMedia, customRequest, newsletterSubscriber, review, reviewInvite]

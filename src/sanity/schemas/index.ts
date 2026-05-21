import { type SchemaTypeDefinition } from 'sanity'
import artist from './artist'
import artwork from './artwork'
import newsletterSubscriber from './newsletterSubscriber'

export const schemaTypes: SchemaTypeDefinition[] = [artist, artwork, newsletterSubscriber]

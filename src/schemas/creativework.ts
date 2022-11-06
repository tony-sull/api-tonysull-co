import { z } from 'zod'
import * as Base from './thing.js'
import type { Schema as Person } from './person.js'
import { zc } from '../utils/zod.js'

function createSchema() {
    return Base.schema.extend({
        '@type': z.literal('Publication'),
        abstract: z
            .string()
            .optional()
            .describe(
                'An abstract is a short description that summarizes a CreativeWork.'
            ),
        author: zc
            .relation<Person>('Person')
            .describe('The author of this content or rating.'),
        dateCreated: zc
            .safeDate()
            .optional()
            .describe(
                'The date on which the CreativeWork was created or the item was added to a DataFeed.'
            ),
        dateModified: zc
            .safeDate()
            .optional()
            .describe(
                'The date on which the CreativeWork was most recently modified.'
            ),
        datePublished: zc
            .safeDate()
            .optional()
            .describe('Date of first broadcast/publication.'),
        encodingType: z
            .string()
            .optional() // TODO validate mime type
            .describe('Media type typically expressed using a MIME format'),
        headline: z.string().optional().describe('Headline of the article.'),
        keywords: z
            .array(z.string())
            .optional()
            .describe('Keywords or tags used to describe some item.'),
        text: z
            .string()
            .optional()
            .describe('The textual content of this CreativeWork.')
    })
}

export const schema = createSchema()

export type Schema = z.infer<typeof schema>

export function parse(thing: unknown) {
    return schema.parseAsync(thing)
}

export function stringify(thing: Schema) {
    return JSON.stringify(thing, null, 2)
}

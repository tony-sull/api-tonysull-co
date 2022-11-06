import { z } from 'zod'
import type { Schema as Article } from './article.js'
import * as Base from './creativework.js'
import { zc } from '../utils/zod.js'

function createSchema() {
    return Base.schema.extend({
        '@type': z.literal('Publication'),
        '@graph': zc
            .relationMany<Article>('Article')
            .describe('List of articles in the series or publication.'),
        description: z
            .string()
            .min(1)
            .describe('A description of the publication.')
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

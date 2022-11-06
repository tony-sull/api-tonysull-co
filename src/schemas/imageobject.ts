import { z } from 'zod'
import * as Base from './mediaobject.js'

function createSchema() {
    return Base.schema.extend({
        '@type': z.literal('ImageObject'),
        caption: z.string().describe('The caption for this image.'),
        height: z
            .number()
            .min(1)
            .optional()
            .describe('The height of the item.'),
        width: z.number().min(1).optional().describe('The width of the item.')
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

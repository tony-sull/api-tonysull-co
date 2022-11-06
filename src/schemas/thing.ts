import type { z } from 'zod'
import * as Base from './base.js'
import type { Schema as ImageObject } from './imageobject.js'
import { zc } from '../utils/zod.js'

export function createSchema() {
    return Base.schema.extend({
        image: zc
            .relation<ImageObject>('ImageObject')
            .optional()
            .describe('An image of the item.'),
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

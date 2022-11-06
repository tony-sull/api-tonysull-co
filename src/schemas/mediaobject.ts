import { z } from 'zod'
import * as Base from './base.js'
import { zc } from '../utils/zod.js'

function createSchema() {
    return Base.schema.extend({
        '@type': z.literal('MediaObject'),
        contentSize: z.string().describe('File size in kilobytes (kB).'),
        contentUrl: zc
            .safeUrl()
            .describe(
                'Actual bytes of the media object, for example the image file or video file.'
            ),
        height: z
            .number()
            .min(1)
            .optional()
            .describe('The height of the item.'),
        uploadDate: zc
            .safeDate()
            .optional()
            .describe('Date when this media object was uploaded to this site.'),
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

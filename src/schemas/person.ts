import { z } from 'zod'
import * as Base from './thing.js'

function createSchema() {
    return Base.schema.extend({
        '@type': z.literal('Person'),
        email: z.string().email().optional().describe('Email address'),
        familyName: z
            .string()
            .optional()
            .describe('Family name. In the U.S., the last name of a Person.'),
        givenName: z
            .string()
            .optional()
            .describe('Given name. In the U.S., the first name of a Person. ')
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

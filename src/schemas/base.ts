import { z } from 'zod'

export function createSchema() {
    return z.object({
        '@type': z.literal('Thing').describe('Schema identifier type.'),
        description: z
            .string()
            .min(1)
            .optional()
            .describe('A description of the item.'),
        identifier: z
            .string()
            .url()
            .describe(
                'The identifier property represents any kind of identifier for any kind of Thing, such as ISBNs, GTIN codes, UUIDs etc.'
            ),
        name: z.string().min(1).describe('The name of the item.'),
        sameAs: z
            .string()
            .url()
            .optional()
            .describe(
                "URL of a reference Web page that unambiguously indicates the item's identity."
            ),
        url: z.string().url().describe('URL of the item.')
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

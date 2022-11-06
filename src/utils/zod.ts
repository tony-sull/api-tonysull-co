import { z } from 'zod'
import { fetchOne } from '../api/index.js'
import { Maybe, MaybeType } from '../utils/maybe.js'
import { isUrl } from '../utils/url.js'

function relationMany<T>(type: string) {
    return z.array(relation<T>(type)) as z.ZodArray<
        z.ZodEffects<z.ZodString, T>,
        'many'
    >
}

function relation<T>(type: string): z.ZodEffects<z.ZodString, T | undefined> {
    return z.string().transform(async (slug: string) => {
        const maybeContent: Maybe<T> = await fetchOne<any>(type as any, slug)

        return maybeContent.type === MaybeType.Just
            ? maybeContent.value
            : undefined
    })
}

function safeDate() {
    return z.date().or(z.string().transform((value) => new Date(value)))
}

function safeUrl(root: string | URL = import.meta.env.SITE) {
    return z.string().transform((value: string) => {
        try {
            return isUrl(value) ? value : new URL(value, root).toString()
        } catch {
            return undefined
        }
    })
}

export const zc = {
    relation,
    relationMany,
    safeDate,
    safeUrl
}

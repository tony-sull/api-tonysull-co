import type { MarkdownInstance } from 'astro'
import yaml from 'js-yaml'
import { parserForType } from '../schemas/index.js'
import type { Schema } from '../schemas/index.js'
import { Just, MaybeType, Nothing } from '../utils/maybe.js'
import type { Maybe } from '../utils/maybe.js'
import readingTime from '../utils/reading-time.js'

const mdCache = import.meta.glob<MarkdownInstance<any>>('/content/*/*.md')
const yamlCache = import.meta.glob<string>('/content/**/*.yaml', { as: 'raw' })

async function fetchMarkdown<T extends Schema>(
    type: T['@type'],
    slug: string,
    eager = true
) {
    const key = `/content/${type}/${slug}.md`

    if (!(key in mdCache)) {
        return Nothing()
    }

    const md = await mdCache[key]()

    const articleBody = eager ? md.rawContent().trim() : undefined
    const wordCount = articleBody && readingTime(articleBody).words.total

    return {
        ...md.frontmatter,
        articleBody,
        wordCount
    }
}

async function fetchYaml<T extends Schema>(type: T['@type'], slug: string) {
    const key = `/content/${type}/${slug}.yaml`

    if (!(key in yamlCache)) {
        return Nothing()
    }

    const rawYaml = await yamlCache[key]()
    const frontmatter = yaml.load(rawYaml)

    if (!frontmatter) {
        return Nothing()
    }

    return frontmatter
}

export async function fetchOne<T extends Schema>(
    type: T['@type'],
    slug: string,
    eager = true
): Promise<Maybe<T>> {
    let rawContent = await fetchMarkdown(type, slug, eager)

    if (rawContent.type === MaybeType.Nothing) {
        rawContent = await fetchYaml(type, slug)
    }

    if (rawContent.type === MaybeType.Nothing) {
        return rawContent
    }

    const parser = parserForType(type)

    return Just(
        (await parser({
            ...rawContent,
            '@type': type,
            identifier: new URL(
                `/${type}/${slug}`,
                import.meta.env.SITE
            ).toString(),
            url: new URL(`/${type}/${slug}`, import.meta.env.SITE).toString()
        })) as T
    )
}

export async function fetchAll(): Promise<Schema[]> {
    const mdRegex = new RegExp(`^/content/(.+)/(.+).md`)
    const yamlRegex = new RegExp(`^/content/(.+)/(.+?).yaml`)

    const mdEntries = Object.keys(mdCache).reduce((acc, next) => {
        const [, type, match] = next.match(mdRegex) || []

        if (type && match) {
            acc.push(
                fetchOne<Schema>(type as Schema['@type'], match, false).then((maybe) =>
                    maybe.type === MaybeType.Just ? maybe.value : undefined
                )
            )
        }

        return acc
    }, [] as Promise<Schema | undefined>[])

    const yamlEntries = Object.keys(yamlCache).reduce((acc, next) => {
        const [, type, match] = next.match(yamlRegex) || []

        if (type && match) {
            acc.push(
                fetchOne<Schema>(type as Schema['@type'], match, false).then((maybe) =>
                    maybe.type === MaybeType.Just ? maybe.value : undefined
                )
            )
        }

        return acc
    }, [] as Promise<Schema | undefined>[])

    const results = await Promise.all(mdEntries.concat(yamlEntries))

    return results.filter(Boolean) as Schema[]
}

export async function fetchAllBySchema<T extends Schema>(
    type: T['@type']
): Promise<T[]> {
    const mdRegex = new RegExp(`^/content/${type}/(.+).md`)
    const yamlRegex = new RegExp(`^/content/${type}/(.+?).yaml`)

    const mdEntries = Object.keys(mdCache).reduce((acc, next) => {
        const [, match] = next.match(mdRegex) || []

        if (match) {
            acc.push(
                fetchOne<T>(type, match, false).then((maybe) =>
                    maybe.type === MaybeType.Just ? maybe.value : undefined
                )
            )
        }

        return acc
    }, [] as Promise<T | undefined>[])

    const yamlEntries = Object.keys(yamlCache).reduce((acc, next) => {
        const [, match] = next.match(yamlRegex) || []

        if (match) {
            acc.push(
                fetchOne<T>(type, match, false).then((maybe) =>
                    maybe.type === MaybeType.Just ? maybe.value : undefined
                )
            )
        }

        return acc
    }, [] as Promise<T | undefined>[])

    const results = await Promise.all(mdEntries.concat(yamlEntries))

    return results.filter(Boolean) as T[]
}

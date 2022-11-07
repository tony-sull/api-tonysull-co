import * as Article from './article.js'
import * as ImageObject from './imageobject.js'
import * as Person from './person.js'
import * as Periodical from './periodical.js'
import * as Thing from './thing.js'

export type Schema =
    | Article.Schema
    | ImageObject.Schema
    | Person.Schema
    | Periodical.Schema
    | Thing.Schema

export function schemaForType<T extends Schema>(type: T['@type']) {
    switch (type) {
        case 'Article':
            return Article.schema
        case 'ImageObject':
            return ImageObject.schema
        case 'Person':
            return Person.schema
        case 'Periodical':
            return Periodical.schema
        case 'Thing':
            return Thing.schema
        default:
            throw new Error(`[schemaForType] "${type}" type not found!`)
    }
}

export function parserForType<T extends Schema>(type: T['@type']) {
    switch (type) {
        case 'Article':
            return Article.parse
        case 'ImageObject':
            return ImageObject.parse
        case 'Person':
            return Person.parse
        case 'Periodical':
            return Periodical.parse
        case 'Thing':
            return Thing.parse
        default:
            throw new Error(`[parserForType] "${type}" type not found!`)
    }
}

export function stringify<T extends Schema>(thing: T) {
    switch (thing['@type']) {
        case 'Article':
            return Article.stringify(thing)
        case 'ImageObject':
            return ImageObject.stringify(thing)
        case 'Person':
            return Person.stringify(thing)
        case 'Periodical':
            return Periodical.stringify(thing)
        case 'Thing':
            return Thing.stringify(thing)
        default:
            throw new Error(`[stringify] "${thing['@type']}" not found!`)
    }
}

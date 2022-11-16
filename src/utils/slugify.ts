export function parseIdentifier(identifier: string) {
    const parts = identifier.split('/')
    return {
        '@type': parts.slice(-2),
        slug: parts.slice(-1)
    }
}

export function identifierToSlug(identifier: string) {
    return parseIdentifier(identifier).slug
}
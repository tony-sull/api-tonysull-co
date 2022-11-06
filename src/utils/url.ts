const URL_REGEX =
    /(http(s)?:)?\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&\/\/=]*)/

export function isUrl(value: string) {
    return URL_REGEX.test(value)
}

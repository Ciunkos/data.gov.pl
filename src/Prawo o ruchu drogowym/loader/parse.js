const isListItem = str =>
    /^[\[|<]?[0-9]*[a-z]?(\.|\))\s?/gm.test(str)

const replaceAll = (search, replacement) => target =>
    target.replace(new RegExp(search, 'g'), replacement);

const isSectionHeader = str =>
    str.startsWith('Rozdział') ||
    str.startsWith('Oddział') ||
    str.startsWith('DZIAŁ')

const find = (lines, f) => {
    const index = lines.findIndex(x => x && f(x))
    if (index >= 0) {
        return [lines.slice(0, index), lines.slice(index)]
    }
    return [lines, []]
}

const createElementJson = type => props => children => ({
    type,
    props: Object.entries(props)
        // filter out falsy values
        .filter(x => x[1])
        .reduce((acc, curr) => ({ ...acc, [curr[0]]: curr[1] }), {}),
    children
})

const isArticle = str =>
    str.startsWith('Art. ') ||
    str.startsWith('<Art. ') ||
    str.startsWith('[Art. ')

const mergeMultipleLines = lines => replaceAll('\n', ' ')(lines.join(' '))
const toSentenceCase = string =>
    `${string.substring(0, 1).toUpperCase()}${string.substring(1)}`

const splitFirst = x => string => {
    const indexOf = string.indexOf(x)
    if(indexOf !== -1) {
        return [string.substring(0, indexOf), string.substring(indexOf + 1)]
    }
    return [string, '']
}

export default (str) => {
    const lines = str.split('\n')
    const process = ([line, nextLine, ...rest]) => {
        if (!line) {
            return []
        }

        if (isArticle(line)) {
            const nextArticleOrSection = find(
                [nextLine, ...rest],
                x => isArticle(x) || isSectionHeader(x)
            )
            const [articleBody, other] = nextArticleOrSection

            const [title, body] = find(
                articleBody,
                x => isArticle(x) || isSectionHeader(x) || isListItem(x)
            )

            return [
                createElementJson('Article')({ label: line, title: mergeMultipleLines(title) })(
                    process(body)
                ),
                ...(other ? process(other) : [])
            ]
        } else if (isSectionHeader(line)) {
            const sectionTypes = [
                'DZIAŁ',
                'Rozdział',
                'Oddział'
            ]

            const sectionTypeOf = line => sectionTypes.indexOf(line.split(' ')[0])
            const sectionType = sectionTypeOf(line)

            const nextSection = find(
                [nextLine, ...rest],
                x => isSectionHeader(x) && sectionType === sectionTypeOf(x)
            )
            const [articleBody, other] = nextSection

            const [title, body] = find(
                articleBody,
                x => isArticle(x) || isSectionHeader(x) || isListItem(x)
            )

            return [
                createElementJson('Section')({ label: line, title: mergeMultipleLines(title) })(
                    process(body)
                ),
                ...(other ? process(other) : [])
            ]
        } else if (isListItem(line)) {
            const listGroup = (line) => {
                // there are different list groups, for example:
                // 1)
                // 2)
                // 1.
                // 2.
                // 1a)
                // 1b.
                // a
                // b
                const id = line.split(' ')[0]
                const brace = id.endsWith(')')
                const dot = id.endsWith('.')
                const numbered = /^[<|[]*[0-9]/.test(line)

                return `${numbered}${brace}${dot}`
            }

            const isSameGroup = (a, b) =>
                listGroup(a) === listGroup(b)

            const nextListItemOfTheSameGroupOrSection = find(
                [nextLine, ...rest],
                x => (isListItem(x) && isSameGroup(x, line)) || isArticle(x) || isSectionHeader(x)
            )
            const [articleBody, other] = nextListItemOfTheSameGroupOrSection

            const [label, subList] = find(
                articleBody,
                x => isListItem(x)
            )

            const body = mergeMultipleLines([line, ...label])

            const [listItemLabel, title] = splitFirst(' ')(body)
            const trimmedTitle = title.trim();

            return [
                createElementJson('Rule')({ label: listItemLabel, title: trimmedTitle })(
                    process(subList)
                ),
                ...(other ? process(other) : [])
            ]
        }

        return [
            line,
            ...(nextLine ? process([nextLine, ...rest]) : [])
        ]
    }

    const [meta1, meta2, meta3, meta4, ...data] = lines.map(x => x.trim())
    const metadata = {
        title: meta4,
        description: toSentenceCase(
            [meta2.toLowerCase(), meta3].join(' ')
        ),
        publishedAt: meta1
    }
    return createElementJson('Document')(metadata)(
        process(data)
    )
}

import replaceLineBreaksRegex from './replaceLineBreaksRegex'

const matchWith = regex => (str) => {
    const matches = str.match(regex)
    return [matches[1], str.substring(matches.index + matches[1].length + 2)]
}

const renderProperties = props =>
    Object.entries(props)
    .map(([key, value]) => `${key}="${value}"`)
    .join(' ')

const renderChildren = children =>
    children && Array.isArray(children)
    ? children.join(' ')
    : children

const createElement = tag => props => children =>
    children && children.length > 0
    ? `<${tag} ${renderProperties(props)}>${renderChildren(children)}</${tag}>`
    : `<${tag} ${renderProperties(props)}/>`

const refererenceReplacement = `$1${createElement('Reference')({})('$3')}`

const footnote = (refId, refContents) => createElement('Footnote')({ id: refId })(refContents)

const extractReferences = (sourcePages) => {
    const iterate = ([page, nextPage, ...rest]) => {
        if (!page) {
            return null
        }

        const matches = page.match(/([a-zA-Zń;.\)])((\d+)\))\s*?/gu)

        if (matches) {
            // https://regex101.com/r/Km2IUy/4/
            // ń for now as regex don't support Unicode letters without transpilation
            const fixed = page.replace(
                /([a-zA-Zń;.\)])((\d+)\))\s*?/gu,
                refererenceReplacement
            )

            const emptyLinePattern = /^\s*[\r\n]/gm

            const findFootnote = (src) => {
                let lastIndex = 0
                while (emptyLinePattern.exec(src)) {
                    lastIndex = emptyLinePattern.lastIndex
                }
                return lastIndex
            }

            const referenceContentStart = findFootnote(fixed)
            const refContent = fixed.substring(referenceContentStart)
            let [refId, refContents] = matchWith(/^(\d+)\) /)(refContent)

            if (nextPage && !(refContent.trim().endsWith('.') || refContent.trim().endsWith(';'))) {
                const nextIndex = findFootnote(nextPage)
                const nextRefContent = nextPage.substring(nextIndex)
                const nextPageContent = nextPage.replace(
                    nextRefContent,
                    ''
                )

                // WARNING: change nextPage, sorry
                nextPage = nextPageContent

                refContents = [refContents, nextRefContent].join(' ')
            }

            const footnoteTag = footnote(refId, refContents)
            const refContentMarked = fixed.replace(
                refContent,
                ''
            )

            return {
                page: refContentMarked,
                footnotes: [
                    footnoteTag
                ],
                next: nextPage && nextPage.length > 0 ? iterate([nextPage, ...rest]) : null
            }
        }

        return {
            page,
            next: nextPage && nextPage.length > 0 ? iterate([nextPage, ...rest]) : null
        }
    }

    const extracted = iterate(sourcePages)
    const traverseList = (f, acc) => list =>
        list ? traverseList(f, f(acc, list))(list.next) : acc
    const reduced = traverseList((acc, curr) => [...acc, curr.page], [])(extracted)
    return reduced;
}

const compose = (...fs) => x => fs.reduceRight((acc, f) => f(acc), x)

const replaceMultipleSpacesWithSpace = x =>
    x.replace(/  +/g, ' ')

const replaceHeader = x => x.replace(/©Kancelaria Sejmu(.|\n)*?\d{4}-\d{2}-\d{2}/gm, '')
const replaceLineBreaks = x => x.replace(replaceLineBreaksRegex, '$2 $4')
const normalizeLineBreaks = x => x.replace(/\r\n/g, '\n')
const trimLines = x =>
    x.split('\n')
    .map(x => x.trim())
    .join('\n')
const replaceMultipleLineBreaks = x =>
    x.split('\n')
    .map(x => x.trim())
    .filter(x => x)
    .join('\n')
const wrapArticleFirstSectionToNewLine = x =>
    x.replace(/(Art\. .+?\.)(\s)(.+?\n?)/g, '$1\n$3')

const startsWithCapitalLetter = (str, atpos = 0) => {
    const chr = str.charAt(atpos);
    return /[A-Z]|[\u0080-\u024F]/.test(chr) && chr === chr.toUpperCase();
};

const isAbbr = (str) => {
    const splitted = str.trim().split(' ')
    return splitted.length > 0 && (splitted[0].endsWith('.'))
}

const isArticle = str =>
    str.startsWith('Art. ') ||
    str.startsWith('<Art. ') ||
    str.startsWith('[Art. ')

const listItemRegex = /^[0-9]+[a-z]*?(\.|\)) /gm

const fixSupplementary = (page) => {
    // starts with a capital letter and forms a block at the bottom of a page
    const lines = page.split('\n')
    const trimmedLines = lines.map(x => x.trim())
    const reversed = trimmedLines.reverse()
    const specialListItemRegex = /^– „[a-z]” /gm
    let offset = 0;

    // return early as notes must end with a dot
    if (!reversed[0].endsWith('.')) {
        return page
    }

    while (offset < reversed.length) {
        const line = reversed[offset]

        if ((startsWithCapitalLetter(line) && !isAbbr(line) && !isArticle(line))) {
            // test if previous line ends with ; or . but it is not an article header
            const nextLine = reversed[offset + 1]
            if (nextLine && !isArticle(nextLine) && (
                nextLine.endsWith(';') ||
                nextLine.endsWith(',') ||
                nextLine.endsWith('.'))) {
                break;
            }
        }

        // in list or past article boundary - cancel and break
        if (listItemRegex.test(line) || specialListItemRegex.test(line) || isArticle(line)) {
            offset = reversed.length - 1;
            break;
        } else {
            offset += 1
        }
    }

    if (offset === reversed.length - 1) {
        return page
    }

    // const supplementary = reversed.slice(0, offset + 1).reverse().join('\n')
    const fixedPage = reversed.slice(offset + 1).reverse().join('\n')

    // test again for other notes in the page
    return fixSupplementary(fixedPage)
}

export default source =>
    extractReferences(
        source.split(/----------------.*?----------------/)
        .map(normalizeLineBreaks)
        .map(x => x.trim())
        .map(wrapArticleFirstSectionToNewLine)
        .map(fixSupplementary)
        .map(replaceHeader)
    ).map(compose(
        replaceLineBreaks,
        replaceMultipleLineBreaks,
        wrapArticleFirstSectionToNewLine,
        replaceMultipleSpacesWithSpace,
        trimLines
    )).join('\n')

import preprocess from './preprocess'
import parse from './parse'
import postprocess from './postprocess'

export default source => postprocess(
    parse(
        preprocess(
            source
        )
    )
)

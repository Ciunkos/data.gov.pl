import sourceText from './prawo-o-ruchu-drogowym.content.txt'

import {
    clearPageBreaks,
    trimLines
} from './index.js'

describe('clearPageBreaks', () => {
    it('it should clear simple case', () => {
        expect(
            trimLines(clearPageBreaks(`3. Kierującemu rowerem lub motorowerem zabrania się: 
1) jazdy po jezdni obok innego uczestnika ruchu, z zastrzeżeniem ust. 3a; 
----------------Page (36) Break----------------
©Kancelaria Sejmu  s. 38/260 
2017-06-09 
2) jazdy bez trzymania co najmniej jednej ręki na kierownicy oraz nóg na`))
        )
        .toEqual(trimLines(`3. Kierującemu rowerem lub motorowerem zabrania się: 
1) jazdy po jezdni obok innego uczestnika ruchu, z zastrzeżeniem ust. 3a;

©Kancelaria Sejmu  s. 38/260 
2017-06-09 
2) jazdy bez trzymania co najmniej jednej ręki na kierownicy oraz nóg na`));
    })
})

describe('trimLines', () => {
    it('it should trim simple case', () => {
        expect(
            trimLines(clearPageBreaks(`a
            b
            c
d

            e`))
        )
        .toEqual(`a
b
c
d

e`);
    })
})

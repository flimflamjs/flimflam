const setMsg$ = flyd.stream('')
const hideMsg$ = flyd.flatMap(msg => flyd.delay(5000, ''), setMsg$)


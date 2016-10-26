import h from 'snabbdom/h'

module.exports = (title, content) =>
  h('section', {props: {id: title}}, [h('h3', title), content])


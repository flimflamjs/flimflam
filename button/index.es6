const R = require('ramda')
const h = require('snabbdom/h').default
const flyd = require('flyd')

// Generate a form submission button with various behavior based on the state
// Properties of state:
//   loadingText: (optional) (string) text to display when we're loading
//   buttonText: (optional) (string) text to display in the button (could be a vnode too)
//   error$: (optional) (string) error message that can get displayed above the button upon error
//   loading$: (optional) (boolean) whether or not we're in a loading state

module.exports = state => {
  // Set defaults
  state = R.merge({
    loadingText: 'Saving...'
  , buttonText: 'Submit'
  , error$: flyd.stream()
  , loading$: flyd.stream()
  }, state)

	return h('div', {
    attrs: {'data-ff-button-wrapper': state.error$() ? 'error' : ''}
  }, [
		h('p', {
      attrs: {'data-ff-button-error': state.error$() ? 'error' : ''}
    }, state.error$())
  , h('button', { 
      props: { type: 'submit', disabled: state.loading$() }
    , attrs: {'data-ff-button': state.loading$() ? 'loading' : ''}
    }, [
      state.loading$() ? state.loadingText : state.buttonText
		])
	])
}


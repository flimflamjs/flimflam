import h from 'snabbdom/h'
import flyd from 'flyd'

// Generate a form submission button with various behavior based on the state
// Properties of state:
//   loadingText: (optional) (string) text to display when we're loading
//   buttonText: (optional) (string) text to display in the button (could be a vnode too)
//   error$: (optional) (string) error message that can get displayed above the button upon error
//   loading$: (optional) (boolean) whether or not we're in a loading state

export default function view(state) {
  state.error$ = state.error$ || flyd.stream()
  state.loading$ = state.loading$ || flyd.stream()
	return h('div.ff-buttonWrapper', {
    class: { 'ff-buttonWrapper--hasError': state.error$() }
  }, [
		h('p.ff-button-error', {style: {display: state.error$() ? 'block' : 'none'}} , state.error$())
  , h('button.ff-button', { 
      props: { type: 'submit', disabled: state.loading$() }
    , class: { 'ff-button--loading': state.loading$() }
    }, [
      state.loading$() ? (state.loadingText || " Saving...") : (state.buttonText || "Submit")
		])
	])
}


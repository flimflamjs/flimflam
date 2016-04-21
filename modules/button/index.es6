import h from 'snabbdom/h'

// Generate a form submission button with various behavior based on the state
// Properties of state:
//   buttonClass: (optional) (string) class for the button itself
//   backgroundColor: (optional) (string) color value for the background of the button
//   loadingText: (optional) (string) text to display when we're loading
//   buttonText: (optional) (string) text to display in the button (could be a vnode too)
//
// State:
//   error: (optional) (string) error message that can get displayed above the button upon error
//   loading: (optional) (boolean) whether or not we're in a loading state


function view(state) {
	return h('div', { props: {className: state.divClass}, class: {'u-centered': !state.divClass}}, [
		h('p.error', {style: {display: state.error ? 'block' : 'none'}} , state.error)
  , h('button', {
      props: {
        className: 'button ' + state.buttonClass
      , type: 'submit'
      , disabled: state.loading
      }
		, style: { background: state.backgroundColor }
		}
    , [
			state.loading ? h('i.fa.fa-spin.fa-spinner') : '' 
    ,	state.loading ? (state.loadingText || " Saving...") : (state.buttonText || "Submit")
		])
	])
}

module.exports = view

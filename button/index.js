'use strict';

var _h = require('snabbdom/h');

var _h2 = _interopRequireDefault(_h);

var _flyd = require('flyd');

var _flyd2 = _interopRequireDefault(_flyd);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Generate a form submission button with various behavior based on the state
// Properties of state:
//   loadingText: (optional) (string) text to display when we're loading
//   buttonText: (optional) (string) text to display in the button (could be a vnode too)
//   error$: (optional) (string) error message that can get displayed above the button upon error
//   loading$: (optional) (boolean) whether or not we're in a loading state

module.exports = function (state) {
  // Set defaults
  state = R.merge({
    loadingText: 'Saving...',
    buttonText: 'Submit',
    error$: _flyd2.default.stream(),
    loading$: _flyd2.default.stream()
  }, state);

  return (0, _h2.default)('div', {
    attrs: { 'data-ff-button-wrapper': state.error$() ? 'error' : '' }
  }, [(0, _h2.default)('p', {
    attrs: { 'data-ff-button-error': state.error$() ? 'error' : '' }
  }, state.error$()), (0, _h2.default)('button', {
    props: { type: 'submit', disabled: state.loading$() },
    attrs: { 'data-ff-button': state.loading$() ? 'loading' : '' }
  }, [state.loading$() ? state.loadingText : state.buttonText])]);
};


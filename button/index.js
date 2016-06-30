'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = view;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _snabbdomH = require('snabbdom/h');

var _snabbdomH2 = _interopRequireDefault(_snabbdomH);

var _flyd = require('flyd');

var _flyd2 = _interopRequireDefault(_flyd);

// Generate a form submission button with various behavior based on the state
// Properties of state:
//   loadingText: (optional) (string) text to display when we're loading
//   buttonText: (optional) (string) text to display in the button (could be a vnode too)
//   error$: (optional) (string) error message that can get displayed above the button upon error
//   loading$: (optional) (boolean) whether or not we're in a loading state

function view(state) {
  state.error$ = state.error$ || _flyd2['default'].stream();
  state.loading$ = state.loading$ || _flyd2['default'].stream();
  return (0, _snabbdomH2['default'])('div.ff-buttonWrapper', {
    'class': { 'ff-buttonWrapper--hasError': state.error$() }
  }, [(0, _snabbdomH2['default'])('p.ff-button-error', { style: { display: state.error$() ? 'block' : 'none' } }, state.error$()), (0, _snabbdomH2['default'])('button.ff-button', {
    props: { type: 'submit', disabled: state.loading$() },
    'class': { 'ff-button--loading': state.loading$() }
  }, [state.loading$() ? state.loadingText || " Saving..." : state.buttonText || "Submit"])]);
}

module.exports = exports['default'];


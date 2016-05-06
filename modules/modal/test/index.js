import assert from 'assert'
import modal from '../'
import flyd from 'flyd'
import render from 'flimflam-render'
import h from 'snabbdom/h'

const testView = ctx =>
  h('div', [ modal.view(ctx, { id: 'xyz', body: h('div', 'modal body!'), title: 'modal title!', footer: h('div', 'modal footer!') }) ])

const modalID = 'xyz'
let modalID$ = flyd.stream()
let ctx = modal.init(modalID$)
let div = document.createElement('div')
let rendered = render(ctx, testView, div)

test('sets inView class on backdrop when id on stream matches config id', ()=> {
  modalID$(modalID)
  assert.equal(div.querySelector('.ff-modalBackdrop').className, 'ff-modalBackdrop inView')
})
test('sets inView class on the modal when id on stream matches config id', ()=> {
  modalID$(modalID)
  assert.equal(div.querySelector('.ff-modal').className, 'ff-modal inView')
})
test('removes inView class on backdrop when id on stream does not match config id', ()=> {
  modalID$('')
  assert.equal(div.querySelector('.ff-modalBackdrop').className, 'ff-modalBackdrop')
})
test('removes inView class on modal when id on stream does not match config id', ()=> {
  modalID$('')
  assert.equal(div.querySelector('.ff-modal').className, 'ff-modal')
})
test('uses the body set by config', ()=> {
  modalID$(modalID)
  assert.equal(div.querySelector('.ff-modal-body').textContent, 'modal body!')
})
test('uses the title set by config', ()=> {
  modalID$(modalID)
  assert.equal(div.querySelector('.ff-modal-header').textContent, 'modal title!')
})
test('uses the footer set by config', ()=> {
  modalID$(modalID)
  assert.equal(div.querySelector('.ff-modal-footer').textContent, 'modal footer!')
})

var click = new MouseEvent('click', { view: window , bubbles: true , cancelable: true })

test('it sets currentID to null when backdrop is clicked', ()=> {
  modalID$(modalID)
  div.querySelector(".ff-modalBackdrop").dispatchEvent(click)
  assert.equal(rendered.component$().state.currentID, null)
})

test('it sets currentID to null when the close button is clicked', ()=> {
  modalID$(modalID)
  div.querySelector(".ff-modal-closeButton").dispatchEvent(click)
  assert.equal(rendered.component$().state.currentID, null)
})


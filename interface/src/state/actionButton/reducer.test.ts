import { ChainId } from '@uniswap/sdk'
import { createStore, Store } from 'redux'
import { addPopup, removePopup, toggleSettingsMenu, toggleActinModal } from './actions'
import reducer, { ApplicationState } from './reducer'

describe('application reducer', () => {
  let store: Store<ApplicationState>

  beforeEach(() => {
    store = createStore(reducer, {
      popupList: [],
      actionModalOpen: false,
      settingsMenuOpen: false,
      blockNumber: {
        [ChainId.MAINNET]: 3
      }
    })
  })

  describe('addPopup', () => {
    it('adds the popup to list with a generated id', () => {
      store.dispatch(addPopup({ content: { txn: { hash: 'abc', summary: 'test', success: true } } }))
      const list = store.getState().popupList
      expect(list).toHaveLength(1)
      expect(typeof list[0].key).toEqual('string')
      expect(list[0].show).toEqual(true)
      expect(list[0].content).toEqual({ txn: { hash: 'abc', summary: 'test', success: true } })
      expect(list[0].removeAfterMs).toEqual(15000)
    })

    it('replaces any existing popups with the same key', () => {
      store.dispatch(addPopup({ key: 'abc', content: { txn: { hash: 'abc', summary: 'test', success: true } } }))
      store.dispatch(addPopup({ key: 'abc', content: { txn: { hash: 'def', summary: 'test2', success: false } } }))
      const list = store.getState().popupList
      expect(list).toHaveLength(1)
      expect(list[0].key).toEqual('abc')
      expect(list[0].show).toEqual(true)
      expect(list[0].content).toEqual({ txn: { hash: 'def', summary: 'test2', success: false } })
      expect(list[0].removeAfterMs).toEqual(15000)
    })
  })

  describe('toggleActinModal', () => {
    it('toggles wallet modal', () => {
      store.dispatch(toggleActinModal())
      expect(store.getState().actionModalOpen).toEqual(true)
      store.dispatch(toggleActinModal())
      expect(store.getState().actionModalOpen).toEqual(false)
      store.dispatch(toggleActinModal())
      expect(store.getState().actionModalOpen).toEqual(true)
    })
  })

  describe('settingsMenuOpen', () => {
    it('toggles settings menu', () => {
      store.dispatch(toggleSettingsMenu())
      expect(store.getState().settingsMenuOpen).toEqual(true)
      store.dispatch(toggleSettingsMenu())
      expect(store.getState().settingsMenuOpen).toEqual(false)
      store.dispatch(toggleSettingsMenu())
      expect(store.getState().settingsMenuOpen).toEqual(true)
    })
  })

  describe('removePopup', () => {
    beforeEach(() => {
      store.dispatch(addPopup({ key: 'abc', content: { txn: { hash: 'abc', summary: 'test', success: true } } }))
    })
    it('hides the popup', () => {
      expect(store.getState().popupList[0].show).toBe(true)
      store.dispatch(removePopup({ key: 'abc' }))
      expect(store.getState().popupList).toHaveLength(1)
      expect(store.getState().popupList[0].show).toBe(false)
    })
  })
})

import { useCallback, useMemo } from 'react'
import { useActiveWeb3React } from '../../hooks'
import { addPopup, PopupContent, removePopup, toggleActinModal } from './actions'
import { useSelector, useDispatch } from 'react-redux'
import { AppState } from '../index'

export function useBlockNumber(): number | undefined {
  const { chainId } = useActiveWeb3React()

  return useSelector((state: AppState) => state.actionButton.blockNumber[chainId ?? -1])
}

export function useActiontModalOpen(): boolean {
  return useSelector((state: AppState) => state.actionButton.actionModalOpen)
}

export function useActionModalToggle(): () => void {
  const dispatch = useDispatch()
  return useCallback(() => dispatch(toggleActinModal()), [dispatch])
}

export function useSettingsMenuOpen(): boolean {
  return useSelector((state: AppState) => state.actionButton.settingsMenuOpen)
}

// returns a function that allows adding a popup
export function useAddPopup(): (content: PopupContent, key?: string) => void {
  const dispatch = useDispatch()

  return useCallback(
    (content: PopupContent, key?: string) => {
      dispatch(addPopup({ content, key }))
    },
    [dispatch]
  )
}

// returns a function that allows removing a popup via its key
export function useRemovePopup(): (key: string) => void {
  const dispatch = useDispatch()
  return useCallback(
    (key: string) => {
      dispatch(removePopup({ key }))
    },
    [dispatch]
  )
}

// get the list of active popups
export function useActivePopups(): AppState['actionButton']['popupList'] {
  const list = useSelector((state: AppState) => state.actionButton.popupList)
  return useMemo(() => list.filter(item => item.show), [list])
}

import { useState } from 'react'

const TOAST_DURATION_MS = 2400

export function useAppDialogs() {
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false)
  const [isAddToTeamOpen, setIsAddToTeamOpen] = useState(false)
  const [selectedAddTeamId, setSelectedAddTeamId] = useState('team-1')
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  function showToastMessage(message: string) {
    setToastMessage(message)
    setShowToast(true)
    window.setTimeout(() => setShowToast(false), TOAST_DURATION_MS)
  }

  return {
    isFavoritesOpen,
    setIsFavoritesOpen,
    isAddToTeamOpen,
    setIsAddToTeamOpen,
    selectedAddTeamId,
    setSelectedAddTeamId,
    showToast,
    toastMessage,
    showToastMessage,
  }
}

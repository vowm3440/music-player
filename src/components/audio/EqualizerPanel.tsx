import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { LiquidButton } from '../glass/LiquidButton'
import { audioEngine, DEFAULT_EQ_PRESETS, EQ_FREQUENCIES } from '../../core/audio/AudioEngine'
import { useLibraryStore } from '../../store/useLibraryStore'
import { Sliders, RotateCcw, Power, X } from 'lucide-react'

interface EqualizerPanelProps {
  onClose: () => void
}

export const EqualizerPanel: React.FC<EqualizerPanelProps> = ({ onClose }) => {
  const preferences = useLibraryStore((state) => state.preferences)
  const updatePreferences = useLibraryStore((state) => state.updatePreferences)

  const [gains, setGains] = useState<number[]>(preferences.customEqGains || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
  const [selectedPresetId, setSelectedPresetId] = useState<string>(preferences.eqPresetId)
  const [isEnabled, setIsEnabled] = useState<boolean>(preferences.eqEnabled)

  const handleBandChange = (index: number, val: number) => {
    const updated = [...gains]
    updated[index] = val
    setGains(updated)
    setSelectedPresetId('custom')
    audioEngine.setEQBandGain(index, val)
    updatePreferences({ customEqGains: updated, eqPresetId: 'custom' })
  }

  const handleSelectPreset = (presetId: string) => {
    setSelectedPresetId(presetId)
    const preset = DEFAULT_EQ_PRESETS.find((p) => p.id === presetId)
    if (preset) {
      setGains(preset.gains)
      audioEngine.applyEQPreset(preset)
      updatePreferences({ eqPresetId: presetId, customEqGains: preset.gains })
    }
  }

  const handleToggleEnabled = () => {
    const nextEnabled = !isEnabled
    setIsEnabled(nextEnabled)
    audioEngine.setEQEnabled(nextEnabled, gains)
    updatePreferences({ eqEnabled: nextEnabled })
  }

  const handleReset = () => {
    const zeros = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    setGains(zeros)
    setSelectedPresetId('flat')
    const flat = DEFAULT_EQ_PRESETS[0]
    audioEngine.applyEQPreset(flat)
    updatePreferences({ eqPresetId: 'flat', customEqGains: zeros })
  }

  const formatFreq = (freq: number) => {
    return freq >= 1000 ? `${freq / 1000}k` : `${freq}`
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-2xl"
      >
        <div className="solid-window rounded-[32px] p-6 relative border border-white/10 shadow-[0_32px_90px_rgba(0,0,0,0.9)]">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-2xl bg-white/10 text-white">
                <Sliders className="w-5 h-5 text-pink-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">10-Band Hi-Fi 硬件级均衡器</h3>
                <p className="text-xs text-white/50">原生 Web Audio 双二阶滤波器 (BiquadFilter) 零延迟硬件调音</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <LiquidButton
                variant={isEnabled ? 'accent' : 'subtle'}
                size="sm"
                onClick={handleToggleEnabled}
                className="gap-1.5"
              >
                <Power className="w-3.5 h-3.5" />
                <span>{isEnabled ? '已启用 (Active)' : '已旁通 (Bypass)'}</span>
              </LiquidButton>

              <LiquidButton
                variant="subtle"
                size="icon-sm"
                onClick={handleReset}
                title="重置平直"
              >
                <RotateCcw className="w-4 h-4" />
              </LiquidButton>

              <LiquidButton
                variant="subtle"
                size="icon-sm"
                onClick={onClose}
                title="关闭均衡器"
              >
                <X className="w-4 h-4" />
              </LiquidButton>
            </div>
          </div>

          {/* Preset Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
            {DEFAULT_EQ_PRESETS.map((preset) => {
              const isSelected = selectedPresetId === preset.id
              return (
                <LiquidButton
                  key={preset.id}
                  variant={isSelected ? 'accent' : 'glass'}
                  size="sm"
                  active={isSelected}
                  onClick={() => handleSelectPreset(preset.id)}
                  className="whitespace-nowrap"
                >
                  {preset.name}
                </LiquidButton>
              )
            })}
          </div>

          {/* 10 Sliders Grid */}
          <div className={`grid grid-cols-10 gap-2 sm:gap-3 py-2 transition-opacity duration-300 ${isEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
            {EQ_FREQUENCIES.map((freq, index) => {
              const gain = gains[index] || 0
              return (
                <div key={freq} className="flex flex-col items-center gap-3">
                  <span className="text-[11px] font-mono text-white/70">
                    {gain > 0 ? `+${gain.toFixed(1)}` : gain.toFixed(1)}
                  </span>

                  {/* Vertical Slider Track Container */}
                  <div className="relative h-44 flex items-center justify-center">
                    {/* Zero line indicator */}
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/15 pointer-events-none" />

                    <input
                      type="range"
                      min="-12"
                      max="12"
                      step="0.5"
                      value={gain}
                      onChange={(e) => handleBandChange(index, parseFloat(e.target.value))}
                      className="accent-pink-400 h-40 w-2 appearance-none bg-white/10 rounded-full cursor-pointer orientation-vertical"
                      style={{
                        writingMode: 'vertical-lr',
                        direction: 'rtl',
                      }}
                    />
                  </div>

                  <span className="text-[10px] font-mono text-white/50 tracking-wider">
                    {formatFreq(freq)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

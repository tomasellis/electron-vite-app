import { useEffect, useRef, useState } from 'react'
import { COMMANDS } from '../commands'

interface CommandBarProps {
    isOpen: boolean
    onClose: () => void
    onExecute: (command: string) => void
}

const backgroundColor = "rgb(22,23,23)"
const borderColor = "rgb(250,250,250,0.1)"

export default function CommandBar({ isOpen, onClose, onExecute }: CommandBarProps) {
    const [input, setInput] = useState('')
    const [selectedIndex, setSelectedIndex] = useState(0)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus()
        }
    }, [isOpen])

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isOpen && e.key === ':' && e.ctrlKey && e.shiftKey) {
                e.preventDefault()
                inputRef.current?.focus()
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen])

    const filteredCommands = COMMANDS.filter(cmd => {
        if (input === '*') return true
        return cmd.name.toLowerCase().includes(input.toLowerCase())
    })

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            onClose()
        } else if (e.key === 'Backspace' && input === '') {
            onClose()
        } else if (e.key === 'Enter') {
            if (filteredCommands.length > 0) {
                onExecute(filteredCommands[selectedIndex].name)
            } else {
                onExecute(input)
            }
            setInput('')
            onClose()
        } else if (e.key === 'ArrowDown') {
            e.preventDefault()
            setSelectedIndex(prev =>
                prev < filteredCommands.length - 1 ? prev + 1 : 0
            )
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setSelectedIndex(prev =>
                prev > 0 ? prev - 1 : filteredCommands.length - 1
            )
        } else if (e.key === 'Tab' && filteredCommands.length > 0) {
            e.preventDefault()
            const selectedCommand = filteredCommands[selectedIndex].name
            setInput(selectedCommand + ' ')
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed bottom-0 left-0 right-0 border-t border-[#2d2f34] p-4 z-[50]" style={{
            backgroundColor, borderColor
        }}>
            <div className="max-w-2xl mx-auto">
                <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-2 bg-[#2d2f34] px-3 py-2">
                        <span className="text-gray-400 font-medium">/</span>
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => {
                                setInput(e.target.value)
                                setSelectedIndex(0)
                            }}
                            onKeyDown={handleKeyDown}
                            placeholder="Type a command or * to list them..."
                            className="bg-transparent border-none outline-none text-white w-full"
                        />
                    </div>

                    {input && filteredCommands.length > 0 && (
                        <div className="bg-[#2d2f34] overflow-hidden">
                            {filteredCommands.map((cmd, index) => (
                                <div
                                    key={cmd.name}
                                    className={`px-3 py-2 cursor-pointer ${index === selectedIndex ? 'bg-[#36383d]' : 'hover:bg-[#36383d]'
                                        }`}
                                    onClick={() => {
                                        onExecute(cmd.name)
                                        setInput('')
                                        onClose()
                                    }}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-white">{cmd.name}</span>
                                        <span className="text-gray-400 text-sm">{cmd.description}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
} 
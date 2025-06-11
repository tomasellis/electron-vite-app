import ShortcutItem from './shortcut-item'
import ShortcutSection from './shortcut-section'

export default function ShortcutsView() {
  return (
    <div className="p-6 overflow-y-auto">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold mb-8">Keyboard Shortcuts</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold mb-4">Navigation</h3>
            <ShortcutSection>
              <ShortcutItem label="Next Chat" shortcut="Ctrl + J" />
              <ShortcutItem label="Previous Chat" shortcut="Ctrl + K" />
              <ShortcutItem label="Previous Filter" shortcut="Ctrl + H" />
              <ShortcutItem label="Next Filter" shortcut="Ctrl + L" />
              <ShortcutItem label="Open Command Bar" shortcut="Ctrl + Shift + :" />
              <ShortcutItem label="Close Chat" shortcut="Esc" />
            </ShortcutSection>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Commands</h3>
            <ShortcutSection>
              <ShortcutItem label="Jump N chats down" shortcut="down N" />
              <ShortcutItem label="Jump N chats up" shortcut="up N" />
              <ShortcutItem label="Search chat by name" shortcut="search [name]" />
              <ShortcutItem label="Switch filter" shortcut="filter [type]" />
            </ShortcutSection>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Filters</h3>
            <ShortcutSection>
              <ShortcutItem label="Mark as Unread" shortcut="Ctrl + T" />
              <ShortcutItem label="Inbox" shortcut="filter inbox" />
              <ShortcutItem label="Unreads" shortcut="filter unreads" />
              <ShortcutItem label="Silenced" shortcut="filter silenced" />
            </ShortcutSection>
          </div>
        </div>
      </div>
    </div>
  )
}

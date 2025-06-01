import ShortcutItem from './shortcut-item'
import ShortcutSection from './shortcut-section'

export default function ShortcutsView() {
  return (
    <div className="p-6 overflow-y-auto">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold mb-8">Chat</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold mb-4">Navigation</h3>
            <ShortcutSection>
              <ShortcutItem label="Next Chat" shortcut="↓" />
              <ShortcutItem label="Previous Chat" shortcut="↑" />
              <ShortcutItem label="Open Chat" shortcut="O" />
              <ShortcutItem label="Close Chat" shortcut="Esc" />
              <ShortcutItem label="Find" shortcut="⌘ F" />
              <ShortcutItem label="Search in Chat" shortcut="⌘ K" />
            </ShortcutSection>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Actions</h3>
            <ShortcutSection>
              <ShortcutItem label="Done Chat" shortcut="E" />
              <ShortcutItem label="Send Message & Done Chat" shortcut="⌘ Enter" />
              <ShortcutItem label="Mark as Unread" shortcut="U" />
              <ShortcutItem label="Remind Me" shortcut="R" />
              <ShortcutItem label="Archive Chat" shortcut="A" />
              <ShortcutItem label="Delete Chat" shortcut="⌘ D" />
            </ShortcutSection>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Lists</h3>
            <ShortcutSection>
              <ShortcutItem label="Switch between Inbox" shortcut="Tab" />
              <ShortcutItem label="Move to List" shortcut="⌘ [1-9]" />
              <ShortcutItem label="Go to All" shortcut="⌘ A" />
              <ShortcutItem label="Place Chat in List" shortcut="⌘ P" />
              <ShortcutItem label="Place in Silenced" shortcut="⌘ Shift P" />
              <ShortcutItem label="Create New List" shortcut="⌘ N" />
            </ShortcutSection>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Messaging</h3>
            <ShortcutSection>
              <ShortcutItem label="New Message" shortcut="⌘ M" />
              <ShortcutItem label="Reply" shortcut="⌘ R" />
              <ShortcutItem label="Forward" shortcut="⌘ Shift F" />
              <ShortcutItem label="Add Emoji" shortcut="⌘ E" />
              <ShortcutItem label="Attach File" shortcut="⌘ Shift A" />
              <ShortcutItem label="Voice Message" shortcut="⌘ Shift V" />
            </ShortcutSection>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">View</h3>
            <ShortcutSection>
              <ShortcutItem label="Toggle Sidebar" shortcut="⌘ \\" />
              <ShortcutItem label="Zoom In" shortcut="⌘ +" />
              <ShortcutItem label="Zoom Out" shortcut="⌘ -" />
              <ShortcutItem label="Reset Zoom" shortcut="⌘ 0" />
              <ShortcutItem label="Full Screen" shortcut="⌘ Ctrl F" />
              <ShortcutItem label="Dark Mode" shortcut="⌘ Shift D" />
            </ShortcutSection>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Send Later</h3>
            <ShortcutSection>
              <ShortcutItem label="Schedule Message" shortcut="⌘ Shift S" />
              <ShortcutItem label="Send in 1 Hour" shortcut="⌘ 1" />
              <ShortcutItem label="Send Tomorrow" shortcut="⌘ T" />
              <ShortcutItem label="Send Next Week" shortcut="⌘ W" />
              <ShortcutItem label="Custom Schedule" shortcut="⌘ Shift C" />
              <ShortcutItem label="View Scheduled" shortcut="⌘ Shift V" />
            </ShortcutSection>
          </div>
        </div>
      </div>
    </div>
  )
}

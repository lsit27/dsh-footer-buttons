# dsh-footer-buttons

A small Web-UI plugin for DeepSeek Harness (DSH) that tidies up the buttons
plugin authors add to the sidebar footer. When several plugins contribute
buttons to the same `sidebar.footer.action` slot, the host renders them in a
single flex row — they end up cramped, uneven in height, with labels squeezed
vertically. This plugin turns them into a clean vertical list and lets you hide
or restore each one.

## Features

- Vertical layout — one button per row, no horizontal crowding.
- Left-aligned icon and text, matching the sidebar's reading flow.
- Auto-sized buttons — each shrinks to its own content instead of filling the row.
- Consistent 30px button height.
- Hide / restore — a **More** panel lists every button; click one to hide it,
  click again in the panel to show it again.
- Persistent state — hidden buttons stay hidden across page reloads (localStorage).

## Install

Install from a local directory in DSH's plugin manager, then refresh the Web page:

```
dsh plugin --profile web add "link:<path-to-this-directory>"
```

Or, once published, install by package name / repository URL.

## Usage

1. Enable the plugin and refresh the Web page. Sidebar-footer buttons become a
   vertical, left-aligned, auto-sized list.
2. Click **More** at the bottom of the list and choose a button to hide it.
   The label shows how many buttons are hidden.
3. Open **More** again — a hidden button reads **Show**; click to restore it.

## How it works

The plugin is purely browser-side. It injects CSS targeting the
`[data-slot='sidebar.footer.action']` container to set `flex-direction: column`
and unify button geometry, and registers one extra entry in that same slot for
the **More** panel. Hiding a button only sets its `style.display = 'none'` — no
DOM nodes are moved, so each button plugin keeps its own rendering and click
behaviour intact. The Host half is empty: no routes, no server state.

## Repository layout

```
dsh-footer-buttons/
├── package.json         # bundle manifest (dsh.bundle.patch + dsh.client)
├── cordis.patch.yml     # inserts the plugin row
├── index.js             # Host half (empty on purpose)
├── client.js            # Web half: layout CSS + More panel
├── locale/{zh,en}.json  # plugin-manager title/description
├── icon.svg             # plugin icon
├── docs/DETAIL.md       # detail page
├── screenshots.json     # storefront screenshots
└── README.md
```

## License

MIT

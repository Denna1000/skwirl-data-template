#!/bin/sh
# Zet de Skwirl-taak op deze Mac: kijkt elk kwartier of het tijd is om de folders op te halen.
# Gebruik:  sh ~/skwirl-data/scripts/mac-installeer.sh      (stoppen: sh ... --stop)
set -e
DIR="$(cd "$(dirname "$0")/.." && pwd)"
NODE="$(command -v node || true)"
PLIST="$HOME/Library/LaunchAgents/nl.skwirl.folders.plist"
if [ "$1" = "--stop" ]; then
  launchctl bootout "gui/$(id -u)/nl.skwirl.folders" 2>/dev/null || true
  rm -f "$PLIST"; echo "Gestopt en verwijderd."; exit 0
fi
if [ -z "$NODE" ]; then echo "Node.js ontbreekt. Installeer het via https://nodejs.org (LTS) en probeer opnieuw."; exit 1; fi
if ! /usr/bin/security find-generic-password -s skwirl-github >/dev/null 2>&1; then
  echo "Eerst de sleutel in de sleutelhanger zetten (zie HANDLEIDING.md, stap H2)."; exit 1
fi
mkdir -p "$HOME/Library/LaunchAgents" "$HOME/Library/Logs"
cat > "$PLIST" <<PL
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>Label</key><string>nl.skwirl.folders</string>
  <key>ProgramArguments</key><array><string>$NODE</string><string>$DIR/scripts/mac-bron.mjs</string><string>--auto</string></array>
  <key>WorkingDirectory</key><string>$DIR</string>
  <key>StartInterval</key><integer>900</integer>
  <key>RunAtLoad</key><true/>
  <key>StandardOutPath</key><string>$HOME/Library/Logs/skwirl-folders.log</string>
  <key>StandardErrorPath</key><string>$HOME/Library/Logs/skwirl-folders.log</string>
</dict></plist>
PL
launchctl bootout "gui/$(id -u)/nl.skwirl.folders" 2>/dev/null || true
launchctl bootstrap "gui/$(id -u)" "$PLIST"
echo "Klaar. Je Mac haalt op werkdagen het eerste moment na 9:30 de folders op (en na 'Nu zoeken' in de app)."
echo "Nu meteen testen:  node \"$DIR/scripts/mac-bron.mjs\""

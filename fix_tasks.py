import re

with open("Tasks.md", "r") as f:
    content = f.read()

# Replace schemaBtn
content = re.sub(
    r'schemaBtn\.style\.cssText = ".*?";',
    'schemaBtn.style.cssText = "background:#000; color:#fff; border:1px solid #555; padding:8px 14px; border-radius:4px; cursor:pointer; font-size:12px; font-weight:700; font-family:\'Space Mono\',monospace; text-transform:uppercase;";',
    content
)
# Replace doneBtn
content = re.sub(
    r'doneBtn\.style\.cssText = ".*?";',
    'doneBtn.style.cssText = "background:#000; color:#fff; border:1px solid #e50914; padding:8px 14px; border-radius:4px; cursor:pointer; font-size:12px; font-weight:700; font-family:\'Space Mono\',monospace; text-transform:uppercase;";',
    content
)

# Quizzes
content = content.replace(
    '"background:#374151; color:#9CA3AF; border:none; padding:8px 14px; border-radius:6px; cursor:pointer; font-size:13px;"',
    '"background:#000; color:#666; border:1px dashed #444; padding:8px 14px; border-radius:4px; cursor:pointer; font-size:12px; font-family:\'Space Mono\',monospace; text-transform:uppercase;"'
)
content = content.replace(
    '"background:#2563EB; color:white; border:none; padding:8px 14px; border-radius:6px; cursor:pointer; font-size:13px; font-weight:600; box-shadow:0 2px 6px rgba(37,99,235,0.3);"',
    '"background:#000; color:#fff; border:1px solid #555; padding:8px 14px; border-radius:4px; cursor:pointer; font-size:12px; font-weight:700; font-family:\'Space Mono\',monospace; text-transform:uppercase;"'
)
content = content.replace(
    '"background:#374151; color:#9CA3AF; border:none; padding:8px 14px; border-radius:6px; cursor:pointer; font-size:13px;"',
    '"background:#000; color:#666; border:1px dashed #444; padding:8px 14px; border-radius:4px; cursor:pointer; font-size:12px; font-family:\'Space Mono\',monospace; text-transform:uppercase;"'
)

# Vocab and Word blocks
# btnW
content = re.sub(
    r'btnW\.style\.cssText = ".*?";',
    'btnW.style.cssText = "flex:1; background:#000; color:#fff; border:1px solid #555; padding:7px; border-radius:4px; cursor:pointer; font-weight:700; font-size:12px; font-family:\'Space Mono\',monospace; text-transform:uppercase;";',
    content
)
content = re.sub(
    r'btnWin\.style\.cssText = ".*?";',
    'btnWin.style.cssText = "flex:1; background:#000; color:#fff; border:1px solid #555; padding:7px; border-radius:4px; cursor:pointer; font-weight:700; font-size:12px; font-family:\'Space Mono\',monospace; text-transform:uppercase;";',
    content
)
# btnF
content = re.sub(
    r'btnF\.style\.cssText = ".*?";',
    'btnF.style.cssText = "flex:1; background:#000; color:#e50914; border:1px solid #e50914; padding:7px; border-radius:4px; cursor:pointer; font-weight:700; font-size:12px; font-family:\'Space Mono\',monospace; text-transform:uppercase;";',
    content
)
content = re.sub(
    r'btnFail\.style\.cssText = ".*?";',
    'btnFail.style.cssText = "flex:1; background:#000; color:#e50914; border:1px solid #e50914; padding:7px; border-radius:4px; cursor:pointer; font-weight:700; font-size:12px; font-family:\'Space Mono\',monospace; text-transform:uppercase;";',
    content
)

# resetBtn
content = re.sub(
    r'resetBtn\.style\.cssText = `.*?`;',
    'resetBtn.style.cssText = "background:#000; color:#fff; border:1px solid #555; padding:5px 12px; border-radius:4px; cursor:pointer; font-size:11px; font-weight:700; font-family:\'Space Mono\',monospace; text-transform:uppercase;";',
    content
)

# showBtn (both vocab and words)
content = re.sub(
    r'showBtn\.style\.cssText = ".*?";',
    'showBtn.style.cssText = "background:#000; color:#fff; border:1px dashed #555; padding:3px 8px; border-radius:4px; cursor:pointer; font-size:12px; flex-shrink:0; font-family:\'Space Mono\',monospace;";',
    content
)
content = re.sub(
    r'showBtn\.style\.cssText = `.*?`;',
    'showBtn.style.cssText = "background:#000; color:#fff; border:1px dashed #555; padding:3px 8px; border-radius:4px; cursor:pointer; font-size:12px; flex-shrink:0; font-family:\'Space Mono\',monospace;";',
    content
)

# Header and backgrounds in Tasks:
# header
content = content.replace(
    'header.style.cssText = "padding: 14px 16px; background: var(--background-primary-alt); border: 1px solid var(--background-modifier-border); border-radius: 10px; margin-bottom: 12px;";',
    'header.style.cssText = "padding: 14px 16px; background: #000; border: 1px dashed #444; border-radius: 8px; margin-bottom: 12px; font-family:\'Space Mono\',monospace;";'
)
# titleSpan
content = content.replace(
    'titleSpan.style.cssText = "font-size:1.15em; font-weight:bold;";',
    'titleSpan.style.cssText = "font-size:1.15em; font-weight:700; text-transform:uppercase; letter-spacing:1px;";'
)
# vocabCard
content = content.replace(
    'vocabCard.style.cssText = "padding:10px 14px; background:var(--background-primary-alt); border-radius:8px; border:1px solid #8B5CF644;";',
    'vocabCard.style.cssText = "padding:10px 14px; background:#000; border-radius:8px; border:1px dashed #444; font-family:\'Space Mono\',monospace;";'
)
content = content.replace(
    'vocabCard.style.cssText = "padding:10px 14px; background:#8B5CF622; border-radius:8px; border:1px solid #8B5CF6; text-align:center; font-size:0.9em; font-weight:600;";',
    'vocabCard.style.cssText = "padding:10px 14px; background:#000; border-radius:8px; border:1px dashed #444; text-align:center; font-size:0.9em; font-weight:700; font-family:\'Space Mono\',monospace;";'
)

# vocab progress bar styling
content = content.replace(
    'vBarInner.style.cssText = "height:100%; background:#8B5CF6; border-radius:3px; transition:width 0.3s; width:0%;";',
    'vBarInner.style.cssText = "height:100%; background:#e50914; border-radius:3px; transition:width 0.3s; width:0%;";'
)
content = content.replace(
    'vocabTitle.style.cssText = "font-size:0.82em; font-weight:600; color:#8B5CF6; white-space:nowrap;";',
    'vocabTitle.style.cssText = "font-size:0.82em; font-weight:700; color:#e50914; white-space:nowrap; font-family:\'Space Mono\',monospace; text-transform:uppercase;";'
)

# word blocks progress
content = content.replace(
    'barInner.style.cssText = `height:100%; background:${accentColor}; border-radius:3px; transition:width 0.3s; width:0%;`;',
    'barInner.style.cssText = `height:100%; background:#e50914; border-radius:3px; transition:width 0.3s; width:0%;`;'
)
content = content.replace(
    'titleSpan.style.cssText = `font-size:0.82em; font-weight:600; color:${accentColor}; white-space:nowrap;`;',
    'titleSpan.style.cssText = `font-size:0.82em; font-weight:700; color:#e50914; white-space:nowrap; font-family:\\\'Space Mono\\\',monospace; text-transform:uppercase;`;'
)
# word blocks card
content = content.replace(
    'card.style.cssText = `padding:10px 14px; background:var(--background-primary-alt); border-radius:8px; border:1px solid var(--background-modifier-border);`;',
    'card.style.cssText = `padding:10px 14px; background:#000; border-radius:8px; border:1px dashed #444; font-family:\\\'Space Mono\\\',monospace;`;'
)
content = content.replace(
    'card.style.cssText = `padding:10px 14px; background:${accentColor}22; border-radius:8px; border:1px solid ${accentColor}; text-align:center; font-size:0.9em; font-weight:600;`;',
    'card.style.cssText = `padding:10px 14px; background:#000; border-radius:8px; border:1px dashed #444; text-align:center; font-size:0.9em; font-weight:700; font-family:\\\'Space Mono\\\',monospace;`;'
)
content = content.replace(
    'winDiv.style.cssText = `display:flex; align-items:center; justify-content:space-between; padding:10px 14px; background:${accentColor}22; border:1px solid ${accentColor}; border-radius:8px;`;',
    'winDiv.style.cssText = `display:flex; align-items:center; justify-content:space-between; padding:10px 14px; background:#000; border:1px dashed #444; border-radius:8px;`;'
)
content = content.replace(
    'doneDiv.style.cssText = `padding:10px 14px; background:${accentColor}22; border:1px solid ${accentColor}; border-radius:8px; font-size:0.9em; font-weight:600;`;',
    'doneDiv.style.cssText = `padding:10px 14px; background:#000; border:1px dashed #444; border-radius:8px; font-size:0.9em; font-weight:700; font-family:\\\'Space Mono\\\',monospace;`;'
)


# Inbox
content = content.replace(
    '<div style="background: var(--background-primary-alt); padding: 15px; border-radius: 8px; border: 1px solid var(--background-modifier-border); margin-bottom: 20px;">',
    '<div style="background: #000; padding: 15px; border-radius: 8px; border: 1px dashed #444; margin-bottom: 20px; font-family:\'Space Mono\',monospace;">'
)

with open("Tasks.md", "w") as f:
    f.write(content)

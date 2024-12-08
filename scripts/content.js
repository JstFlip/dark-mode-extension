const fetchWs = async () => {
  const { websites = [] } = await chrome.storage.local.get("websites")
  const hostname = window.location.hostname.toLowerCase()
  const matchedWs = websites.find(ws => hostname.includes(ws.url))

  return matchedWs?.enabled ?? false
}

const toggleDarkMode = async () => {
  const enabled = await fetchWs()
  
  if (enabled) {
    document.body.style.filter = "invert(1) hue-rotate(180deg)"
    document.body.style.background = "#1a1a1a"
  } else {
    document.body.style.filter = ""
    document.body.style.background = ""
  }
}

(async () => {
  await toggleDarkMode()
  chrome.storage.local.onChanged.addListener(toggleDarkMode)
})()

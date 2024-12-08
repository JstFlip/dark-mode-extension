const cleanString = value => value.trim().toLowerCase()

const makeWsData = (url, enabled) => ({ url, enabled })

const fetchStorage = async () => {
  const { websites = [] } = await chrome.storage.local.get("websites")
  return websites
}

const updateStorage = async (wsData, action) => {
  try {
    const wsStorage = await fetchStorage()

    switch (action) {
      case "add":
        if (wsData?.url && !wsStorage.some(ws => ws.url === wsData.url)) {
          wsStorage.push(wsData)
          await chrome.storage.local.set({ websites: wsStorage })
          return true
        }
        break

      case "changeEnabled":
        const updatedStorage = wsStorage.map(p => 
          p.url === wsData.url ? { ...p, enabled: wsData.enabled } : p
        )
        await chrome.storage.local.set({ websites: updatedStorage })
        return true

      case "remove":
        const filteredStorage = wsStorage.filter(ws => 
          !(ws.url === wsData.url && ws.enabled === wsData.enabled)
        )
        await chrome.storage.local.set({ websites: filteredStorage })
        return true
    }

    return false
  } catch (err) {
    console.error("Error updating storage:", err)
    return false
  }
}

const addToList = (websites, wsData) => {
  // Li item
  const wsItem = document.createElement("li")
  wsItem.classList.add("ws-item")
  // Checkbox
  const checkboxWrapper = document.createElement("div")
  checkboxWrapper.classList.add("checkbox-wrapper")

  const checkbox = document.createElement("input")
  checkbox.classList.add("checkbox-slider")
  checkbox.name = "checkbox-slider"
  checkbox.type = "checkbox"
  checkbox.checked = wsData.enabled
  checkboxWrapper.appendChild(checkbox)
  // Span
  const wsItemText = document.createElement("span")
  wsItemText.classList.add("ws-item-text")
  wsItemText.textContent = wsData.url
  // Remove button
  const removeWsButton = document.createElement("i")
  removeWsButton.classList.add("fa-solid", "fa-trash", "remove-ws-btn")
  // Append everything to parent
  wsItem.append(checkboxWrapper, wsItemText, removeWsButton)
  websites.appendChild(wsItem)
}

document.addEventListener("DOMContentLoaded", async () => {
  const wsList = document.querySelector(".ws-list")
  const addWs = document.querySelector(".add-ws-btn")
  const addWsInput = document.querySelector(".add-ws-input")

  const wsStorage = await fetchStorage()
  wsStorage.forEach(wsData => addToList(wsList, wsData))

  //Event listeners
  addWs.addEventListener("click", async e => {
    e.preventDefault()

    const wsData = makeWsData(cleanString(addWsInput.value), true)
    const updateSuccess = await updateStorage(wsData, "add")

    if (updateSuccess) {
      addToList(wsList, wsData)
    }

    addWsInput.value = ""
  })

  wsList.addEventListener("click", async e => {
    const target = e.target
    const targetType = target.classList

     if (targetType.contains("remove-ws-btn")) {
      const wsItem = target.parentElement
      const wsUrl = cleanString(
        wsItem
        .querySelector(".ws-item-text")
        .textContent
      )
      const wsEnabled = wsItem
        .querySelector(".checkbox-slider")
        .checked

      const updateSuccess = await updateStorage(makeWsData(wsUrl, wsEnabled), "remove")

      if (updateSuccess) {
        wsItem.remove()
      }
    }

    if (targetType.contains("checkbox-slider")) {
      const wsUrl = cleanString(
        target
        .parentElement
        .parentElement
        .querySelector(".ws-item-text")
        .textContent
      )

      await updateStorage(makeWsData(wsUrl, target.checked), "changeEnabled")
    }
  })
})

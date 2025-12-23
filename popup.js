async function getCurrentTab() {
    return [... await chrome.tabs.query({active:true, currentWindow: true})][0]
}
async function getWindows() {
    const windowsIDs =  [ ... await chrome.tabs.query({index: 1})].map(t=>{ return t['windowId'] })
    var windows = { length: windowsIDs.length }

    windowsIDs.forEach( async id=>{
        const tabs = [ ... await chrome.tabs.query({windowId: id})]
        windows[id] = tabs
    })
    return windows
}

fetch('./db.json').then((r)=>{return r.json()}).then(async data=>{
    const tabs_opened = [ ... await chrome.tabs.query({})]
    const tabs_active_window = [ ... await chrome.tabs.query({currentWindow: true})]
    console.log(data)

    if (data.hasKey('data')) {
        Object.keys(data['data']).forEach((key,index) => {
            const context = data['data'][key]
            var new_element = document.createElement('div')
            new_element.classList.add('list-entry')
            new_element.setAttribute('index',index)
            new_element.innerText = context['title']
            document.querySelector('div[data-list]').append(new_element)
        })
    }

    document.querySelector('div#clear-button').addEventListener('click', e=>{
        chrome.tabs.query({ discarded: false }).then(tabs=>{
            getCurrentTab().then(currentTab=>{
                tabs.forEach(tab=>{
                    if (tab.id !== currentTab.id && !tab.url.includes('music.youtube.com')){
                        chrome.tabs.discard( tab.id )
                    }
                })
                return Promise.resolve(true)
            }).then(e=>{
                document.querySelector('div#clear-button').backgroundColor = '#14ed1f'
            })
        })
    })

    const n_windows = await getWindows()
    document.querySelector('p#n-tabs-opened').innerText = `Tabs opened: ${tabs_active_window.length} - ${tabs_opened.length}/${n_windows.length}`
    
})

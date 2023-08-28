// const contexts = ['selection', 'link']

var localDb = { list: [], error: true }
var debugMode = false

Object.prototype.getDefaultBool = function(key){
	return this.hasOwnProperty(key) ? Boolean(this[key]) : false
}


chrome.runtime.onInstalled.addListener(function () {
	let parentContext = chrome.contextMenus.create({
		title: 'Search "%s" on ...',
		contexts: ['selection'],
		id: 'selection'
	})

	fetch('./db.json')
		.then((r) => {
			return r.json()
		})
		.then((data) => {
			console.log('Reading db.json file')

			if (data.hasOwnProperty('list')) {
				// data.hasKey('list')
				localDb = data
				data['list'].forEach((site, index) => {
					if (site['id'].startsWith('#')) {
						console.error(`Malformed id at index n°${index} → ${site['id']}\nID name should not start with #`)
						return
					}
					chrome.contextMenus.create({
						title: site['title'],
						contexts: ['selection'],
						id: `#${site['id']}`,
						parentId: parentContext
					})
				})
				debugMode = data.getDefaultBool('debug')
			} else {
				console.error('Malformed db.json !')
			}
		})
})

const encodeHTML = (value) => {
	return /* encodeURI */ value
		.trim()
		.replace('"', '')
		.replace(/[^A-Za-z0-9 _-]+/gi, '-')
}
const encodeHTMLSpaces = (value) => {
	return /* encodeURI */ value
		.trim()
		.replace('"', '')
		.replace(/[^A-Za-z0-9 _-]+/gi, '-')
		.replace(/\s+/gi, '+')
}

chrome.contextMenus.onClicked.addListener((data, tab) => {
	console.log('Displaying "data" content')
	console.table(data)
	console.log('\n\nDisplaying "tab" content')
	console.table(tab)

	// if (tab['status'] != 'completed') return
	if (typeof data != 'object') return
	if (!data.hasOwnProperty('menuItemId')) return
	if (!data.hasOwnProperty('selectionText')) return
	if (localDb.hasOwnProperty('error')) return

	// const pageURL = new URL('https://www.google.com/search')
	const selectedText = data.selectionText.toString()

	const selectedId = data.menuItemId.replace('#', '')
	localDb['list'].forEach((key, index) => {
		if (key['id'] == selectedId) {

			const pageURL = new URL(key['queryLink'], key['url'])
			var queryStr = `${encodeHTML(selectedText)}`
			if (key.hasOwnProperty('queryModifiers')) {
				if (key['queryModifiers'].hasOwnProperty('prefix')) queryStr = `${key['queryModifiers']['prefix']} ${queryStr}`
				if (key['queryModifiers'].hasOwnProperty('suffix')) queryStr = `${queryStr} ${key['queryModifiers']['suffix']}`
			}
			pageURL.searchParams.set(key['queryTag'], queryStr.trim())
			
			if (key.hasOwnProperty('additionalQueries')) {
				if (key['additionalQueries'].length > 0) {
					key['additionalQueries'].forEach((q, qI) => {
						pageURL.searchParams.set(q['name'], q['value'])
					})
				}
			}
			const focusOnOpen = key.getDefaultBool('focusOnOpen')
			const openNewTab = key.getDefaultBool('openNewTab')
			const newTabIndex = openNewTab ? tab.index + 1 : tab.index
			if (!debugMode) chrome.tabs.create({ url: pageURL.href, index: newTabIndex, active: focusOnOpen })

			console.log('Creating new tab with url: ', pageURL.href)

			return
		}
	})
})

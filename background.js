// const contexts = ['selection', 'link']

var localDb = { list: [], error: true }
var debugMode = false
var parentContext = null

Object.prototype.getDefaultBool = function (key) {
	return this.hasOwnProperty(key) ? this[key] === true : false
}
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

function createContext(contextName = '', index = 0) {
	const contextData = this[contextName]
	if (contextData['id'].startsWith('#')) {
		console.error(`Malformed id at index n°${index} → ${contextData['id']}\nID name should not start with #`)
		return
	}
	if (parentContext == null) {
		console.error('Error while initializing the extension')
		return
	}
	chrome.contextMenus.create({
		title: contextData['title'],
		contexts: ['selection'],
		id: `mso#${contextData['id']}`,
		parentId: parentContext
	})
	console.log(`Adding ${contextData['title']} search option`)
}

chrome.runtime.onInstalled.addListener(function onInstalledListener() {
	parentContext = chrome.contextMenus.create({
		title: 'Search "%s" on ...',
		contexts: ['selection'],
		id: 'mso'
	})

	fetch('./db.json')
		.then((r) => {
			return r.json()
		})
		.then((data) => {
			console.log('Reading db.json file')

			localDb = data
			// localStorage.setItem('db',JSON.stringify(data))

			chrome.storage.local.set({ db: data })

			if (data.hasOwnProperty('list') && data.hasOwnProperty('data')) {
				// data.hasKey('list')

				/* data['list'].forEach(function (siteName, index) {
					const site = localDb['data'][siteName]
					if (site['id'].startsWith('#')) {
						console.error(`Malformed id at index n°${index} → ${site['id']}\nID name should not start with #`)
						return
					}
					chrome.contextMenus.create({
						title: site['title'],
						contexts: ['selection'],
						id: `mso#${site['id']}`,
						parentId: parentContext
					})
					console.log(`Adding ${site['id']} search option`)
				}) */

				Object.keys( data['data'] ).forEach(createContext,data['data'])

				console.log(`Debug mode: ${localDb['debug'] ? 'On' : 'Off'}`)
				debugMode = localDb['debug']
				localDb['error'] = false
			} else {
				localDb['error'] = true
				console.error('Malformed db.json !')
			}
		})
})

chrome.contextMenus.onClicked.addListener(function addContextClickListener(data, tab) {
	var selectedText = ''
	var selectedId = ''
	var pageURL = ''
	var queryStr = ''
	var breakForEach = false
	var focusOnOpen = false
	var openNewTab = false
	var newTabIndex = 0

	console.group('[More Search Options]: Log')
	console.log('Displaying "data" content')
	console.table(data)
	console.log('Displaying "tab" content')
	console.table(tab)
	console.groupEnd()

	if (typeof data != 'object') return
	if (!data.hasOwnProperty('menuItemId')) return
	if (!data.hasOwnProperty('selectionText')) return

	selectedText = data.selectionText.toString()

	selectedId = data.menuItemId.replace('mso#', '')
	breakForEach = false

	// ✔️❌🔓🔒
	chrome.storage.local.get(['db']).then(function readDatabase(dbJSON) {
		dbJSON = dbJSON['db']
		console.log(dbJSON)
		const menu = dbJSON['data'][selectedId]

		pageURL = new URL(menu['queryLink'], menu['url'])

		queryStr = `${encodeHTML(selectedText)}`
		if (menu.hasOwnProperty('queryModifiers')) {
			if (menu['queryModifiers'].hasOwnProperty('prefix')) queryStr = `${menu['queryModifiers']['prefix']} ${queryStr}`
			if (menu['queryModifiers'].hasOwnProperty('suffix')) queryStr = `${queryStr} ${menu['queryModifiers']['suffix']}`
		}
		pageURL.searchParams.set(menu['queryTag'], queryStr.trim())

		if (menu.hasOwnProperty('additionalQueries')) {
			if (menu['additionalQueries'].length > 0) {
				menu['additionalQueries'].forEach(function additionalQuery(additionalQuery) {
					pageURL.searchParams.set(additionalQuery['name'], additionalQuery['value'])
				})
			}
		}

		focusOnOpen = menu.getDefaultBool('focusOnOpen')
		openNewTab = menu.getDefaultBool('openNewTab')
		newTabIndex = openNewTab ? tab.index + 1 : tab.index

		if (debugMode) {
			console.log(`Request to create new tab → ${pageURL.href}`)
		} else {
			chrome.tabs.create({ url: pageURL.href, index: newTabIndex, active: focusOnOpen })
			console.log('Creating new tab with url: ', pageURL.href)
		}
	})
})

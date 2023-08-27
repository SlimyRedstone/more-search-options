/* 
    ⎡                           ⎤
    ⎢     Random functions      ⎥
    ⎣                           ⎦
*/

/* 
    ⎡                           ⎤
    ⎢   Functions for cookies   ⎥
    ⎣                           ⎦
*/

function setCookie(_name = '', _value = '', _expiration = 1) {
	const expDate = new Date()
	expDate.setTime(expDate.getTime() + _expiration * 24 * 3.6e3 * 1e3)
	document.cookie = `${_name}=${_value};expires=${expDate.toUTCString()};path=/`
}

function getCookie(_name = '') {
	var _return = { error: true, name: _name, value: '' }
	const decodedCookies = decodeURIComponent(document.cookie)
	if (!decodedCookies) return _return
	decodedCookies.split(';').forEach((cElement, iElement) => {
		// console.log(`[${iElement}] -> ${cElement}`)
		if (cElement.startsWith(`${_name}=`) || cElement.startsWith(` ${_name}=`)) {
			console.log(`Cookie "${_name}" do exist`)
			_return['error'] = false
			_return['value'] = cElement.split('=')[1].toString()
			return _return
		}
	})
	if (_return['error']) console.log(`Cookie "${_name}" don't exist`)
	return _return
}

function cookieExists(_name) {
	return !getCookie(_name)['error']
}

/* 
    ⎡                           ⎤
    ⎢   Functions for numbers   ⎥
    ⎣                           ⎦
*/
Number.prototype.formatDataSize = function (binary_bytes = true) {
	var exp = 0
	var n = this
	const factor = binary_bytes ? 1024 : 1e3
	while (n >= factor) {
		n /= factor
		exp++
	}
	const sizes = [
		['iB', 'kiB', 'MiB', 'GiB', 'TiB'],
		['B', 'kB', 'MB', 'GB', 'TB']
	]
	return `${n.toFixed(2)} ${sizes[binary_bytes ? 0 : 1][exp]}`.toString()
}

Number.prototype.toHex = function () {
	var hex_text = this.toString(16).toUpperCase()
	while (hex_text.length % 2) {
		hex_text = `0${hex_text}`
	}
	return `0x${hex_text}`
}

Number.prototype.leftShift = function (shift_index = 0) {
	return Number(BigInt(this) << BigInt(shift_index))
}

/* 
    ⎡                           ⎤
    ⎢   Functions for strings   ⎥
    ⎣                           ⎦
*/

String.prototype.shorten = function (max_length = 32, cut_str = '...') {
	let str = this
	if (str.length > max_length - cut_str.length)
		str = ''.concat(
			str.substring(0, (max_length - cut_str.length) / 2),
			cut_str,
			str.substring(str.length - (max_length - cut_str.length) / 2)
		)
	return str
}

String.prototype.hexToNumber = function () {
	const str = this.trim()
		.replaceAll(':', '')
		.replaceAll('/', '')
		.replaceAll('.', '')
		.replaceAll(',', '')
		.replaceAll(';', '')
		.replaceAll('#', '0x')
	if (str.startsWith('0x')) return Number(str)
	else return Number(`0x${str}`.toString())
}

/* 
    ⎡                           ⎤
    ⎢    Functions for JSON     ⎥
    ⎣                           ⎦
*/

/* JSON.prototype.cleanJSON = function(obj){
    if (typeof obj !== 'object') throw TypeError
    return JSON.parse( JSON.stringify(obj) )
} */

/* 
    ⎡                           ⎤
    ⎢   Functions for arrays    ⎥
    ⎣                           ⎦
*/

Object.prototype.hasKey = function (key) {
	return Boolean(Object.hasOwnProperty.call(this, key))
}

Array.prototype.last = function (negative_index = 0) {
	negative_index = Math.abs(negative_index)
	const last_index = this.length - 1
	return this[last_index - negative_index]
}

Array.prototype.getUniqueKeys = function (filter_key) {
	return [...new Set(this.map((key) => key[filter_key]))]
}

Array.prototype.append = function (value) {
	if (value instanceof Object) {
		if (value instanceof Array) {
			value.forEach((key, index) => {
				this.push(key)
			})
			return value
		}
	}
	this.push(value)
	return value
}

Array.prototype.remove = function (rValue) {
	var has_key = false
	var removed_index = -1
	const old = this
	old.forEach((value, index) => {
		if (JSON.stringify(rValue) == JSON.stringify(value)) {
			removed_index = index
			has_key = true
			return
		}
	})
	if (removed_index != -1) this.splice(removed_index, 1)
	return has_key
}

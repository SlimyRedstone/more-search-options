fetch('./db.json').then((r)=>{return r.json()}).then(data=>{
    console.log(data)

    if (data.hasKey('list')) {
        data['list'].forEach((key,index) => {
            var new_element = document.createElement('div')
            new_element.classList.add('list-entry')
            new_element.setAttribute('index',index)
            new_element.innerText = key['title']
            document.querySelector('div[data-list]').append(new_element)
        })
    }

})
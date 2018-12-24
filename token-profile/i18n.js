const search = new URLSearchParams(window.location.search)
const lng = search.get("lng") || 'zh-Hans'
fetch(`./locale/${lng}.json`).then(res => res.json()).then(texts => {
  Object.keys(texts).forEach(title => {
    const el = document.querySelector(`#${title}`)
    if (el) {
      el.innerText = texts[title] + ':'
    }
  })
})

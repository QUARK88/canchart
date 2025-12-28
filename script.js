const toggle = document.getElementById("themeToggle")
const root = document.documentElement
const savedTheme = localStorage.getItem("theme")
if (savedTheme === "dark") {
    root.classList.add("dark")
    toggle.checked = true
}
toggle.addEventListener("change", () => {
    if (toggle.checked) {
        root.classList.add("dark")
        localStorage.setItem("theme", "dark")
    } else {
        root.classList.remove("dark")
        localStorage.setItem("theme", "light")
    }
})
const TYPE = 0
const URL = 1
const X = 2
const Y = 3
const IN = 4
const chart = document.getElementById("chart")
const arrows = document.getElementById("arrows")
fetch("./nodes.json")
    .then(r => r.json())
    .then(data => {
        renderNodes(data)
        renderArrows(data)
    })
function renderNodes(data) {
    Object.entries(data).forEach(([name, node]) => {
        const type = node[TYPE]
        const container = document.createElement("a")
        container.className = "node"
        container.style.left = node[X] + "px"
        container.style.top = node[Y] + "px"
        container.title = name
        const text = document.createElement("a")
        text.className = "node__text"
        text.textContent = name
        text.title = name
        const shape = document.createElement("a")
        shape.classList.add("node__shape")
        if (node[URL] && node[URL] !== "") {
            text.href = node[URL]
            text.target = "_blank"
            shape.href = node[URL]
            shape.target = "_blank"
        }
        if (name.length > 24) {
            if (name.length > 40) {
                text.style.width = "256px"
            } else {
                text.style.width = "224px"
            }
        }
        switch (type[0]) {
            case "a": shape.classList.add("node__shape--anglo"); break
            case "f": shape.classList.add("node__shape--franco"); break
            case "n": shape.classList.add("node__shape--none"); break
            case "m": shape.classList.add("node__shape--maritimes"); break
            case "p": shape.classList.add("node__shape--prairies"); break
            case "o": shape.classList.add("node__shape--other"); break
        }
        switch (type[1]) {
            case "i": shape.classList.add("node__shape--ideology"); break
            case "f": shape.classList.add("node__shape--faction"); break
            case "c": shape.classList.add("node__shape--current"); break
        }
        if (type.length > 2) {
            switch (type[2]) {
                case "l": shape.classList.add("node__shape--liberal"); break
                case "o": shape.classList.add("node__shape--conservativeOld"); break
                case "p": shape.classList.add("node__shape--progressive"); break
                case "c": shape.classList.add("node__shape--progressiveConservative"); break
                case "w": shape.classList.add("node__shape--cooperativeCommonwealth"); break
                case "s": shape.classList.add("node__shape--socialCredit"); break
                case "d": shape.classList.add("node__shape--newDemocratic"); break
                case "b": shape.classList.add("node__shape--blocQuebecois"); break
                case "g": shape.classList.add("node__shape--green"); break
                case "r": shape.classList.add("node__shape--reform"); break
                case "n": shape.classList.add("node__shape--conservativeNew"); break
                case "m": shape.classList.add("node__shape--peoples"); break
            }
        }
        container.appendChild(text)
        container.appendChild(shape)
        chart.appendChild(container)
    })
}
const PARTY_ARROW_CLASS = {
    l: "arrow--liberal",
    o: "arrow--conservativeOld",
    p: "arrow--progressive",
    c: "arrow--progressiveConservative",
    w: "arrow--cooperativeCommonwealth",
    s: "arrow--socialCredit",
    d: "arrow--newDemocratic",
    b: "arrow--blocQuebecois",
    g: "arrow--green",
    r: "arrow--reform",
    n: "arrow--conservativeNew",
    m: "arrow--peoples"
}
function defineArrowMarker(svg, className = "arrow--default") {
    const defs = svg.querySelector("defs") ||
        svg.appendChild(document.createElementNS("http://www.w3.org/2000/svg", "defs"))
    const id = `arrowhead-${className}`
    if (svg.querySelector(`#${id}`)) return
    const marker = document.createElementNS("http://www.w3.org/2000/svg", "marker")
    marker.setAttribute("id", id)
    marker.setAttribute("markerWidth", "28")
    marker.setAttribute("markerHeight", "16")
    marker.setAttribute("refX", "28")
    marker.setAttribute("refY", "8")
    marker.setAttribute("orient", "auto")
    marker.setAttribute("markerUnits", "userSpaceOnUse")
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path")
    path.setAttribute("d", "M0,2 L28,8 L0,14 Z")
    path.classList.add("arrowhead", className)
    marker.appendChild(path)
    defs.appendChild(marker)
}
function renderArrows(data) {
    const rect = chart.getBoundingClientRect()
    arrows.setAttribute("width", rect.width)
    arrows.setAttribute("height", rect.height)
    defineArrowMarker(arrows) // default marker
    Object.entries(data).forEach(([_, node]) => {
        const type = node[TYPE]
        const party = type.length > 2 ? type[2] : null
        const partyClass = PARTY_ARROW_CLASS[party] || "arrow"
        const incoming = node[IN]
        if (!incoming) return
        defineArrowMarker(arrows, partyClass)
        incoming.forEach(([fromName, label]) => {
            const from = data[fromName]
            if (!from) return
            const x1 = from[X]
            const y1 = from[Y]
            const x2 = node[X]
            const y2 = node[Y]
            const dx = x2 - x1
            const dy = y2 - y1
            const half = 36
            const t = Math.min(half / Math.abs(dx || 1), half / Math.abs(dy || 1))
            const line = document.createElementNS("http://www.w3.org/2000/svg", "line")
            line.setAttribute("x1", x1)
            line.setAttribute("y1", y1)
            line.setAttribute("x2", x2 - dx * t)
            line.setAttribute("y2", y2 - dy * t)
            line.setAttribute("marker-end", `url(#arrowhead-${partyClass})`)
            line.classList.add("arrow", partyClass)
            arrows.appendChild(line)
            if (label) {
                const midX = (x1 + x2) / 2
                const midY = (y1 + y2) / 2
                const fo = document.createElementNS("http://www.w3.org/2000/svg", "foreignObject")
                fo.setAttribute("x", midX - 76)
                fo.setAttribute("y", midY - 64)
                fo.setAttribute("width", 152)
                fo.setAttribute("height", 128)
                const div = document.createElement("div")
                div.className = "arrow__text"
                div.textContent = label
                fo.appendChild(div)
                arrows.appendChild(fo)
            }
        })
    })
}


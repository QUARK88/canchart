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
        const shape = document.createElement("a")
        shape.classList.add("node__shape")
        const types = []
        switch (type[0]) {
            case "a": shape.classList.add("node__shape--anglo"); types.push("Anglo-Canadian"); break
            case "f": shape.classList.add("node__shape--franco"); types.push("Franco-Canadian"); break
            case "n": shape.classList.add("node__shape--none"); types.push("Non-Sectarian"); break
            case "m": shape.classList.add("node__shape--maritimes"); types.push("Maritime"); break
            case "p": shape.classList.add("node__shape--prairies"); types.push("Prairie"); break
            case "o": shape.classList.add("node__shape--other"); types.push("Other Minority"); break
        }
        switch (type[1]) {
            case "i": shape.classList.add("node__shape--ideology"); types.push("Ideology"); break
            case "f": shape.classList.add("node__shape--faction"); types.push("Faction/Party"); break
            case "c": shape.classList.add("node__shape--current"); types.push("Current Faction/Party"); break
        }
        if (type.length > 2) {
            switch (type[2]) {
                case "l": shape.classList.add("node__shape--liberal"); types.push("Liberal"); break
                case "o": shape.classList.add("node__shape--conservativeOld"); types.push("Old Conservative"); break
                case "p": shape.classList.add("node__shape--progressive"); types.push("Progressive"); break
                case "c": shape.classList.add("node__shape--progressiveConservative"); types.push("Progressive Conservative"); break
                case "w": shape.classList.add("node__shape--cooperativeCommonwealth"); types.push("Co-operative Commonwealth"); break
                case "s": shape.classList.add("node__shape--socialCredit"); types.push("Social Credit"); break
                case "d": shape.classList.add("node__shape--newDemocratic"); types.push("New Democratic"); break
                case "b": shape.classList.add("node__shape--blocQuebecois"); types.push("Bloc Québécois"); break
                case "g": shape.classList.add("node__shape--green"); types.push("Green"); break
                case "r": shape.classList.add("node__shape--reform"); types.push("Reform"); break
                case "n": shape.classList.add("node__shape--conservativeNew"); types.push("New Conservative"); break
                case "m": shape.classList.add("node__shape--peoples"); types.push("People's"); break
            }
        }
        if (types[2]) {
            title = `${name}\n\n${types[0]} ${types[2]} ${types[1]}`
        } else {
            title = `${name}\n\n${types[0]} ${types[1]}`
        }
        const container = document.createElement("a")
        container.className = "node"
        container.style.left = node[X] + "px"
        container.style.top = node[Y] + "px"
        container.title = title
        const text = document.createElement("a")
        text.className = "node__text"
        text.textContent = name
        text.title = title
        if (node[URL] && node[URL] !== "") {
            text.href = node[URL]
            text.target = "_blank"
            shape.href = node[URL]
            shape.target = "_blank"
        }
        if (name.length > 24) {
            if (name.length > 40) {
                text.style.width = "128px"
            } else {
                text.style.width = "112px"
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
    marker.setAttribute("markerWidth", "20")
    marker.setAttribute("markerHeight", "8")
    marker.setAttribute("refX", "19")
    marker.setAttribute("refY", "4")
    marker.setAttribute("orient", "auto")
    marker.setAttribute("markerUnits", "userSpaceOnUse")
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path")
    path.setAttribute("d", "M0,1 L19,4 L0,7 Z")
    path.classList.add("arrowhead", className)
    marker.appendChild(path)
    defs.appendChild(marker)
}
function intersectSquare(x1, y1, x2, y2, half) {
    const dx = x2 - x1
    const dy = y2 - y1
    const adx = Math.abs(dx)
    const ady = Math.abs(dy)
    const t = adx > ady
        ? half / adx
        : half / ady
    return {
        x: x2 - dx * t,
        y: y2 - dy * t
    }
}
function intersectCircle(x1, y1, x2, y2, radius) {
    const dx = x2 - x1
    const dy = y2 - y1
    const len = Math.hypot(dx, dy) || 1
    return {
        x: x2 - (dx / len) * radius,
        y: y2 - (dy / len) * radius
    }
}
function renderArrows(data) {
    const rect = chart.getBoundingClientRect()
    arrows.setAttribute("width", rect.width)
    arrows.setAttribute("height", rect.height)
    defineArrowMarker(arrows)
    Object.entries(data).forEach(([_, node]) => {
        const type = node[TYPE]
        const shapeType = type[1]
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
            let end
            if (shapeType === "i") {
                end = intersectCircle(x1, y1, x2, y2, 18)
            } else {
                end = intersectSquare(x1, y1, x2, y2, 18)
            }
            const line = document.createElementNS("http://www.w3.org/2000/svg", "line")
            line.setAttribute("x1", x1)
            line.setAttribute("y1", y1)
            line.setAttribute("x2", end.x)
            line.setAttribute("y2", end.y)
            line.setAttribute("marker-end", `url(#arrowhead-${partyClass})`)
            line.classList.add("arrow", partyClass)
            arrows.appendChild(line)
            if (label) {
                const midX = (x1 + x2) / 2
                const midY = (y1 + y2) / 2
                const fo = document.createElementNS("http://www.w3.org/2000/svg", "foreignObject")
                fo.setAttribute("x", midX - 38)
                fo.setAttribute("y", midY - 32)
                fo.setAttribute("width", 76)
                fo.setAttribute("height", 64)
                const div = document.createElement("div")
                div.className = "arrow__text"
                div.textContent = label
                fo.appendChild(div)
                arrows.appendChild(fo)
            }
        })
    })
}
const slider = document.getElementById("zoomSlider")
const zoomZone = document.getElementById("zoomZone")
const html = document.getElementById("html")
slider.min = 50
slider.max = 200
slider.value = 100
function applyZoom(value) {
    zoomZone.style.zoom = value + "%"
}
slider.addEventListener("input", () => {
    let raw = Number(slider.value)
    if (raw > 100) {
        raw = Math.round(raw / 10) * 10
    } else if (raw < 100) {
        raw = Math.round(raw / 5) * 5
    }
    slider.value = raw
    applyZoom(raw)
})
applyZoom(100)
html.style.minWidth = "100%"
html.style.maxWidth = "fit-content"
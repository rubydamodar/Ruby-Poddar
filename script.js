let docHeight
let closest, ab

$(() => {
    window["theme"] = "light"
    $("body")[0].style.setProperty("--theme", window["theme"]) 

    $("body").append(window["desktop"] = new Desktop({
        icons: [
            new DesktopIcon({ 
                id: "mycomputer", 
                icon: base64_icon_mycomputer,
                text: "This PC", 
                action: `Window.spawnWindow('explorer', { titlebar: 'My Computer', icon: '${base64_icon_mycomputer}', path: 'mycomputer' })`
            }),
            new DesktopIcon({
                id: "documents", 
                icon: base64_icon_documents, 
                text: "Documents", 
                action: `Window.spawnWindow('explorer', { titlebar: 'Documents', icon: '${base64_icon_documents}', path: 'documents' })` 
            }),
            new DesktopIcon({ 
                id: "recyclebin", 
                icon: base64_icon_recyclebin, 
                text: "Recycle Bin", 
                action: `Window.spawnWindow('explorer', { titlebar: 'Recycle Bin', icon: '${base64_icon_recyclebin}', path: 'recyclebin' })` 
            }),
            new DesktopIcon({ 
                id: "msedge", 
                icon: base64_icon_edge, 
                text: "Microsoft Edge", 
                action: `Window.spawnWindow('msedge')` 
            })
        ]
    }))

    desktop.append(window["taskbar"] = new Taskbar({
        id: "taskbar",
        center_buttons: [
            new TaskbarButton({ id: 0, btn_type: "start", w_title: "Start" }),
            new TaskbarSearchButton({ id: "taskbar-search" }),
            new TaskbarButton({ id: 2, btn_type: "button", pinned: true, w_title: "File Explorer", icon: App_Explorer.app_settings.icon, app: "explorer" }),
            new TaskbarButton({ id: 3, btn_type: "button", pinned: true, w_title: "Notepad", icon: App_Notepad.app_settings.icon_tiny, app: "notepad" }),
            new TaskbarButton({ id: 4, btn_type: "button", pinned: true, w_title: "Command Prompt", icon: App_Cmd.app_settings.icon_tiny, app: "cmd" })
        ],
        system_tray: new SystemTray()
    }))
    
    reinitDraggables()
    reinit_tooltips()
    
    docHeight = $(window).height()
})

$(window).on("resize", function() {
    docHeight = $(window).height()
})

$(document).on("keydown", function(e) {
    if(e.altKey) {
        if(window["theme"] == "dark") {
            window["theme"] = "light"
        }else{
            window["theme"] = "dark"
        }
        toggleTheme()
    }
})

const toggleTheme = () => {
    $(`[style*="--theme"]:not(body)`).each((i, e) => {
        if(typeof e.applyTheme === "function") e.applyTheme()
    })
    $("body")[0].style.setProperty("--theme", window["theme"]) 
}

const transparent = () => {
      return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
}

const reinit_tooltips = () => {
      var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
      var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl, {delay: { show: 1000, hide: 10 }})
      })
}

const closeToolTips = () => {
      $(".tooltip").tooltip("hide")
} 

const pauseToolTips = (type) => {
      setTimeout(() => {
            let tts = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
            tts.map((tt) => {
                  if(tt.length) {
                        if(type == true) {
                              bootstrap.Tooltip.getInstance(tt).hide()
                              bootstrap.Tooltip.getInstance(tt).disable()
                              closeToolTips()
                        }else{
                              bootstrap.Tooltip.getInstance(tt).enable()
                        }
                  }
            })
      }, 10)
}

const ucwords = (str) => {
      return (str + '').replace(/^([a-z])|\s+([a-z])/g, function ($1) {
          return $1.toUpperCase()
      })
}

const concat = (arr) => {
      let res = ""
      arr.forEach((e) => {
            res += e
      })
      return res
      //return res.replace("undefined", "")
}

const hasParents = (e, p) => {
      return $(e.target).parents(p).length
}

const wid = () => {
      return Math.floor(100000 + Math.random() * 900000)
}

async function screenshotElement(el) {
  return await new Promise((resolve) => {
    html2canvas($(el), {
            onrendered: function (canvas) {
                resolve(canvas.toDataURL())
            }
      })
  })
}

const zeroPad = (num, places) => String(num).padStart(places, "0")

function strstr($haystack, $needle, $bool) {
      var $pos = 0;
      $haystack += "";
      $pos = $haystack.indexOf($needle);
      if($pos == -1) {
            return false;
      }else{
            if($bool) {
                  return $haystack.substr(0, $pos);
            } else {
                  return $haystack.slice($pos);
            }
      }
}

// For middle clicking
$(document).on("mousedown", function (e1) {
      if (e1.which === 2) {
            $(document).one("mouseup", function (e2) {
                  if (e1.target === e2.target) {
                        var e3 = $.event.fix(e2)
                        e3.type = "middleclick"
                        $(e2.target).trigger(e3)
                  }
            })
      }
})
// Code to see if two elements are touching
const elementsTouch = (a, b) => {
  if(a && b) {
    let rect1 = a.getBoundingClientRect()
    let rect2 = b.getBoundingClientRect()
    return !(
        ((rect1.top + rect1.height) < (rect2.top)) ||
        (rect1.top > (rect2.top + rect2.height)) ||
        ((rect1.left + rect1.width) < rect2.left) ||
        (rect1.left > (rect2.left + rect2.width))
    )
  }
}


// Allows elements to be dragged
const reinitDraggables = (element) => {
  $(element).each((i, el) => {
    let pos = {}
    let handle = $(el).find(".handle")

    $(el).find(handle).on("mousedown touchstart", function(e) {
      pos = {
        x: e.clientX,
        y: e.clientY
      }

      $(document).on("mousemove touchmove", $(el), mouseMoveHandler)
      $(document).on("mouseup touchend", $(el), mouseUpHandler)
    })

    const mouseMoveHandler = (e) => {
      const dx = e.clientX - pos.x
      const dy = e.clientY - pos.y

      $(el).not(".maximized").css({ top: `${el.offsetTop + dy}px`, left: `${el.offsetLeft + dx}px` })

      pos = {
        x: e.clientX,
        y: e.clientY
      }
    }

    const mouseUpHandler = () => {
      $(document).off("mousemove touchmove", mouseMoveHandler)
      $(document).off("mouseup touchend", mouseUpHandler)
    }
  })
}


// Allows two panels to be resized left/right
const initResizer = (element) => {
  $(element).each((i, el) => {
    let resizer = $(el).find(".p-resizer")
    let r_left = resizer.prev()
    let r_right = resizer.next()
    let pos = {}
  
    $(resizer).on("mousedown touchstart", function(e) {
      pos = {
        x: e.clientX,
        y: e.clientY,
        leftWidth: r_left.width()
      } 
      
      $(document).on("mousemove touchmove", resizer, mouseMoveHandler)
      $(document).on("mouseup touchend", resizer, mouseUpHandler)
    })
    
    const mouseMoveHandler = (e) => {
      const dx = e.clientX - pos.x
      //const dy = e.clientY - pos.y

      r_left.css({ 
        "width": `${((pos.leftWidth + dx) * 100) / resizer.parent().width()}%`,
        "user-select": "none",
        "pointer-events": "none"
      })
      r_right.css({ 
        "user-select": "none",
        "pointer-events": "none"
      })
      resizer.css({ "cursor": "ew-resize" })
      $("body").css({ "cursor": "ew-resize" })
    }
    
    const mouseUpHandler = () => {
      resizer.css({ 
        "cursor": "ew-resize;"
      })
      $("body").css({ 
        "cursor": "default"
      })
      r_left.css({ 
        "user-select": "initial",
        "pointer-events": "initial"
      })
      r_right.css({ 
        "user-select": "initial",
        "pointer-events": "initial"
      })
      
      $(document).off("mousemove touchmove", mouseMoveHandler)
      $(document).off("mouseup touchend", mouseUpHandler)
    }
  })
}



// Allows element to be resized from all sides and corners
const reinitResizables = (element, min_size = 20) => {
  $(element).each((i, el) => {
    $(el).html($(el).html() + `
      <div class="resizer resizer-l"></div>
      <div class="resizer resizer-r"></div>
      <div class="resizer resizer-t"></div>
      <div class="resizer resizer-b"></div>
      
      <div class="resizer resizer-tl"></div>
      <div class="resizer resizer-tr"></div>
      <div class="resizer resizer-bl"></div>
      <div class="resizer resizer-br"></div>
    `)
    
    let resizer = $(el).find(".resizer")
    let currentResizer
    let orig = {}
    
    $(resizer).on("mousedown touchstart", function(e) {
      currentResizer = e.target
      
      const styles = window.getComputedStyle(el)
      orig = {
        w: parseInt(styles.width, 10),
        h: parseInt(styles.height, 10),
        x: parseInt(styles.left, 10),
        y: parseInt(styles.top, 10),
        mx: e.pageX,
        my: e.pageY
      }
    
      $(document).on("mousemove touchmove", mouseMoveHandler)
      $(document).on("mouseup touchend", mouseUpHandler)
    })
    
    const mouseMoveHandler = (e) => {
      let cr = currentResizer.classList
      if(
        cr.contains("resizer-r")
        || cr.contains("resizer-tr")
        || cr.contains("resizer-br")
      ) {
        const newW = orig.w + (e.pageX - orig.mx)
        if (newW > min_size) {
          $(el).css({ "width": `${newW}px` })
        }
      }
      
      if(
        cr.contains("resizer-l")
        || cr.contains("resizer-tl")
        || cr.contains("resizer-bl")
      ) {
        const newW = orig.w - (e.pageX - orig.mx)
        if (newW > min_size) {
          $(el).css({ 
            "width": `${newW}px`,
            "left": `${orig.x + (e.pageX - orig.mx)}px`
          })
        }
      }
      
      if(
        cr.contains("resizer-b")
        || cr.contains("resizer-bl")
        || cr.contains("resizer-br")
      ) {
        const newH = orig.h + (e.pageY - orig.my)
        if (newH > min_size) {
          $(el).css({ "height": `${newH}px` })
        }
      }
      
      if(
        cr.contains("resizer-t")
        || cr.contains("resizer-tl")
        || cr.contains("resizer-tr")
      ) {
        const newH = orig.h - (e.pageY - orig.my)
        if (newH > min_size) {
          $(el).css({ 
            "height": `${newH}px`,
            "top": `${orig.y + (e.pageY - orig.my)}px`
          })
        }
      }
      
    }

    const mouseUpHandler = () => {
      $(document).off("mousemove touchmove", mouseMoveHandler)
      $(document).off("mouseup touchend", mouseUpHandler)
    }
  })
}


/*
(function($) {
  $.fn.sizeChanged = function(handleFunction) {
    var element = this
    var lastWidth = element.width()
    var lastHeight = element.height()
    setInterval(function() {
      if(lastWidth === element.width() && lastHeight === element.height())
        return
      if(typeof(handleFunction) == "function") {
        handleFunction({ 
          width: lastWidth, 
          height: lastHeight 
        },
        { 
          width: element.width(), 
          height: element.height() 
        })
        lastWidth = element.width()
        lastHeight = element.height()
      }
    }, 100)
    return element
  }  
}(jQuery))
*/

jQuery.fn.swapWith = function(to) {
  return this.each(function() {
    let copy_to = $(to).clone(true)
    let copy_from = $(this).clone(true)
    $(to).replaceWith(copy_from)
    $(this).replaceWith(copy_to)
  })
}
class Desktop extends HTMLElement {
      constructor(args) {
            super()
            this.icons = args.icons

            this.addDesktopIcons()
            this.applyTheme()
      }

      connectedCallback() {
            this.eventHandlers()
      }

      addDesktopIcons() {
            $(this).append(this.icons)
      }

      applyTheme() {
            $(this)[0].style.setProperty("--theme", window["theme"]) 
            let wallpaper = (window["theme"] == "light" 
                  ? wallpaper_light
                  : wallpaper_dark
            )
            $(this).css({"background-image": `url(${wallpaper})`})
      }

      eventHandlers() {
            let _this = this
            let shiftPressed = false
            let initFocused, currentlyFocused

            $(this).on("mousedown", function(e) {
                  if(!e.ctrlKey && !e.shiftKey) $("w-desktop-icon").removeClass("active")
                  //e.preventDefault()
            })

            $(this).on("keyup", function(e) {
                  shiftPressed = false
            })

            $(this).on("keydown", function(e) { //38 = Up | 40 = Down
                  // CTRL + A (Select All)
                  if(e.ctrlKey && e.keyCode == 65) {
                        $("w-desktop-icon").addClass("active") 
                        $("w-desktop-icon.active:last-of-type").focus() // Focus on the last element selected
                  }

                  // Keep track of shift press only once
                  if(!shiftPressed && e.keyCode == 16) {
                        shiftPressed = true
                        initFocused = $("w-desktop-icon:focus").index()
                        if($("w-desktop-icon:focus").length) {
                              initFocused = $("w-desktop-icon:focus").index()
                        }
                  }

                  // Standard icon nav without shift key
                  if(!e.shiftKey) {
                        if(e.keyCode == 38) {
                              $("w-desktop-icon:focus").prev().focus()
                              $("w-desktop-icon").removeClass("active")
                        }
                        if(e.keyCode == 40) {
                              $("w-desktop-icon:focus").next().focus()
                              $("w-desktop-icon").removeClass("active")
                        }
                  }else{
                        if(e.keyCode == 38) {
                              $("w-desktop-icon:focus").addClass("active").prev().addClass("active").focus()
                              
                              if(currentlyFocused > initFocused) {
                                    $("w-desktop-icon:focus").nextAll().removeClass("active")
                              }
                        }

                        if(e.keyCode == 40) {
                              $("w-desktop-icon:focus").addClass("active").next().addClass("active").focus()

                              if(currentlyFocused < initFocused) {
                                    $("w-desktop-icon:focus").prevAll().removeClass("active")
                              }
                        }
                        currentlyFocused = $("w-desktop-icon:focus").index()
                  }
            })

            // Right click context
            $(this).on("contextmenu", function(e) {
                  if(e.target.nodeName == "W-DESKTOP") {
                        window[`cxt_desktop`] = new ContextMenu({
                              id: `cxt_desktop`,
                              pos: {
                                    x: e.pageX,
                                    y: e.pageY
                              },
                              taskbar_context: false,
                              buttons: [
                                    {
                                          icon: base64_view_tiny,
                                          text: "View"
                                    },
                                    {
                                          icon: base64_sortby_tiny,
                                          text: "Sort By"
                                    },
                                    {
                                          icon: base64_refresh_tiny,
                                          text: "Refresh"
                                    },
                                    { text: "---" },    
                                    {
                                          icon: base64_undo_tiny,
                                          text: "Undo"
                                    },
                                    {
                                          icon: base64_new_tiny,
                                          text: "New",
                                          more_buttons: [
                                                { text: "Text Document" }
                                          ]
                                    },
                                    { text: "---" },    
                                    {
                                          icon: base64_displaysettings_tiny,
                                          text: "Display Settings"
                                    },
                                    {
                                          icon: base64_personalise_tiny,
                                          text: "Personalise"
                                    },
                                    { text: "---" },    
                                    {
                                          icon: base64_showmoreoptions_tiny,
                                          text: "Show more options"
                                    }
                              ]
                        })
                        $("w-desktop").append(window[`cxt_desktop`])
                  }
                  
                  e.preventDefault()                  
                  //e.stopImmediatePropagation()
            })

            const desktopDrag = () => {
                  let pos = {}
                  
                  $(document).on("mousedown touchstart", "w-desktop", function(e) {
                        if(e.target.nodeName == "W-DESKTOP") {
                              pos = {
                                    x: e.clientX,
                                    y: e.clientY
                              }
                        
                              $("w-desktop").append(`<div class="desktop-drag"></div>`)
                              $(".desktop-drag").css({
                                    "top": pos.y,
                                    "left": pos.x
                              })

                              $(document).on("mousemove touchmove", "w-desktop", desktopMouseMoveHandler)
                              $(document).on("mouseup touchend", "w-desktop", desktopMouseUpHandler)
                        }
                  })

                  const desktopMouseMoveHandler = (e) => {                        
                        if(e.clientX > pos.x) {
                              $(".desktop-drag").css({
                                    "left": pos.x,
                                    "width": e.clientX - pos.x
                              })
                        }
                  
                        if(e.clientY > pos.y) {
                              $(".desktop-drag").css({
                                    "top": pos.y,
                                    "height": e.clientY - pos.y
                              })
                        }
                  
                        if(e.clientX < pos.x) {
                              $(".desktop-drag").css({
                                    "left": e.clientX,
                                    "width": pos.x - e.clientX
                              })
                        }
                  
                        if(e.clientY < pos.y) {
                              $(".desktop-drag").css({
                                    "top": e.clientY,
                                    "height": pos.y - e.clientY
                              })
                        }
                  
                        $("w-desktop-icon").each((i, e) => {
                              if(elementsTouch(e, $(".desktop-drag")[0])) $(e).addClass("active")
                              if(!elementsTouch(e, $(".desktop-drag")[0])) $(e).removeClass("active")
                        })
                  }

                  const desktopMouseUpHandler = () => {
                        $(".desktop-drag").remove()
                        $("w-desktop-icon:last-of-type").focus() // Focus on the last element selected
                        $(document).off("mousemove touchmove", "w-desktop", desktopMouseMoveHandler)
                        $(document).off("mouseup touchend", "w-desktop", desktopMouseUpHandler)
                  }
            } 
            desktopDrag()
      }
}
customElements.define("w-desktop", Desktop)

class DesktopIcon extends HTMLElement {
      constructor(args) {
            super()
            this.id = (args ? args.id : $(this).attr("data-id"))
            this.icon = (args ? args.icon : $(this).attr("data-icon"))
            this.text = (args ? args.text : $(this).attr("data-text"))
            this.action = ((args ? args.action : $(this).attr("data-action")) ?? "")
            $(this).html(this.html())
            $(this).attr("tabindex", 0)
            $(this).attr("draggable", true)
      }

      html() {
            return `
                  <img src="${this.icon}" draggable="false">
                  <span>${this.text}</span>
            `
      }

      connectedCallback() {
            this.eventHandlers()
      }

      buildCxt() {
            let cxt 

            if(this.id == "mycomputer") {
                  return {
                        top_buttons: [
                              { tooltip: "Rename", icon: cxt_rename },
                              { tooltip: "Delete", icon: cxt_delete }
                        ],
                        buttons: [
                              { text: "Open", icon: base64_icon_fileexplorer, action: this.action },
                              { text: "Map network drive...", icon: cxt_mapnetwork },
                              { text: "Disconnect network drive...", icon: cxt_disconnectmap },
                              { text: "Pin to Quick access", icon: cxt_pin },
                              { text: "Pin to Start", icon: cxt_pin },
                              { text: "Properties", icon: cxt_properties },
                              { text: "---" },
                              { text: "Show more options", icon: base64_showmoreoptions_tiny },
                        ]
                  }
            }

            if(this.id == "recyclebin") {
                  return {
                        top_buttons: [
                              { tooltip: "Rename", icon: cxt_rename }
                        ],
                        buttons: [
                              { text: "Open", icon: base64_icon_fileexplorer, action: this.action },
                              { text: "Empty Recycle Bin", icon: cxt_delete },
                              { text: "Pin to Quick access", icon: cxt_pin },
                              { text: "Pin to Start", icon: cxt_pin },
                              { text: "Properties", icon: cxt_properties },
                              { text: "---" },
                              { text: "Show more options", icon: base64_showmoreoptions_tiny },
                        ]
                  }
            }

            if(this.id == "documents") {
                  return {
                        top_buttons: [
                              { tooltip: "Cut", icon: base64_cut },
                              { tooltip: "Copy", icon: cxt_copy },
                              { tooltip: "Rename", icon: cxt_rename },
                              { tooltip: "Share", icon: base64_share },
                              { tooltip: "Delete", icon: cxt_delete }
                        ],
                        buttons: [
                              { text: "Open", icon: base64_icon_fileexplorer, action: this.action },
                              { text: "Open folder location", icon: cxt_folderlocation },
                              { text: "Pin to Quick access", icon: cxt_pin },
                              { text: "Pin to Start", icon: cxt_pin },
                              { text: "Copy as path", icon: cxt_copyaspath },
                              { text: "Properties", icon: cxt_properties },
                              { text: "---" },
                              { text: "Show more options", icon: base64_showmoreoptions_tiny },
                        ]
                  }
            }

            if(this.id == "msedge") {
                  return {
                        top_buttons: [
                              { tooltip: "Cut", icon: base64_cut },
                              { tooltip: "Copy", icon: cxt_copy },
                              { tooltip: "Rename", icon: cxt_rename },
                              { tooltip: "Share", icon: base64_share },
                              { tooltip: "Delete", icon: cxt_delete }
                        ],
                        buttons: [
                              { text: "Open", icon: base64_icon_edge, action: `Window.spawnWindow('msedge')` },
                              { text: "Open folder location", icon: cxt_folderlocation },
                              { text: "Pin to Quick access", icon: cxt_pin },
                              { text: "Pin to Start", icon: cxt_pin },
                              { text: "Copy as path", icon: cxt_copyaspath },
                              { text: "Properties", icon: cxt_properties },
                              { text: "---" },
                              { text: "Show more options", icon: base64_showmoreoptions_tiny },
                        ]
                  }
            }
      }

      eventHandlers() {
            let _this = this
            let activeEl 

            $(this).on("mousedown touchstart", function(e) {
                  activeEl = $(document.activeElement).index()
                  //e.preventDefault()
            })
            
            $(this).on("mouseup touchend", function(e) {
                  setTimeout(() => {
                        if(e.shiftKey) {
                              $("w-desktop-icon").slice([activeEl, $(_this).index() + 1].sort()).addClass("active")
                              $(_this).focus()
                        }else{
                              $(_this).focus().addClass("active")
                        }
                  }, 10)
                  e.preventDefault()
            })

            $(this).on("contextmenu", function(e) {
                  let el = $(e.currentTarget.offsetParent)
                  let cxt = _this.buildCxt()

                  window["desktop_context"] = new ContextMenu({
                        id: "desktop_context",
                        pos: {
                              x: e.pageX,
                              y: e.pageY
                        },
                        taskbar_context: false,
                        buttons: cxt.buttons,
                        top_buttons: cxt.top_buttons
                  })
                  $("w-desktop").append(window["desktop_context"])

                  e.preventDefault()  
            })

            $(this).on("dblclick", function(e) {
                  eval(_this.action)
                  e.preventDefault()  
            })    
          
            $(this).on("dragstart", function(e) {
                  $(this).addClass("dragging")
            })
            
            $(this).on("dragover", function(e) {
                  closest = $(this).closest("w-desktop-icon:not(.dragging)")
            
                  $("w-desktop-icon").removeClass("dragHovered above below")
                  
                  if(closest.length) {
                        // Is ghost above or below item?
                        let closestCoords = $(closest)[0].getBoundingClientRect()
                        if(e.clientY < (closestCoords.y + closestCoords.height / 2)) {
                              $(closest).addClass("dragHovered above")
                              ab = "above"
                        }else{
                              $(closest).addClass("dragHovered below")
                              ab = "below"
                        }
                  }
                  e.preventDefault()
            })
            
            $(this).on("dragend", function(e) {
                  $("w-desktop-icon").removeClass("dragHovered dragging above below")
                  if(ab == "above") {
                        $(closest).before($(this))
                  }else{
                        $(closest).after($(this))
                  } //$(closest).swapWith($(this))
            })

            /*
            $(this).draggable({
                  containment: "parent", grid: [ 100,100 ], opacity: 0.7
            })
            */
      }
}
customElements.define("w-desktop-icon", DesktopIcon)
class StartMenu extends HTMLElement {
    constructor(args) {
        super()
        $(this).html(this.html())
        this.applyTheme()
        this.init()
    }

    applyTheme() {
        $(this)[0].style.setProperty("--theme", window["theme"]) 
    }

    html() {
        return `
            <div class="start-search">
                <div class="search-bar">
                    <img src="${base64_start_search}">
                    <input type="search" id="tskbtn_search" class="search" placeholder="Search for apps, settings, and documents">
                </div>
            </div>
            
            <div class="start_slide">

                <div class="left">
                        <div class="pinned-title">
                            <b>Pinned</b>
                            <div class="thin-btn all_apps">All apps&emsp;></div>
                        </div>
                        
                        <div class="pinned-apps"></div>
                        
                        <div class="pinned-title">
                            <b>Recommended</b>
                            <div class="thin-btn">More&emsp;></div>
                        </div>
                        
                        <div class="pinned-apps recommended"></div>
                </div>

                <div class="right">
                        <div class="pinned-title">
                            <b>All apps</b>
                            <div class="thin-btn all_apps_back"><&emsp;Back</div>
                        </div>

                        <div class="all-apps"></div>
                </div>
            </div>

            
            <div class="footer">
                <div class="account" data-bs-toggle="tooltip" title="Dan Wheeler">
                        <img src="https://i.postimg.cc/SRF6ZBRx/15175744784262.jpg">
                        Dan Wheeler
                </div>

                <div class="power" data-bs-toggle="tooltip" title="Power">
                        <img src="${icon_power}">
                </div>
            </div>
        `
    }

    init() {
        setTimeout(() => {
            // Add Pinned Icons
            this.addIcons("w-startmenu .pinned-apps:not(.recommended)", [
                new StartMenuIcon({
                    "icon": base64_getstarted_small,
                    "title": "Get Started",
                    "app": "getstarted"
                }),
                new StartMenuIcon({
                    "icon": "https://i.postimg.cc/zGWXVLpd/fileexplorer.png",
                    "title": "File Explorer",
                    "app": "explorer",
                    "action": { titlebar: "Documents", icon: base64_icon_documents, path: "documents" }
                }),
                new StartMenuIcon({
                    "icon": "https://i.postimg.cc/90RsJn8c/notepad.png",
                    "title": "Notepad",
                    "app": "notepad"
                }),
                new StartMenuIcon({
                    "icon": "https://i.postimg.cc/NFb6WsKt/microsoftstore.png",
                    "title": "Microsoft Store"
                })
            ])

            // Add Recommended Icons
            this.addIcons("w-startmenu .pinned-apps.recommended", [
                new StartMenuIcon({
                    "icon": base64_icon_settings,
                    "title": "Settings",
                    "subtitle": "For you",
                    "app": "settings"
                }),
                new StartMenuIcon({
                    "icon": base64_icon_help,
                    "title": "About",
                    "subtitle": "By x2i",
                    "action": "alert('By Dan Wheeler 2023')"
                })
            ])

            // Add All Apps Icons
            this.addIcons("w-startmenu .all-apps", [
                "<div class='header'>C</div>",
                new StartMenuAllIcon({
                    "icon": base64_cmd,
                    "title": "Command Prompt",
                    "app": "cmd"
                }),
                "<div class='header'>E</div>",
                new StartMenuAllIcon({
                    "icon": base64_icon_explorer,
                    "title": "Explorer",
                    "app": "explorer"
                }),
                "<div class='header'>G</div>",
                new StartMenuAllIcon({
                    "icon": base64_getstarted_small,
                    "title": "Get Started",
                    "app": "getstarted"
                }),
                "<div class='header'>G</div>",
                new StartMenuAllIcon({
                    "icon": base64_icon_notepad,
                    "title": "Notepad",
                    "app": "notepad"
                }),
                "<div class='header'>S</div>",
                new StartMenuAllIcon({
                    "icon": base64_icon_settings,
                    "title": "Settings",
                    "app": "settings"
                }),
                "<div class='header'>T</div>",
                new StartMenuAllIcon({
                    "icon": base64_icon_taskmgr,
                    "title": "Task Manager",
                    "app": "taskmanager"
                })
            ])

            // Fix positioning
            $(this).css({
                "top": `${$(document).height() - $(window["taskbar"]).height()}`,
                "left": `${$(window).width() / 2 - (this.clientWidth / 2)}px`,
                "animation": "slideUp .2s forwards"
            })
        }, 1)
        setTimeout(() => {
            closeToolTips()
            reinit_tooltips()
        }, 200)
    }

    connectedCallback() {
        this.eventHandlers()
    }

    addIcons(section, icons) {
        $(section).append(icons)
    }

    closeStartMenu() {
        let _this = this
        $(window["start_menu"]).css({"animation": "slideFadeDown .3s forwards"})
        setTimeout(() => {
            closeToolTips()
            _this.remove()
        }, 200)
        delete window["start_menu"]
    }


    eventHandlers() {
        let _this = this

        $(window).on("resize", function(e) {
            $(_this).css({
                "left": `${$(window).width() / 2 - ($(window["start_menu"]).width() / 2)}px`
            })
            /*
            "top": `${_this.pos.y}`,
            "scale": `${($(window).height() / ($(window).height() * 2.05))}` 
            */
        })

        $(this).on("click", ".all_apps", function(e) {
            $(_this).find(".left").css({ "transform": "translate(-100%)" })
            $(_this).find(".right").css({ "transform": "translate(-100%)" })
        })
        $(this).on("click", ".all_apps_back", function(e) {
            $(_this).find(".left").css({ "transform": "translate(0%)" })
            $(_this).find(".right").css({ "transform": "translate(0%)" })
        })

        // Account Button
        $(this).on("click contextmenu", ".account", function(e) {
            if($("w-context-menu").length) {
                $("w-context-menu")[0].closeContext()
            }
            window["account_context"] = new ContextMenu({
                id: "account_context",
                pos: {
                        x: $(this).offset().left,
                        y: $(this).offset().top
                },
                taskbar_context: false,
                buttons: [
                        { 
                            icon: icon_changeaccount, 
                            text: "Change account settings" 
                        },
                        { 
                            icon: icon_lock, 
                            text: "Lock" 
                        },
                        { 
                            icon: icon_signout, 
                            text: "Sign out" 
                        },
                        { text: "---" },  
                        { 
                            icon: icon_switchuser, 
                            text: "Switch user" 
                        }
                ]
            })
            $(window["desktop"]).append(window["account_context"])
            
            e.stopImmediatePropagation()
            e.preventDefault()
        })

        // Power Button
        $(this).on("click contextmenu", ".power", function(e) {
            if($("w-context-menu").length) {
                $("w-context-menu")[0].closeContext()
            }
            window["power_context"] = new ContextMenu({
                id: "power_context",
                pos: {
                    x: $(this).offset().left,
                    y: $(this).offset().top
                },
                taskbar_context: false,
                buttons: [
                    { 
                        icon: taskman_settings, 
                        text: "Sign-in options" 
                    },
                    { text: "---" },
                    { 
                        icon: icon_sleep, 
                        text: "Sleep" 
                    },
                    { 
                        icon: icon_power, 
                        text: "Shut down" 
                    },
                    { 
                        icon: icon_restart, 
                        text: "Restart" 
                    }
                ]
            })
            $(window["desktop"]).append(window["power_context"])
            
            e.stopImmediatePropagation()
            e.preventDefault()
        })

        // Click outside of context
        $("*").on("click contextmenu", function(e) {
            if($(window["start_menu"]).length && !hasParents(e, "w-startmenu") && !hasParents(e, ".start")) {
                _this.closeStartMenu()
                $(this).off()
            }
            e.preventDefault()
        })

        $(this).on("contextmenu", function(e) {
            if(hasParents(e, "w-startmenu")) {
                if($("w-context-menu").length) {
                    $("w-context-menu")[0].closeContext()
                }
                window["startmenu_context"] = new ContextMenu({
                    id: "startmenu_context",
                    pos: {
                        x: e.pageX,
                        y: e.pageY
                    },
                    taskbar_context: false,
                    buttons: [
                        { 
                                icon: taskman_settings, 
                                text: "Start settings" 
                        }
                    ]
                })
                $(window["desktop"]).append(window["startmenu_context"])
            }
            e.stopImmediatePropagation()
            e.preventDefault()
        })
    }
}
customElements.define("w-startmenu", StartMenu)




class StartMenuIcon extends HTMLElement {
    constructor(args) {
        super()
        this.icon = args.icon
        this.title = args.title
        this.app = args.app
        this.action = args.action
        this.subtitle = args.subtitle
        $(this).html(this.html())
    }

    html() {
        return `
            <img src="${this.icon}">
            <span>
                ${this.title}
                <small>${(this.subtitle ?? "")}</small>
            </span>
        `
    }

    connectedCallback() {
        this.eventHandlers()
    }

    eventHandlers() {
        let _this = this
        
        $(this).on("click", function(e) {
            if(this.app) {
                Window.spawnWindow(_this.app, _this.action)
                window["start_menu"].closeStartMenu()
            }else{
                eval(this.action)
            }
        })
    }
}
customElements.define("w-startmenu-icon", StartMenuIcon)



class StartMenuAllIcon extends HTMLElement {
    constructor(args) {
        super()
        this.icon = args.icon
        this.title = args.title
        this.app = args.app
        this.action = args.action
        $(this).html(this.html())
    }

    html() {
        return `
            <img src="${this.icon}">
            <span>
                ${this.title}
            </span>
        `
    }

    connectedCallback() {
        this.eventHandlers()
    }

    eventHandlers() {
        let _this = this
        
        $(this).on("click", function(e) {
            if(this.app) {
                Window.spawnWindow(_this.app, _this.action)
                window["start_menu"].closeStartMenu()
            }else{
                eval(this.action)
            }
        })
    }
}
customElements.define("w-startmenuall-icon", StartMenuAllIcon)
class Taskbar extends HTMLElement {
    constructor(args) {
        super()
        this.id = args.id
        this.center_buttons = args.center_buttons
        this.system_tray = args.system_tray

        $(this).html(this.html())
        this.applyTheme()
        this.drawSections()
    }

    applyTheme() {
        $(this)[0].style.setProperty("--theme", window["theme"]) 
    }

    html() {
        return `
            <div class="left"></div>
            <div class="center"></div>
            <div class="right"></div>
        `
    }

    drawSections() {
        $(this).find(".center").append(this.center_buttons)
        setTimeout(() => {
            // Pull center part to the right to compensate for the sys tray
            $(this).find(".center").css({"margin-right": `-${($(this).find(".center").width() / 2)}px`})
        })
        $(this).find(".right").append(this.system_tray)
    }

    connectedCallback() {
        this.eventHandlers()
    }

    eventHandlers() {
        let _this = this

        $(this).on("contextmenu", function(e) {
            if(e.target.nodeName == "W-TASKBAR") {
                if($("w-context-menu").length) {
                    $("w-context-menu")[0].closeContext()
                }
                window["taskbar_context"] = new ContextMenu({
                    id: "taskbar_context",
                    pos: {
                        x: e.pageX,
                        y: $(window["taskbar"]).position().top
                    },
                    taskbar_context: true,
                    buttons: [
                        { 
                            icon: base64_taskmanager, 
                            text: "Task Manager",
                            action: `Window.spawnWindow('taskmanager')`
                        },
                        { 
                            icon: base64_taskbarsettings,
                            text: "Taskbar settings",                                          
                            action: `Window.spawnWindow('settings')`
                        }
                    ]
                })
                $(window["desktop"]).append(window["taskbar_context"])
            }
            e.preventDefault()
            e.stopImmediatePropagation()
        })
    }
}
customElements.define("w-taskbar", Taskbar)
class TaskbarSearchButton extends HTMLElement {
      constructor(args) {
            super()
            this.id = args.id
            $(this).html(this.html())
      }

      html() {
            return `
                  <div class="search" tabindex="0">
                        <img src="${base64_search}">
                        Search
                  </div>
            `
      }      
      
      connectedCallback() {
            this.eventHandlers()
      }

      eventHandlers() {
            let _this = this

            $(this).on("click", function(e) {
                  if($(window["search_menu"]).length) {
                        window["search_menu"].closeSearchMenu()
                  }else{
                        window["search_menu"] = new SearchMenu()
                        $("w-desktop").append(window["search_menu"])
                        pauseToolTips(true)
                  }
                  $(this).focus()
                  e.stopImmediatePropagation()
            })

      }
}
customElements.define("w-taskbar-search", TaskbarSearchButton)
class SearchMenu extends HTMLElement {
    constructor(args) {
        super()
        //this.pos = args.pos
        $(this).html(this.html())
        this.applyTheme()
        this.init()
    }

    applyTheme() {
        $(this)[0].style.setProperty("--theme", window["theme"]) 
    }

    html() {
        return `
            <div class="search-search">
                <div class="search-bar">
                    <img src="${base64_start_search}">
                    <input type="search" id="tskbtn_search" class="search" placeholder="Search for apps, settings, and documents">
                </div>
            </div>
            <div class="split">
                <div class="left">
                        <b>Suggested</b><br>
                        <w-searchmenu-recent-items></w-searchmenu-recent-items>
                </div>
                <div class="right">
                        <b>Quick Searches</b><br>
                        <w-searchmenu-quicksearches></w-searchmenu-quicksearches>
                </div>
            </div>
        `
    }

    init() {
        $("w-taskbar .search").addClass("focus")

        setTimeout(() => {
            // Fix positioning
            $(this).css({
                "top": `${$(document).height() - $(window["taskbar"]).height()}`,
                "left": `${$(window).width() / 2 - (this.clientWidth / 2)}px`,
                "animation": "slideUp .2s forwards"
            })
        }, 1)
        
        setTimeout(() => {
            $("#searchbtn_search").focus()
            pauseToolTips(false)
        }, 200)
    }

    connectedCallback() {
        this.eventHandlers()
    }

    closeSearchMenu() {
        let _this = this

        $("w-taskbar .search").removeClass("focus")

        $(window["search_menu"]).css({"animation": "slideFadeDown .3s forwards"})
        setTimeout(() => {
                _this.remove()
        }, 200)
        delete window["search_menu"]
    }


    eventHandlers() {
        let _this = this

        $(window).on("resize", function(e) {
            $(_this).css({
                "left": `${$(window).width() / 2 - ($(window["search_menu"]).width() / 2)}px`
            })
        })
        
        // Click outside of context
        $("*").on("click contextmenu", function(e) {
            if($(window["search_menu"]).length && !hasParents(e, "w-searchmenu") && !hasParents(e, "w-taskbar-search")) {
                _this.closeSearchMenu()
                //$(this).off()
            }
            e.preventDefault()
        })
    }
}
customElements.define("w-searchmenu", SearchMenu)



class SearchMenuRecentItems extends HTMLElement {
    constructor(args) {
        super()
        $(this).html(this.html())
    }

    html() {
        let res = [
            `<div class="item"><img src="${base64_getstarted_small}"> Get Started</div>`,
            `<div class="item"><img src="${base64_icon_fileexplorer}"> File Explorer</div>`,
            `<div class="item"><img src="${base64_cmd}"> Command Prompt</div>`
        ]
        return res
    }
}
customElements.define("w-searchmenu-recent-items", SearchMenuRecentItems)



class SearchMenuQuickSearches extends HTMLElement {
    constructor(args) {
        super()
        $(this).html(this.html())
    }

    html() {
        let res = [
            `<div class="item">Focus settings</div>`,
            `<div class="item">Sound settings</div>`,
            `<div class="item">Bluetooth & devices</div>`,
            `<div class="item">Display settings</div>`,
            `<div class="item">Colour settings</div>`,
            `<div class="item">Search settings</div>`
        ]
        return res
    }
}
customElements.define("w-searchmenu-quicksearches", SearchMenuQuickSearches)
class TaskbarButton extends HTMLElement {
      constructor(args) {
            super()
            this.id = args.id
            this.btn_type = args.btn_type
            this.w_title = args.w_title
            this.icon = args.icon
            this.pinned = args.pinned
            this.app = args.app
            this.applyTheme()
            this.applyAttrs()
      }

      html() {
            return `
                  <span class="icon-img" style="background-image: url(${this.icon});"></span>
            `
      }

      applyTheme() {
            $(this)[0].style.setProperty("--theme", window["theme"]) 
            if(this.btn_type == "start") this.icon = (window["theme"] == "dark" ? base64_startbtn_dark : base64_startbtn)
            $(this).html(this.html())
      }

      applyAttrs() {
            $(this).attr("id", `tskbtn_${this.id}`)
            $(this).attr("tabindex", 0)
            $(this).attr("data-bs-toggle", "tooltip")
            $(this).attr("data-bs-placement", "top")
            $(this).attr("title", this.w_title)
            $(this).attr("data-context-id", `ctx_${this.id}`)

            if(this.btn_type == "start") {
                  $(this).attr("class", "button start")
            }else{
                  $(this).attr("class", "button")
                  $(this).attr("data-tskbtn-id", this.id)
                  $(this).attr("data-pinned", this.pinned)
                  $(this).attr("data-app", this.app)
                  $(this).attr("data-app-title", this.w_title)
                  $(this).attr("data-app-icon", this.icon)
            }
      }

      connectedCallback() {
            this.eventHandlers()
      }

      createContext() {
            if(this.btn_type == "start") {
                  return [
                        { text: "Installed apps" },
                        { text: "Mobility Centre" },
                        { text: "Power Options" },
                        { text: "Event Viewer" },
                        { text: "System" },
                        { text: "Device Manager" },
                        { text: "Network Connections" },
                        { text: "Disk Management" },
                        { text: "Computer Management" },
                        { text: "Terminal" },
                        { text: "Terminal (Admin)" },
                        { text: "---" },
                        { text: "Task Manager" },
                        { text: "Settings" },
                        { text: "File Explorer" },
                        { text: "Search" },
                        { text: "Run" },
                        { text: "---" },                        
                        { text: "Shut down or sign out" },
                        { text: "Desktop" }
                  ]
            }else{
                  let cxt, wndCnt

                  wndCnt = $(`w-window[data-app=${this.app}]`).length

                  cxt = [
                        {
                              icon: this.icon,
                              text: $(this).attr("data-app-title"),
                              action: `Window.spawnWindow('${$(this).attr("data-app")}')`
                        }
                  ] 

                  // Add close Window if any windows of this button exist
                  if(wndCnt) {
                        cxt.push({ 
                              icon: base64_closewindow,
                              text: (wndCnt == 1 ? "Close Window" : "Close all windows on this display"),
                              action: `$(\`w-window[data-app=${this.app}]\`).map(function(e, i) {
                                    i.closeWindow()
                              })`
                        })
                  }


                  return cxt
            }
      }

      eventHandlers() {
            let _this = this

            // Context menu
            $(this).on("contextmenu", function(e) {
                  parent = e.currentTarget.offsetParent
                  window[$(this).attr("data-context-id")] = new ContextMenu({
                        id: $(this).attr("data-context-id"),
                        pos: {
                              x: (this.offsetLeft * 1.04),
                              y: parent.offsetTop
                        },
                        taskbar_context: true,
                        buttons: this.createContext()
                  })
                  $("w-desktop").append(window[$(this).attr("data-context-id")])
                  $(this).focus()
                  pauseToolTips(true)
                  e.preventDefault()
                  e.stopImmediatePropagation()
            })

            $(this).on("click", function(e) {
                  if(this.btn_type == "start") { // Start menu
                        if(window["start_menu"]) {
                              window["start_menu"].closeStartMenu()
                        }else{
                              window["start_menu"] = new StartMenu()
                              $("w-desktop").append(window["start_menu"])
                        }
                  }else{
                        // Is app already open - one instance?
                        let wlen = $(`w-window[data-app=${this.app}]`).length
                        if(wlen) {
                              if(wlen == 1) {
                                    let wid = $(`w-window[data-app=${this.app}]`).attr("id")
                                    if(window[wid].state == 0) {
                                          window[wid].unminimizeWindow()
                                    }
                                    window[wid].focusWindow()
                              }else if(wlen > 1) {
                                    return
                              }
                        }else{
                              if($(this).attr("data-app") == "explorer") {
                                    Window.spawnWindow($(this).attr("data-app"), { titlebar: "Documents", icon: base64_icon_documents, path: "documents" })
                              }else{
                                    Window.spawnWindow($(this).attr("data-app"))
                              }
                        }
                  }
                  $(this).focus()
                  e.stopImmediatePropagation()
            })

            $(this).on("middleclick dblclick", function(e) {
                  if(_this.btn_type != "start") {
                        if($(this).attr("data-app") == "explorer") {
                              Window.spawnWindow($(this).attr("data-app"), { titlebar: "Documents", icon: base64_icon_documents, path: "documents" })
                        }else{
                              Window.spawnWindow($(this).attr("data-app"))
                        }
                  }
            })

            $(this).on("mouseover", function(e) {
                  if(!$("w-context-menu").length) {
                        if(window["taskbar_thumbs"]) window["taskbar_thumbs"].close()
                        if($(`w-window[data-app=${this.app}]`).length) {
                              _this.createThumbnailPreviews(e)
                        }
                  }else{
                        pauseToolTips(true)
                        if($("w-taskbar-thumbnails").length) $("w-taskbar-thumbnails")[0].close()
                  }
            })
      }
      
      createThumbnailPreviews(e) {
            if(!window["taskbar_thumbs"]) {
                  $("w-desktop").append(window["taskbar_thumbs"] = new TaskbarThumbnails({
                        apps: this.app,
                        pos: {
                              x: e.pageX,
                              y: 0
                        }
                  }))
            }
      }
}
customElements.define("w-taskbar-button", TaskbarButton)
class TaskbarThumbnails extends HTMLElement {
      constructor(args) {
            super()
            this.apps = args.apps
            this.pos = args.pos

            this.fillThumbs().then((e) => {
                  $(this).html(e).attr("style", `--theme: ${window["theme"]}`)
            })
      }

      async fillThumbs(e) {
            let ico = false
            $("w-taskbar-thumbnails").html("")
            return await new Promise((resolve) => {
                  $(`w-window[data-app=${this.apps}]`).each(function() {
                        screenshotElement($(this)).then((e) => {
                              if($(this).attr("state") == 0) {
                                    e = $(this).attr("data-app-icon")
                                    ico = true
                              }
                              $("w-taskbar-thumbnails").append(`
                                    <div class="thumb" data-wid="${$(this).attr("id")}">
                                          <span>
                                                <img src="${$(this).attr("data-app-icon")}">
                                                <p>${$(this).attr("data-app-title")}</p>
                                                <i class="fa fa-times"></i>
                                          </span>
                                          <img class="thumbimg ${(ico ? "icon" : "")}" src="${e}">
                                    </div>
                              `)
                        })
                  })
                  this.init()
                  resolve()
            })
      }
      
      init() {
            setTimeout(() => {
                  this.reposition()
                  $(this).css({
                        "opacity": 1
                  }).fadeIn(100)
            }, 100)
            closeToolTips()
            pauseToolTips(true)
      }

      connectedCallback() {
            this.eventHandlers()
      }

      reposition() {
            setTimeout(() => {
                  $(this).css({
                        "top": $(window["taskbar"]).position().top - $(this).height() - 10,
                        "left": this.pos.x - ($(this).width() / 2)
                  }) 
            }, 100)
      }

      eventHandlers() {
            let _this = this
            let previouslyFocused
            let previousState

            $(this).on("click", ".thumb", function(e) {
                  $("w-window").show()
                  if(window[$(this).attr("data-wid")].state == 0) window[$(this).attr("data-wid")].unminimizeWindow(false)
                  setTimeout(() => {
                        window[$(this).attr("data-wid")].focusWindow()
                  }, 100)
                  _this.close()
                  $(this).off()
            })

            $(this).on("click", ".thumb .fa-times", function(e) {
                  let wid = $(this).parent().parent().attr("data-wid")
                  window[wid].closeWindow()
                  _this.close()
                  $(this).off()
            })

            $(this).on({
                  mouseleave: function() {
                        _this.close()
                  }
            })

            $(this).on({
                  mouseenter: function() {
                        previouslyFocused = $("w-window[focused=true]").attr("id")
                        previousState = window[$(this).attr("data-wid")].state

                        // Opaque all other windows except this
                        $(`w-window:not(#${$(this).attr("data-wid")})`).hide()

                        // If window minimized, then restore/maximize to show
                        if(previousState == 0) {
                              if(window[$(this).attr("data-wid")].oldstate == 1) window[$(this).attr("data-wid")].restoreWindow()
                              if(window[$(this).attr("data-wid")].oldstate == 2) window[$(this).attr("data-wid")].maximizeWindow(false)
                        }
                        window[$(this).attr("data-wid")].focusWindow(false)
                  },
                  mouseleave: function() {
                        $("w-window").show()
                        if(previousState == 0) {
                              window[$(this).attr("data-wid")].minimizeWindow(false)
                        }else{
                              window[previouslyFocused].focusWindow()
                        }
                  }
            }, ".thumb")
      }

      close() {
            pauseToolTips(false)
            $("w-window *").css({"opacity": "1"})
            $(this).remove()
            delete window["taskbar_thumbs"]
      }
}
customElements.define("w-taskbar-thumbnails", TaskbarThumbnails)
class Window extends HTMLElement {
      constructor(args) {
            super()
            this.wid = args.wid
            this.app = args.app.toLowerCase()
            this.icon = args.icon
            this.w_title = args.w_title

            this.secondary_args = (args.secondary_args ?? false)

            this.pos = args.pos
            this.oldpos = this.pos
            this.colorScheme = (args.colorScheme ?? { r:231, g:236, b:249, a:0.9 })
            this.state = (args.state ?? 1) //0=minimized, 1=default, 2=maximized
            this.oldstate = this.state
            this.draggable = (args.draggable ?? true)

            this.icons = (args.icons ?? {min: true, max: true, close: true})
            this.minimizeIcon = svg_minimize
            this.maximizeIcon = svg_maximize
            this.closeIcon = svg_close

            $(this).html(this.html())
            this.applyTheme()
            this.init()
      }

      applyTheme() {
            $(this)[0].style.setProperty("--theme", window["theme"]) 
      }

      html() {
            return `
                  <div class="header">
                        <span class="icon handle" style="background-image: url(${this.icon})"></span>
                        <span class="title handle">${this.w_title}</span>
                        <spacer>
                        <div class="icons">
                              ${(this.icons.min ? `<span class='button button-min' data-bs-toggle='tooltip' title='Minimize'>${this.minimizeIcon}</span>` : "")}
                              ${(this.icons.max ? `<span class='button button-max'' data-bs-toggle='tooltip' title='Maximize'>${this.maximizeIcon}</span>` : "")}
                              ${(this.icons.close ? `<span class='button button-close' data-bs-toggle='tooltip' title='Close'>${this.closeIcon}</span>` : "")}
                        </div>
                  </div>` + eval(`new App_${ucwords(this.app)}({ wid: '${this.wid}', path: '${this.secondary_args.path}' })`).outerHTML
      }

      init() {
            $(`w-window`).attr("focused", false) // unfocus all other windows

            $(this).attr("id", this.wid)
            $(this).attr("draggable", false)
            $(this).attr("data-draggable", (this.draggable ? true : false))
            $(this).attr("focused", true)
            $(this).attr("data-app", this.app)
            $(this).attr("data-app-title", this.w_title)
            $(this).attr("data-app-icon", this.icon)

            this.redrawWindow()
            this.focusWindow()

            setTimeout(() => {
                  if($("w-taskmanager").length && window["tasklist"]) $("w-taskmanager .app-list").after(window["tasklist"].draw()) // Update taskmanager
            })
      }

      connectedCallback() {
            this.eventHandlers()
            reinit_tooltips()
      }

      redrawWindow(animate = true) {
            let _this = this

            if(animate) $(this).css({ "animation": "windowFadeIn .2s forwards" })

            $(this).css({
                  "top": this.pos.y,
                  "left": this.pos.x,
                  "height": this.pos.h,
                  "width": this.pos.w
            }).attr("state", this.state)

            setTimeout(() => {
                  $(_this).removeClass("transition")
                  this.taskbarUpdate()
                  closeToolTips()
            })
      }

      eventHandlers() {
            let _this = this
            
            // Minimize Button
            $(this).on("click", `.button-min`, function() {
                  _this.minimizeWindow()
            })

            // Maximize Button
            $(this).on("click", `.button-max`, function() {
                  _this.maximizeWindow()
            })

            // Maximize on titlebar doubleclick
            $(this).on("dblclick", `.handle`, function() {
                  if(_this.state == 2) {
                        _this.restoreWindow()
                  }else{
                        _this.maximizeWindow()
                  }
            })

            // Restore Button
            $(this).on("click", `.button-restore`, function() {
                  _this.restoreWindow()
            })

            // Close button
            $(this).on("click", `.button-close`, function() {
                  _this.closeWindow()
            })

            // Focus Window
            $(this).on("focus click mousedown", function() {
                  _this.focusWindow()
            })

            // TODO: Update location variables 
            $(this).on("mouseup", function(e) {
                  _this.pos = {
                        x: $(this).position().left,
                        y: $(this).position().top,
                        h: $(this).height(),
                        w: $(this).width()   
                  }
            })

            // Prevent right click on titlebar buttons
            $(this).on("contextmenu", ".icons", function(e) {
                  e.preventDefault()
                  e.stopImmediatePropagation()
            })

            // Right click title bar context
            $(this).on("contextmenu", ".handle", function(e) {
                  window[`cxt_${_this.id}`] = new ContextMenu({
                        id: `cxt_${_this.id}`,
                        pos: {
                              x: e.pageX,
                              y: e.pageY
                        },
                        compact: true,
                        taskbar_context: false,
                        buttons: [
                              {
                                    icon: base64_restore_tiny,
                                    text: "Restore",
                                    disabled: true
                              },
                              {
                                    icon: base64_transparent,
                                    text: "Move",
                                    disabled: true
                              },
                              {
                                    icon: base64_transparent,
                                    text: "Size",
                                    disabled: true
                              },
                              {
                                    icon: base64_maximize_tiny,
                                    text: "Maximize"
                              },
                              {
                                    icon: base64_minimize_tiny,
                                    text: "Minimize"
                              },
                              { text: "---" },    
                              {
                                    icon: base64_close_tiny,
                                    text: "<b>Close</b>"
                              },
                              
                        ]
                  })
                  $("w-desktop").append(window[`cxt_${_this.id}`])
                  
                  e.preventDefault()                  
                  e.stopImmediatePropagation()
            })

            reinitResizables(this)
            reinitDraggables(this)
      }

      minimizeWindow(animate = false) {
            this.oldstate = this.state
            this.state = 0
            $(this).css({
                  "bottom": 0,
                  "animation": `windowZoomDown ${(animate ? ".2s" : "0s")} forwards`
            }).attr("state", this.state)
            setTimeout(() => {
            }, 190)
      }

      maximizeWindow(storeOldState = true) {
            this.state = 2
            if(storeOldState) this.oldpos = this.pos
            $(this).addClass("maximized transition").attr("state", this.state)

            // Get taskbar height so not to make 100% height all the way
            let taskbar_height = $("w-taskbar").height()
            this.pos = { h:`calc(100% - ${taskbar_height}px - 8px)`, w:"100%", x:0, y:0 }

            $(`#${this.wid} .button-max`).removeClass("button-max").addClass("button-restore").attr("w_title", "Restore")
            reinit_tooltips()
            this.redrawWindow()
      }

      unminimizeWindow(animate = true) {
            if(this.state == 0) {
                  $(this).css({
                        "animation": `windowZoomUp ${(animate ? ".2s" : "0s")} forwards`
                  })
            }
            this.state = this.oldstate
            $(this).attr("state", this.state)
            setTimeout(() => {
                  this.focusWindow()
            }, 190)
      }

      restoreWindow() {
            this.state = 1
            $(this).addClass("transition").removeClass("maximized").attr("state", this.state)
            this.pos = this.oldpos

            $(`#${this.wid} .button-restore`).removeClass("button-restore").addClass("button-max")

            this.redrawWindow()
      }

      toggleMaximize() {
            if(this.state == 0 || this.state == 2) {
                  this.restoreWindow()
            }else{
                  this.maximizeWindow()
            }
      }

      focusWindow() {
            $(`w-window`).css({ "z-index": 0 }).attr("focused", false) // unfocus all other windows
            $(this).css({ 
                  "z-index": 1,
                  "opacity": 1
            }).attr("focused", true)

            this.taskbarUpdate()
      }

      closeWindow() {
            closeToolTips()
            $(this).css({
                  "animation": "windowFadeOut .2s forwards"
            })

            setTimeout(() => {
                  $(this).remove()
                  this.taskbarUpdate()
                  $(document).find("w-window").click() //  make nearest window focused instead

                  if($("w-taskmanager").length && window["tasklist"]) $("w-taskmanager .app-list").after(window["tasklist"].draw()) // Update taskmanager
            }, 190)

            // Remove icon from taskbar if not already pinned
            $("w-taskbar").find(`w-taskbar-button[data-app=${this.app}]:not([data-pinned])`).remove() 
            
            this.remove
      }

      taskbarUpdate() {
            // Show icon as being active
            if($(`w-window[data-app=${this.app}]`).length) {
                  $(`w-taskbar-button[data-app=${this.app}]`).addClass("open")
            }else{
                  $(`w-taskbar-button[data-app=${this.app}]`).removeClass("open")
            }

            // Show icon as having multiple instances
            if($(`w-window[data-app=${this.app}]`).length > 1) {
                  $(`w-taskbar-button[data-app=${this.app}]`).addClass("multiple")
            }else{
                  $(`w-taskbar-button[data-app=${this.app}]`).removeClass("multiple")
            }

            // Show taskbar icon large blob if app is focused
            if($(`w-window[data-app=${this.app}][focused=true]`).length) {
                  $(`w-taskbar-button`).removeClass("focused")
                  $(`w-taskbar-button[data-app=${this.app}]`).addClass("focused")
            }
      }

      static spawnWindow(app, args = {}) {
            let uApp = ucwords(app)
            let windowid = `w_${wid()}`
            let defPos = "50px"

            // Check if window is only allowed one instance
            if(eval(`App_${uApp}`).app_settings.max_instances == 1) {
                  if($(`w-window[data-app=${app}]`).length >= 1) {
                        // Focus the window and close tooltips and thumbnails
                        $(`w-window[data-app=${app}]`)[0].focusWindow()
                        if(window["taskbar_thumbs"]) window["taskbar_thumbs"].close()
                        closeToolTips()
                        return
                  }
            }

            let newX = ($("w-window:last-of-type").length ? $("w-window:last-of-type")[0].offsetLeft + 50 : defPos)
            let newY = ($("w-window:last-of-type").length ? $("w-window:last-of-type")[0].offsetTop + 50 : defPos)
                  
            // Spawn window if all is good
            window[windowid] = new Window({
                  wid: windowid, 
                  app: app,
                  icon: (args.icon ?? eval(`App_${uApp}`).app_settings.icon_tiny),
                  w_title: (args.titlebar ?? eval(`App_${uApp}`).app_settings.w_title),
                  pos: {
                        x: (newX < ($(document).width() / 4) ? newX : defPos),
                        y: (newY < ($(document).height() / 4) ? newY : defPos),
                        h: eval(`App_${uApp}`).app_settings.h,
                        w: eval(`App_${uApp}`).app_settings.w
                  },
                  secondary_args: args
            })
            $("w-desktop").append(window[windowid])
            
            // Add icon to taskbar if not already there
            if(!$(`w-taskbar-button[data-app=${app}]`).length) {
                  $("w-taskbar .center").append(
                        new TaskbarButton({ 
                              id: 2,
                              btn_type: "button", 
                              title: eval(`App_${uApp}`).app_settings.w_title,
                              icon: eval(`App_${uApp}`).app_settings.icon, 
                              app: app 
                        })
                  )
            }

            // Close any context menus open
            if($("w-context-menu").length) $("w-context-menu")[0].closeContext() 

            setTimeout(() => {
                  if(window["taskbar_thumbs"]) window["taskbar_thumbs"].fillThumbs() // Add thumbnails
            }, 100)

            closeToolTips()
      }
}
customElements.define("w-window", Window)
class SystemTray extends HTMLElement {
      constructor(args) {
            super()
            $(this).html(this.html())
      }
      
      html() {
            return `
                  <div class="tray">
                        <div class="icon network" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" title="Virgin Media<br>Internet access">
                              <img class="icon-img smaller" src="${base64_tray_network}" />
                        </div>
                        <div class="icon volume" data-bs-toggle="tooltip" data-bs-placement="top" title="Speakers (Surface Dock): 90%">
                              <img class="icon-img smaller" src="${base64_tray_volume}" />
                        </div>
                        <div class="icon battery" data-bs-toggle="tooltip" data-bs-placement="top" title="Battery status: fully charged 100%">
                              <img class="icon-img smaller" src="${base64_battery_volume}" />
                        </div>
                  </div>
                  <div class="time"></div>
            `
      }

      connectedCallback() {
            this.eventHandlers()
      }

      updateTime() {
            const d = new Date()
            return `${zeroPad(d.getHours(), 2)}:${zeroPad(d.getMinutes(), 2)}`
      }
      updateDate() {
            const d = new Date()
            return `${zeroPad(d.getDate(), 2)}/${zeroPad(d.getMonth()+1, 2)}/${d.getFullYear()}`
      }

      eventHandlers() {
            setInterval(() => {
                  $(".time").html(`${this.updateTime()}<br>${this.updateDate()}`)
            }, 100)

            $(this).on("click", ".tray", function(e) {
                  if(window["systray_menu"]) {
                        window["systray_menu"].closeMenu()
                  }else{
                        window["systray_menu"] = new SystemTrayMenu({ pos: { y:0, x:$(this).offset().left }})
                        $("w-desktop").append(window["systray_menu"])
                        closeToolTips()
                  }
                  e.stopImmediatePropagation()
            })

            $(this).on("click", ".time", function(e) {
                  if(window["notifications_menu"]) {
                        window["notifications_menu"].closeMenu()
                  }else{
                        window["notifications_menu"] = new NotificationsBar({ pos: { y:0, x:0 }})
                        $("w-desktop").append(window["notifications_menu"])
                        closeToolTips()
                  }
                  e.stopImmediatePropagation()
            })

            $(this).on("contextmenu", function(e) {
                  let systray_cxt_buttons
                  if($("w-context-menu").length) {
                        $("w-context-menu")[0].closeContext()
                  }

                  if(hasParents(e, ".network")) {
                        systray_cxt_buttons = [
                              { 
                                    icon: taskman_settings, 
                                    text: "Network and Internet settings" 
                              }
                        ]
                  }
                  if(hasParents(e, ".volume")) {
                        systray_cxt_buttons = [
                              { 
                                    icon: base64_transparent, 
                                    text: "Troubleshoot sound problems" 
                              },
                              { text: "---"},
                              { 
                                    icon: taskman_settings, 
                                    text: "Open volume mixer" 
                              },
                              { 
                                    icon: taskman_settings, 
                                    text: "Sound settings" 
                              }
                        ]
                  }
                  if(hasParents(e, ".battery")) {
                        systray_cxt_buttons = [
                              { 
                                    icon: taskman_settings, 
                                    text: "Power and sleep settings" 
                              }
                        ]
                  }
                  if(e.target.className == "time" || hasParents(e, ".time")) {
                        systray_cxt_buttons = [
                              { 
                                    icon: taskman_settings, 
                                    text: "Adjust date and time" 
                              },
                              { 
                                    icon: taskman_settings, 
                                    text: "Notification settings" 
                              }
                        ]
                  }

                  if(systray_cxt_buttons) {
                        window["systray_context"] = new ContextMenu({
                              id: "systray_context",
                              pos: {
                                    x: e.pageX,
                                    y: $(window["taskbar"]).position().top
                              },
                              taskbar_context: true,
                              buttons: systray_cxt_buttons
                        })
                        $(window["desktop"]).append(window["systray_context"])
                  }
                  e.preventDefault()
                  e.stopImmediatePropagation()
            })
      }
}
customElements.define("w-system-tray", SystemTray)
class SystemTrayMenu extends HTMLElement {
      constructor(args) {
            super()
            this.pos = args.pos
            $(this).html(this.html())
            this.applyTheme()
      }

      applyTheme() {
            $(this)[0].style.setProperty("--theme", window["theme"]) 
      }

      html() {
            return `
                  <div class="systray_options">
                        <w-systemtray-option icon="${icon_tray_wifi}" caption="Available" split="true" active="true"></w-systemtray-option>
                        <w-systemtray-option icon="${icon_tray_bluetooth}" caption="Bluetooth" split="true" active="true"></w-systemtray-option>
                        <w-systemtray-option icon="${icon_tray_batterysaver}" caption="Battery saver" disabled></w-systemtray-option>
                        <w-systemtray-option icon="${icon_tray_mobile_hotspot}" caption="Mobile hotspot"></w-systemtray-option>
                        <w-systemtray-option icon="${icon_tray_project}" caption="Project"></w-systemtray-option>
                        <w-systemtray-option icon="${icon_tray_nearbyshare}" caption="Nearby sharing"></w-systemtray-option>
                        <w-systemtray-option icon="${icon_tray_flightmode}" caption="Flight mode"></w-systemtray-option>
                  </div>
                  <br>

                  <div class="sliders">
                        <img src="${base64_tray_volume}">
                        <volume-slider val="50" style="margin: 0 auto;"></volume-slider> 
                  </div>

                  <div class="bottom">
                        <div class="left">
                              <span style="display:flex;" data-bs-toggle="tooltip" title="Charging 99%"><img src="${icon_tray_charging}"> &nbsp; 99%</span>
                        </div>

                        <div class="right">
                              <span data-bs-toggle="tooltip" title="Edit quick settings"><img src="${icon_tray_pencil}"></span>
                              <span data-bs-toggle="tooltip" title="All settings"><img src="${taskman_settings}"></span>
                        </div>
                  </div>
            `
      }

      init() {            
            setTimeout(() => {
                  this.pos.y = (docHeight - $(window["taskbar"]).height()) - $(this).height() * 1.175
                  this.pos.x -= $(this).width() / 1.5

                  // Fix positioning
                  $(this).css({
                        "top": `${this.pos.y}px`,
                        "left": `${this.pos.x}px`,
                        "animation": "slideUp .2s forwards"
                  })
                  reinit_tooltips()
            }, 50)
      }

      connectedCallback() {
            this.eventHandlers()
            this.init()
      }

      closeMenu() {
            let _this = this

            $(window["systray_menu"]).css({"animation": "slideFadeDown .3s forwards"})
            setTimeout(() => {
                  closeToolTips()
                  _this.remove()
            }, 200)
            delete window["systray_menu"]
      }

      eventHandlers() {
            let _this = this

            // Click outside of context
            $("*").on("click contextmenu", function(e) {
                  if($(window["systray_menu"]).length && !hasParents(e, ".tray") && !hasParents(e, "w-systemtray-menu")) {
                        _this.closeMenu()
                        //$(this).off()
                  }
                  e.preventDefault()
            })
      }
}
customElements.define("w-systemtray-menu", SystemTrayMenu)



class SystemTrayOption extends HTMLElement {
      constructor(args) {
            super()
            this.icon = (args ? args.icon : $(this).attr("icon"))
            this.caption = (args ? args.caption : $(this).attr("caption"))
            this.active = (args ? args.active : $(this).attr("active"))
            this.disabled = (args ? args.disabled : $(this).attr("disabled"))
            this.split = (args ? args.split : $(this).attr("split"))
            $(this).html(this.html())
      }

      html() {
            return `
                  <div class="upper ${(this.active ? "active" : "")}" ${(this.active ? "disabled" : "")}>
                        <div class="icon"><img src="${this.icon}"></div>
                        ${(this.split ? "<div class=\"arrow\"><span>&rsaquo;</span></div>" : "")}
                  </div>
                  <div class="caption">${this.caption}</div>
            `
      }

      connectedCallback() {
            this.eventHandlers()
      }

      eventHandlers() {
            let _this = this
      }
}
customElements.define("w-systemtray-option", SystemTrayOption)




class VolumeSlider extends HTMLElement {
      constructor(args) {
            super()
            this.val = (args ? args.val : $(this).attr("val"))
            $(this).html(this.html())
      }

      html() {
            return `
            <div class="left" style="width: ${this.val}%"></div>
            <div class="p-resizer" data-bs-toggle="tooltip" title="${this.val}%"></div>
            `
      }

      connectedCallback() {
            this.eventHandlers()
            this.initResizer()
      }

      eventHandlers() {
            let _this = this
      }

      initResizer() {
            let _this = this
            let resizer, r_left
            let pos, sliderWidth, leftWidth, newLeftWidth
            
            $(this).each((i, el) => {
                  sliderWidth = $(el).width()
                  resizer = $(el).find(".p-resizer")
                  r_left = resizer.prev()

                  pos = { x:0, y:0 }
                  leftWidth = 0

                  $(el).on("mousedown", function(e) {
                        let posX = $(this).offset().left
                        r_left.css({ "width": e.pageX - posX })
                        this.val = Math.ceil((r_left.width() / sliderWidth) * 100)
                  })

                  const mouseDownHandler = (e) => {
                        pos.x = e.clientX
                        pos.y = e.clientY
                        leftWidth = r_left.width()

                        $(document).on("mousemove", resizer, mouseMoveHandler)
                        $(document).on("mouseup", resizer, mouseUpHandler)
                  }

                  const mouseMoveHandler = (e) => {
                        const dx = e.clientX - pos.x
                        const dy = e.clientY - pos.y
                        newLeftWidth = ((leftWidth + dx) * 100) / resizer.parent().width()

                        r_left.css({ 
                              "width": `${newLeftWidth}%`,
                              "user-select": "none",
                              "pointer-events": "none"
                        })
                        
                        this.val = Math.ceil((r_left.width() / sliderWidth) * 100)

                        resizer.attr("title", this.val + "%")
                        closeToolTips()
                        setTimeout(() => {
                              reinit_tooltips()
                        })
                  }

                  const mouseUpHandler = () => {
                        r_left.css({ 
                              "user-select": "initial",
                              "pointer-events": "initial"
                        })

                        $(document).off("mousemove", mouseMoveHandler)
                        $(document).off("mouseup", mouseUpHandler)
                  }

                  $(resizer).on("mousedown", mouseDownHandler)
            })
      }
}
customElements.define("volume-slider", VolumeSlider)
    
class NotificationsBar extends HTMLElement {
      constructor(args) {
            super()
            this.pos = args.pos
            $(this).html(this.html())
            this.applyTheme()
      }

      applyTheme() {
            $(this)[0].style.setProperty("--theme", window["theme"]) 
      }

      html() {
            return `
                  <h6>Notifications</h6>
                  <span class="clearall">Clear all</span>
                  <br>
                  <w-notification-item></w-notification-item>
            `
      }

      init() {
            setTimeout(() => {
                  this.pos.y = (docHeight - $(window["taskbar"]).height() * 2.25) - $(this).height()

                  // Fix positioning
                  $(this).css({
                        "top": `${this.pos.y}px`,
                        // "left": `${this.pos.x}px`,
                        "right": "10px",
                        "animation": "slideLeft .2s forwards"
                  })
                  reinit_tooltips()
            }, 50)
      }

      connectedCallback() {
            this.eventHandlers()
            this.init()
      }

      closeMenu() {
            let _this = this

            $(window["notifications_menu"]).css({"animation": "slideFadeRight .3s forwards"})
            setTimeout(() => {
                  closeToolTips()
                  _this.remove()
            }, 200)
            delete window["notifications_menu"]
      }

      eventHandlers() {
            let _this = this

            // Click outside of context
            $("*").on("click contextmenu", function(e) {
                  if($(window["notifications_menu"]).length && e.target.localName != "w-notifications-bar" && !hasParents(e, "w-notifications-bar")
                  && e.target.className != "time") {
                        _this.closeMenu()
                        //$(this).off()
                  }
                  e.preventDefault()
            })
      }
}
customElements.define("w-notifications-bar", NotificationsBar)




class Notification extends HTMLElement {
      constructor(args) {
            super()
            $(this).html(this.html())
      }

      html() {
            return `
                  <small>Today</small>
                  <small style="float:right" data-bs-toggle="tooltip" title="Clear">&#x2715</small>
                  <br>
                  Have a great day 😁
            `
      }

      connectedCallback() {
            this.eventHandlers()
      }

      eventHandlers() {
            let _this = this
      }
}
customElements.define("w-notification-item", Notification)
class ContextMenu extends HTMLElement {
      constructor(args) {
            super()
            this.id = args.id
            this.pos = args.pos
            this.compact = args.compact ?? false
            this.taskbar_context = (args.taskbar_context ?? false)
            this.buttons = args.buttons
            this.top_buttons = (args.top_buttons ?? false)
            this.animate = (args.animate ?? true)

            $(this).html(this.html())
            this.applyTheme()
            this.init(this.animate)
      }

      applyTheme() {
            $(this)[0].style.setProperty("--theme", window["theme"]) 
      }

      html() {
            let cxt = ""

            if(this.top_buttons) {
                  cxt += `<div class="top-menu">`
                  this.top_buttons.forEach((b) => {
                        if(b.text === "---") {
                              cxt += "<hr>"
                        }else{
                              cxt += `<div class="top-menu-item" onclick="eval(${b.action})" ${(b.disabled ? "disabled" : "")}
                              data-bs-toggle="tooltip" title="${b.tooltip}">
                                    ` + (b.icon ? `<img src="${transparent()}" style="background-image: url(${b.icon})">` : "") + `
                              </div>`
                        }
                  })
                  cxt += `</div>`
            }

            this.buttons.forEach((b) => {
                  if(b.text === "---") {
                        cxt += "<hr>"
                  }else{
                        cxt += `<div class="menu-item ${(b.invert == false ? "no-invert" : "invert")}" onclick="eval(${b.action})" ${(b.disabled ? "disabled" : "")}>
                              <div class="inner">
                                    ` + (b.icon ? `<img src="${transparent()}" style="background-image: url(${b.icon})">` : "") + `
                                    ${b.text}
                              </div>
                              ${(b.more_buttons ? "<span class=\"more\">â€º</span>" : "")}
                        </div>`
                  }
            })

            return cxt
      }

      connectedCallback() {
            setTimeout(() => {
                  pauseToolTips(true)
                  this.eventHandlers()
            }, 1) // To prevent immediate closure of context
      }

      init(animate) {
            setTimeout(() => {
                  if(this.taskbar_context) {
                        // Fix positioning when close to right or left
                        if(this.pos.x > $(window).width() - $(this).width()) this.pos.x -= $(this).width() / 3
                        if(this.pos.x < 0 + ($(window).width() / 4)) this.pos.x += $(this).width() / 3

                        $(this).css({
                              "top": `${(this.pos.y - this.clientHeight) - 10}px`,
                              "left": `${(this.pos.x - (this.clientWidth / 2))}px`,
                              "animation": `slideFadeUpSmall .${(animate ? "2" : "0")}s forwards`
                        })
                  }else{
                        // Fix positioning when close to right or bottom
                        if(this.pos.x > $(window).width() - $(this).width()) this.pos.x -= $(this).width()
                        if(this.pos.y > $(window).height() - $(this).height()) this.pos.y -= $(this).height()

                        $(this).css({
                              "top": `${this.pos.y}px`,
                              "left": `${this.pos.x}px`,
                              "animation": `slideFadeUpSmall .${(animate ? "2" : "0")}s forwards`
                        })
                  }

                  if(this.compact) $(this).addClass("compact")
                  //reinit_tooltips()
            }, 10)
      }

      closeContext() {
            pauseToolTips(false)
            this.remove()
            delete window[this.id]
      }

      eventHandlers() {
            let _this = this

            $(this).on("click mouseover", ".menu-item:has(.more)", function(e) {
                  let cxtProps = e.target.parentElement
                  setTimeout(() => {
                        if(!window[`cxt_more`]) {
                              window[`cxt_more`] = new ContextMenu({
                                    id: `cxt_more`,
                                    pos: {
                                          x: cxtProps.offsetLeft + cxtProps.offsetWidth - 10,
                                          y: cxtProps.offsetTop + (cxtProps.offsetHeight / 2) + 10
                                    },
                                    taskbar_context: false,
                                    animate: false,
                                    buttons: [
                                          {
                                                icon: base64_icon_explorer_tiny,
                                                text: "Folder",
                                                invert: false
                                          },
                                          {
                                                icon: cxt_shortcut,
                                                text: "Shortcut",
                                                invert: false
                                          }
                                    ]
                              })
                        $("w-desktop").append(window[`cxt_more`])
                        }
                  }, 250)
            })
            
            // Close context when anything is clicked that should close it
            $("*").on("click contextmenu", function(e) {
                  if($(e.target).is(".menu-item")) {
                        if($(e.target).find(".more").length) return false
                  }
                  _this.closeContext()
            })
      }
}
customElements.define("w-context-menu", ContextMenu)
class App_Getstarted extends HTMLElement {
      static get app_settings() {
            return { 
                  w_title: "Get Started",
                  icon: base64_getstarted_small,
                  icon_tiny: base64_getstarted_small,
                  h: $(window).height() / 1.4, 
                  w: "70%",
                  max_instances: 1
            }
      }

      constructor(args) {
            super()
            this.wid = args.wid
            this.slide = args.slide ?? 1
            $(this).html(this.html())
            this.init()
            this.applyTheme()
      }

      applyTheme() {
            $(this)[0].style.setProperty("--theme", window["theme"]) 
      }

      html() {
            return `
                  <w-getstarted-pane id="pane" slide="${this.slide}"></w-getstarted-pane>
                  <div class="statusbar">
                        <div class="nav-btn home" disabled data-bs-toggle="tooltip" title="Home">
                              <img src="${icon_home_tiny}">
                        </div>

                        <div style="display:flex; gap:1em;">
                              <div class="nav-btn prev" disabled data-bs-toggle="tooltip" title="Previous">
                                    <img src="${chevron_left}">
                              </div>
                              
                              <div class="nav-btn next" disabled data-bs-toggle="tooltip" title="Next">
                                    <img src="${chevron_right}">
                              </div>                              
                        </div>
                  </div>
            `
      }

      init() {
            let _this = this

            setTimeout(() => {
                  $(_this).parent().css({
                        "background": "rgba(255,255,255,0.9)"
                  })
                  $(_this).parent().find(".icon").css({ "opacity": "0", "margin-right": "-1em" })
            }, 1)
      }
}
customElements.define("w-getstarted", App_Getstarted)


class GetStartedPanes extends HTMLElement {
      constructor(args) {
            super()
            this.slide = parseInt(args ? args.slide : $(this).attr("slide"))
            $(this).html(this.html())
      }

      html() {
            let res
            let maxnum = 2

            switch(this.slide) {
                  case 1:
                        res = `<div class="slide s${this.slide}">
                              <div class="left">
                                    <h1>Hi there!</h1><br>
                                    You're now previewing the Windows 11 Clone Web Page by Dan Wheeler!<br>
                                    Read on to discover what it can do.<br><br>

                                    <div class="slidebtn" data-pane="2">Get Started</div>
                              </div>
                              <div class="img"><img src="https://i.postimg.cc/xd33R3Q1/1.png"></div>
                        </div>`
                        break;
                  case 2:
                        res = `<div class="slide s${this.slide}">
                              <div class="left">
                                    <h1>More to come...</h1><br>
                                    Soon I will be using this space to show you what this clone can do.
                              </div>
                        </div>`
                        break;
            }

            this.updateNextPrev(this.slide, maxnum)

            return res
      }

      connectedCallback() {
            this.eventHandlers()
      }

      eventHandlers() {
            let _this = this

            $(document).on("click", "[data-pane]", function() {
                  _this.slide = parseInt($(this).attr("data-pane"))
                  $(_this).fadeOut(500, function() {
                        $(_this).html(_this.html()).fadeIn()
                  })
            })

            $(document).on("click", "w-getstarted .statusbar .nav-btn.home", function() {
                  _this.slide = 1
                  $(_this).fadeOut(500, function() {
                        $(_this).html(_this.html()).fadeIn()
                  })
            })

            $(document).on("click", "w-getstarted .statusbar .nav-btn.next", function() {
                  _this.slide++
                  $(_this).fadeOut(500, function() {
                        $(_this).html(_this.html()).fadeIn()
                  })
            })
            $(document).on("click", "w-getstarted .statusbar .nav-btn.prev", function() {
                  _this.slide--
                  $(_this).fadeOut(500, function() {
                        $(_this).html(_this.html()).fadeIn()
                  })
            })
      }

      updateNextPrev(num, maxnum) {
            $("w-getstarted .statusbar .nav-btn.next").attr("disabled", !(num < maxnum))
            $("w-getstarted .statusbar .nav-btn.prev").attr("disabled", !(num > 1))
            $("w-getstarted .statusbar .nav-btn.home").attr("disabled", !(num != 1))
      }
}
customElements.define("w-getstarted-pane", GetStartedPanes)
class App_Notepad extends HTMLElement {
      static get app_settings() {
            return { 
                  w_title: "Notepad",
                  icon: base64_icon_notepad,
                  icon_tiny: base64_icon_notepad_tiny,
                  h: $(window).height() / 1.8, 
                  w: "45%" 
            }
      }

      constructor(args) {
            super()
            $(this).html(this.html())
            this.applyTheme()
      }

      applyTheme() {
            $(this)[0].style.setProperty("--theme", window["theme"]) 
      }

      html() {
            return `
                  <div class="menu_bar">
                        <span>File</span>
                        <span>Edit</span>
                        <span>Format</span>
                        <span>View</span>
                        <span>Help</span>
                  </div>

                  <textarea></textarea>

                  <div class="status_bar">
                        <span>100%</span>
                        <span>Windows (CRLF)</span>
                        <span>UTF-8</span>
                  </div>
            `
      }
}
customElements.define("w-notepad", App_Notepad)
class App_Explorer extends HTMLElement {
      static get app_settings() {
            return { 
                  w_title: "Explorer",
                  icon: base64_icon_fileexplorer,
                  icon_tiny: base64_icon_explorer_tiny,
                  h: $(window).height() / 1.5, 
                  w: "60%" 
            }
      }

      constructor(args) {
            super()
            this.wid = (args ? args.wid : 97)
            this.path = (args ? args.path : "")
            if(!this.path) return
            
            $(this).html(this.html())
            this.applyTheme()

            setTimeout(() => {
                  initResizer("w-explorer")
            }, 100)
      }

      applyTheme() {
            $(this)[0].style.setProperty("--theme", window["theme"]) 
      }

      html() {
            return `
                  <div class="menu_bar">
                        <div class="item" data-bs-toggle="tooltip" title="Create a new item in the current location.">
                              <img src="${base64_new}"> New
                        </div>

                        <span class="seperator"></span>

                        <div class="item" data-bs-toggle="tooltip" title="Cut" disabled>
                              <img src="${base64_cut}">
                        </div>

                        <div class="item" data-bs-toggle="tooltip" title="Copy" disabled>
                              <img src="${base64_copy}">
                        </div>

                        <div class="item" data-bs-toggle="tooltip" title="Paste" disabled>
                              <img src="${base64_paste}">
                        </div>

                        <div class="item" data-bs-toggle="tooltip" title="Rename" disabled>
                              <img src="${base64_rename}">
                        </div>

                        <div class="item" data-bs-toggle="tooltip" title="Share" disabled>
                              <img src="${base64_share}">
                        </div>
                        
                        <div class="item" data-bs-toggle="tooltip" title="Delete" disabled>
                              <img src="${base64_delete}">
                        </div>

                        <span class="seperator"></span>

                        <div class="item" data-bs-toggle="tooltip" title="Sort and group options.">
                              <img src="${base64_sort}"> Sort
                        </div>

                        <div class="item" data-bs-toggle="tooltip" title="Layout and view options.">
                              <img src="${base64_view}"> View
                        </div>

                        <span class="seperator"></span>

                        <div class="item" data-bs-toggle="tooltip" title="See more">
                              <img src="${base64_ellipses}">
                        </div>
                        
                        <div class="item float-right" data-bs-toggle="tooltip" title="Cloud storage information.">
                              <img src="${base64_onedrive}">
                        </div>
                  </div>

                  <div class="menu_bar_2">
                        <div class="item" data-bs-toggle="tooltip" title="Back">
                              <img src="${base64_back}">
                        </div>
                        <div class="item" data-bs-toggle="tooltip" title="Forward" disabled>
                              <img src="${base64_forward}">
                        </div>
                        <div class="item" data-bs-toggle="tooltip" title="Up">
                              <img src="${base64_up}">
                        </div>

                        <w-explorer-address-bar icon="${base64_home_small}"></w-explorer-address-bar>
                        &nbsp;&nbsp;
                        <input type="search" class="search" placeholder="Search folder">
                  </div>

                  <div class="body">
                        <w-explorer-navigation-bar></w-explorer-navigation-bar>
                        <div class="p-resizer"></div>
                        <div class="explorer_body">
                              <small class="toggle"><span class="dropdown">&#x203A;</span> Quick Access</small>
                              <w-explorer-pane path="${this.path}"></w-explorer-pane>
                        </div>
                  </div>

                  <div class="status_bar">
                        <span class="item_cnt">6 items</span>
                  </div>
            `
      }
}
customElements.define("w-explorer", App_Explorer)

class ExplorerAddressBar extends HTMLElement {
      constructor(args) {
            super()
            this.icon = (args ? args.icon : $(this).attr("icon"))
            $(this).html(this.html())
      }

      html() {
            return `<img src="${this.icon}">
            <div class="addressbar-div">
                  <span style="font-size:1.45em">&#x203A;</span> <span>Home</span>
            </div>
            <input type="text" class="addressbar-input" value="Home">`
      }

      connectedCallback() {
            this.eventHandlers()
      }

      eventHandlers() {
            let _this = this
            
            $(this).on("click", ".addressbar-div", function(e) {
                  $(this).hide()
                  $(this).next(".addressbar-input").show().focus().select()
            })

            $(document).on("mousedown", ($e) => {
                  if(!$(this)[0].contains($e.target) && $(_this).find(".addressbar-input").is(":visible")) {
                        $(_this).find(".addressbar-div, .addressbar-input").toggle()
                  }
            })
      }
}
customElements.define("w-explorer-address-bar", ExplorerAddressBar)




class ExplorerNavigationBar extends HTMLElement {
      constructor(args) {
            super()
            $(this).html(this.html())
      }

      html() {
            let res = [
                  new ExplorerNavigationBarItem({ icon: base64_home_small, text: "Home" }),
                  new ExplorerNavigationBarItem({ icon: base64_onedrive, text: "Dan - OneDrive", dropdown: true }),
                  "<hr>",
                  new ExplorerNavigationBarItem({ icon: base64_desktop_small, text: "Desktop" }),
                  new ExplorerNavigationBarItem({ icon: base64_downloads_small, text: "Downloads" }),
                  new ExplorerNavigationBarItem({ icon: base64_documents_small, text: "Documents" }),
                  new ExplorerNavigationBarItem({ icon: base64_pictures_small, text: "Pictures" }),
                  new ExplorerNavigationBarItem({ icon: base64_music_small, text: "Music" }),
                  new ExplorerNavigationBarItem({ icon: base64_videos_small, text: "Videos" }),
                  "<hr>",
                  new ExplorerNavigationBarItem({ icon: base64_mycomputer_small, text: "My Computer", dropdown: true }),
                  new ExplorerNavigationBarItem({ icon: base64_network_small, text: "Network", dropdown: true })
            ]
            return res
      }

      connectedCallback() {
            this.eventHandlers()
      }

      eventHandlers() {
            let _this = this
      }
}
customElements.define("w-explorer-navigation-bar", ExplorerNavigationBar)




class ExplorerNavigationBarItem extends HTMLElement {
      constructor(args) {
            super()
            this.icon = (args ? args.icon : $(this).attr("data-icon"))
            this.text = (args ? args.text : $(this).attr("data-text"))
            this.dropdown = (args ? args.dropdown : $(this).attr("data-dropdown"))
            $(this).html(this.html())
      }

      html() {
            return (this.dropdown ? "<span class='dropdown'>&#x203A;</span>" : "")+`<img src="${base64_transparent}" style="background-image: url(${this.icon})"> ${this.text}`
      }

      connectedCallback() {
            this.eventHandlers()
      }

      eventHandlers() {
            let _this = this
      }
}
customElements.define("w-explorer-navigation-bar-item", ExplorerNavigationBarItem)



class ExplorerPane extends HTMLElement {
      constructor(args) {
            super()
            this.path = (args ? args.path : $(this).attr("path"))
            $(this).html(this.html())
      }

      html() {
            let res
            if(this.path == "mycomputer") {
                  res = [
                        new ExplorerIcon({ 
                              icon: base64_icon_cdrive,
                              text: "Windows (C:)",
                              progress: true, 
                              subtext: "100GB free of 300GB",
                              cxt: {
                                    top_buttons: [
                                          { tooltip: "Copy", icon: cxt_copy },
                                          { tooltip: "Rename", icon: cxt_rename }
                                    ],
                                    buttons: [
                                          { text: "Open", icon: base64_icon_fileexplorer },
                                          { text: "Open in new window", icon: cxt_openinnewwindow },
                                          { text: "Format", icon: cxt_format },
                                          { text: "Pin to Quick access", icon: cxt_pin },
                                          { text: "Pin to Start", icon: cxt_pin },
                                          { text: "Properties", icon: cxt_properties },
                                          { text: "---" },
                                          { text: "Show more options", icon: cxt_showmore },
                                    ]
                              }
                        }),
                        new ExplorerIcon({ 
                              icon: base64_icon_cddrive, 
                              text: "CD Drive (D:)",
                              cxt: {
                                    top_buttons: [
                                          { tooltip: "Copy", icon: cxt_copy }
                                    ],
                                    buttons: [
                                          { text: "Open", icon: base64_icon_fileexplorer },
                                          { text: "Open in new window", icon: cxt_openinnewwindow },
                                          { text: "Eject", icon: cxt_eject },
                                          { text: "Pin to Quick access", icon: cxt_pin },
                                          { text: "Pin to Start", icon: cxt_pin },
                                          { text: "Properties", icon: cxt_properties },
                                          { text: "---" },
                                          { text: "Show more options", icon: cxt_showmore },
                                    ]
                              }
                        })
                  ]
                  $(this).parent().find(".toggle").html("<span class='dropdown'>&#x203A;</span> Devices and drives")
            }

            if(this.path == "documents") {
                  let cxt = {
                        top_buttons: [
                              { tooltip: "Copy", icon: cxt_copy },
                              { tooltip: "Share", icon: base64_share }
                        ],
                        buttons: [
                              { text: "Open", icon: base64_icon_fileexplorer },
                              { text: "Open in new window", icon: cxt_openinnewwindow },
                              { text: "Pin to Quick access", icon: cxt_pin },
                              { text: "Pin to Start", icon: cxt_pin },
                              { text: "Properties", icon: cxt_properties },
                              { text: "---" },
                              { text: "Show more options", icon: cxt_showmore },
                        ]
                  }
                  res = [
                        new ExplorerIcon({ icon: base64_icon_desktop, text: "Desktop", subtext: "Stored locally", cxt: cxt }),
                        new ExplorerIcon({ icon: base64_icon_downloads, text: "Downloads", subtext: "Stored locally", cxt: cxt }),
                        new ExplorerIcon({ icon: base64_icon_documents, text: "Documents", subtext: "Stored locally", cxt: cxt }),
                        new ExplorerIcon({ icon: base64_icon_pictures, text: "Pictures", subtext: "Stored locally", cxt: cxt }),
                        new ExplorerIcon({ icon: base64_icon_music, text: "Music", subtext: "Stored locally", cxt: cxt }),
                        new ExplorerIcon({ icon: base64_icon_videos, text: "Videos", subtext: "Stored locally", cxt: cxt })
                  ]
            }
            
            if(this.path == "recyclebin") {
                  $(this).parent().find(".toggle").remove()
                  $(this).parent().find(".folderempty").remove()
                  $(this).parent().find("w-explorer-pane").before("<div class='folderempty'>This folder is empty</div>")
                  $(".status_bar .item_cnt").html(`0 items`)
                  return
            }

            $(".status_bar .item_cnt").html(`${res.length} items`)
            return res
      }

      connectedCallback() {
            this.eventHandlers()
      }

      eventHandlers() {
            let _this = this
      }
}
customElements.define("w-explorer-pane", ExplorerPane)


class ExplorerIcon extends HTMLElement {
      constructor(args) {
            super()
            this.icon = (args ? args.icon : $(this).attr("data-icon"))
            this.text = (args ? args.text : $(this).attr("data-text"))
            this.progress = (args ? args.progress : false)
            this.subtext = (args ? args.subtext : $(this).attr("data-subtext"))
            this.cxt = (args ? args.cxt : {})
            $(this).html(this.html())
            $(this).attr("tabindex", 0)
      }

      html() {
            return `
                  <img src="${base64_transparent}" style="background-image: url(${this.icon})">
                  <span>
                        ${this.text}
                        ${(this.progress ? "<div class='progress'><div style='width:30px'></div></div>" : "")}
                        ${(this.subtext ? `<small>${this.subtext}</small>` : "")}
                  </span>
            `
      }

      connectedCallback() {
            this.eventHandlers()
      }

      eventHandlers() {
            let _this = this

            $(this).on("contextmenu", function(e) {
                  window["explorer_context"] = new ContextMenu({
                        id: "explorer_context",
                        pos: {
                              x: e.pageX,
                              y: e.pageY
                        },
                        taskbar_context: false,
                        buttons: _this.cxt.buttons,
                        top_buttons: _this.cxt.top_buttons
                  })
                  $("w-desktop").append(window["explorer_context"])

                  e.preventDefault()  
            })
      }
}
customElements.define("w-explorer-icon", ExplorerIcon)
class App_Msedge extends HTMLElement {
      static get app_settings() {
            return { 
                  w_title: "Microsoft Edge",
                  icon: base64_icon_edge,
                  icon_tiny: base64_icon_edge_tiny,
                  h: $(window).height() / 1.8, 
                  w: "45%" 
            }
      }

      constructor(args) {
            super()
            this.wid = (args ? args.wid : 98)
            $(this).html(this.html())
            this.init()
            this.applyTheme()
      }

      applyTheme() {
            $(this)[0].style.setProperty("--theme", window["theme"])
            setTimeout(() => {
                  $(".msedge_tabs")[0].style.setProperty("--theme", window["theme"])
            }, 2) 
      }
      
      html() {
            return `
                  <w-edge-toolbar>
                        <div class="item" data-bs-toggle="tooltip" title="Back">
                              <img src="${base64_back}">
                        </div>
                        <div class="item" data-bs-toggle="tooltip" title="Forward" disabled>
                              <img src="${base64_forward}">
                        </div>
                        <div class="item refresh" data-bs-toggle="tooltip" title="Refresh">
                              <img src="${base64_refresh_tiny}">
                        </div>
                        <div class="item home" data-bs-toggle="tooltip" title="Home">
                              <img src="${icon_home_tiny}">
                        </div>

                        <div class="search">
                              <img src="${base64_search}">
                              <input type="text" value="https://bing.com" onfocus="$(this).select()">
                        </div>

                        <span class="seperator"></span>
                        
                        <div class="item profile" data-bs-toggle="tooltip" title="Profile 1">
                              <img src="https://i.postimg.cc/SRF6ZBRx/15175744784262.jpg">
                        </div>

                        <div class="item" data-bs-toggle="tooltip" title="See more">
                              <img src="${base64_ellipses}">
                        </div>
                  </w-edge-toolbar>

                  <iframe class="browser" src="https://bing.com"></iframe>
            `
      }

      connectedCallback() {
            this.eventHandlers()
      }

      init() {
            let _this = this

            setTimeout(() => {
                  $(_this).parent().css({
                        "background": "rgba(24,52,92,0.9)",
                        "color": "#FFF"
                  })
                  $(`#${this.wid}`).find(".icon").css({ "visibility": "hidden"})
                  $(`#${this.wid}`).find(".title").html(`<div class="msedge_tabs"></div>`)

                  $(`#${this.wid}`).find(".icons").css({
                        "margin-top": `-1em`
                  })

                  $(`#${this.wid}`).find(".msedge_tabs").append(`<w-edge-tab data-text="Bing" data-icon="${base64_search}"></w-edge-tab>`)
            }, 1)
      }

      eventHandlers() {
            let _this = this

            $(document).on("click", `#${_this.wid} .home`, function(e) {
                  $(`#${_this.wid} .browser`).attr("src", "https://bing.com")
            })

            $(document).on("click", `#${_this.wid} .refresh`, function(e) {
                  $(`#${_this.wid} .browser`).attr("src", function(i, val) { return val })
            })

            $(document).on("keyup", `#${_this.wid} .search input`, function(e) {
                  if(e.which === 13) {
                        let url = $(this).val()
                        if(strstr(url, "http://") || strstr(url, "https://")) {
                              $(`#${_this.wid} .browser`).attr("src", url)
                        }else{
                              $(`#${_this.wid} .browser`).attr("src", `https://www.bing.com/search?q=${url}`)
                        }
                  }
            })            
      }
}
customElements.define("w-msedge", App_Msedge)




class EdgeTab extends HTMLElement {
      constructor(args) {
            super()
            this.icon = (args ? args.icon : $(this).attr("data-icon"))
            this.text = (args ? args.text : $(this).attr("data-text"))
            $(this).html(this.html())
      }

      html() {
            return `
                  <div>
                        <img src="${this.icon}">
                        ${this.text}
                  </div>
                  <div class="close_tab"><img src="${base64_closewindow}"></div>
            `
      }

      connectedCallback() {
            //this.eventHandlers()
      }

      eventHandlers() {
            let _this = this
      }
}
customElements.define("w-edge-tab", EdgeTab)
class App_Cmd extends HTMLElement {
      static get app_settings() {
            return { 
                  w_title: "Command Prompt",
                  icon: base64_cmd,
                  icon_tiny: base64_cmd,
                  h: $(window).height() / 2, 
                  w: "50%" 
            }
      }

      constructor(args) {
            super()
            $(this).html(this.html())
            this.init()
            this.applyTheme()
      }

      applyTheme() {
            $(this)[0].style.setProperty("--theme", window["theme"]) 
      }

      html() {
            return `<textarea class="cmd">C:\\></textarea>`
      }

      init() {
            let _this = this

            setTimeout(() => {
                  $(_this).parent().css({
                        "background": "rgba(0,0,0,0.6)",
                        "color": "#FFF",
                        "border": "1px solid rgba(255,255,255,0.2)"
                  })
                  $(_this).find(".cmd").focus()
                  $(_this).find(".cmd")[0].selectionStart = $(_this).find(".cmd").val().length
            }, 1)
      }

      connectedCallback() {
            this.eventHandlers()
      }

      eventHandlers() {
            let _this = this
            let requiredText = 'C:\\>'
            let startText = requiredText
            let emsp = "    "

            $(this).on("keyup", ".cmd", function(e) {
                  let __this = this
                  function reset(startText) {
                        $(__this).val($(__this).val() + `\n${startText}`)
                        requiredText = $(__this).val()
                  }

                  let keycode = (e.keyCode ?? e.which)
                  let str = $(this).val().replace(requiredText, "").toLowerCase()

                  // Prevent c:\ from being removed
                  if(String($(this).val()).indexOf(requiredText) == -1) {
                        $(this).val(requiredText)
                  }

                  if(keycode == 13) {                     
                        if(str == "cls\n") { // CLS
                              $(this).val(startText)
                              requiredText = $(this).val()
                              return
                        }

                        if(str == "help\n") { // About
                              $(this).val($(this).val() + `ABOUT${emsp}Shows information about the website.\nCLS${emsp}Clears the screen.\nEXIT${emsp}Quits the CMD.EXE program (command interpreter).\nHELP${emsp}Provides Help information for Windows commands.\n`) 
                              reset(startText)
                              return
                        }

                        if(str == "about\n") { // About
                              $(this).val($(this).val() + `Created by Dan Wheeler 2023\n`)
                              reset(startText)
                              return
                        }

                        if(str == "exit\n") { // Exit
                              window[_this.wid].closeWindow()
                              return
                        }

                        
                        if(str.trim().endsWith(".exe")) { // Run apps
                              let start = str.replace(".exe", "")
                              Window.spawnWindow(start.toLowerCase())
                              reset(startText)
                              return
                        }

                        $(this).val($(this).val() + `'${str.trim()}' is not recognized as an internal or external command,\noperable program or batch file.\n`) // About
                        reset(startText)
                  }
            })
      }
}
customElements.define("w-cmd", App_Cmd)

class App_Taskmanager extends HTMLElement {
      static get app_settings() {
            return { 
                  w_title: "Task Manager",
                  icon: base64_icon_taskmgr,
                  icon_tiny: base64_icon_taskmgr_tiny,
                  h: $(window).height() / 1.5, 
                  w: "50%",
                  min_width: 550,
                  min_height: 450,
                  max_instances: 1
            }
      }

      constructor(args) {
            super()
            this.wid = (args ? args.wid : 99)

            $(this).html(this.html())
            this.init()
            this.applyTheme()
      }

      applyTheme() {
            $(this)[0].style.setProperty("--theme", window["theme"]) 
            setTimeout(() => {
                  $(".taskman_search")[0].style.setProperty("--theme", window["theme"])
            }, 2) 
      }

      html() {
            return `
                  <div class="sidebar">
                        <div class="item view" id="taskman_view">
                              <img src="${taskman_view}">
                        </div>
                        <div class="item active" id="taskman_processes" tabindex="0" data-pane="processes">
                              <img src="${taskman_processes}"> &nbsp;
                              <span>Processes</span>
                        </div>
                        <div class="item" id="taskman_performance" tabindex="0" data-pane="performance">
                              <img src="${taskman_performance}"> &nbsp;
                              <span>Performance</span>
                        </div>
                        <div class="item" id="taskman_apphistory" tabindex="0">
                              <img src="${taskman_apphistory}"> &nbsp;
                              <span>App History</span>
                        </div>
                        <div class="item" id="taskman_startupapps" tabindex="0">
                              <img src="${taskman_startupapps}"> &nbsp;
                              <span>Startup apps</span>
                        </div>
                        <div class="item" id="taskman_users" tabindex="0">
                              <img src="${taskman_users}"> &nbsp;
                              <span>Users</span>
                        </div>
                        <div class="item" id="taskman_details" tabindex="0">
                              <img src="${taskman_details}"> &nbsp;
                              <span>Details</span>
                        </div>
                        <div class="item" id="taskman_services" tabindex="0">
                              <img src="${taskman_services}"> &nbsp;
                              <span>Services</span>
                        </div>
                        <spacer></spacer>                        
                        <div class="item" id="taskman_settings" tabindex="0">
                              <img src="${taskman_settings}"> &nbsp;
                              <span>Settings</span>
                        </div>

                  </div>
                  <div class="main">
                        ${new TaskManPane().draw()}
                  </div>
            `
      }

      connectedCallback() {
            this.eventHandlers()
      }

      init() {
            let _this = this

            setTimeout(() => {
                  $(`#${this.wid}`).css({ 
                        "min-width": App_Taskmanager.app_settings.min_width,
                        "min-height": App_Taskmanager.app_settings.min_height
                  }) // Force min height and width

                  $(`#${this.wid} .title`).after(`<div class="handle taskman_search"><input type="search" placeholder="Type a name, publisher, or PID to search" style="background-image:url(${base64_search1_r})"></div>`)

                  // Fix window header elements positioning
                  $(`#${this.wid} .icons`).css({ "margin-top": "-1em" })
                  $(`#${this.wid} .title, #${this.wid} .icon`).css({ 
                        "margin-top": "-0.15em",
                        "margin-left": "0.5em"
                  })

                  $("#taskman_processes").focus()
                  $("w-taskmanager [data-pane=processes]").click()
            }, 1)
      }

      eventHandlers() {
            let _this = this

            $(document).on("click", "#taskman_view", function() {
                  $("w-taskmanager .sidebar").toggleClass("min")
            })
            
            $(document).on("click", "w-window:has(w-taskmanager) [data-pane]", function() {
                  let p = $(this).attr("data-pane")
                  $("w-window:has(w-taskmanager) .main").html(new TaskManPane({pane: p}).draw())

                  if(p == "processes") {
                        // Fill in App list
                        window["tasklist"] = new TaskManList()
                        $("w-taskmanager .app-list").after(window["tasklist"].draw())
                  }
            })

            $(() => {
                  new ResizeObserver(() => {
                        if($("w-window:has(w-taskmanager)").width() <= 850) {
                              $("w-window:has(w-taskmanager) .sidebar").addClass("min")
                        }else{
                              $("w-window:has(w-taskmanager) .sidebar").removeClass("min")
                        }
                  }).observe($("w-window:has(w-taskmanager)")[0])

                  $(document).on("click", "#taskman_view", function() {
                        if($("w-window:has(w-taskmanager)").width() > 850) $(_this).parent().find(".sidebar").toggleClass("min")
                  })

                  // Simulate percentages
                  setInterval(() => {
                        $(".processes_list .headers .memory h6").html(Math.floor(Math.random() * 20) + 20 + "%")
                        $(".processes_list .headers .cpu h6").html(Math.floor(Math.random() * 15) + 7 + "%")
                  }, 1000)

                  // Update app count
                  setInterval(() => {
                        $("#taskman_app_cnt").html($(".task-item").length)
                  }, 100)
                  

                  // Select sidebar items
                  $(this).on("click", ".sidebar .item", function() {
                        $("w-taskmanager .sidebar .item").removeClass("active")
                        $(this).addClass("active")
                  })
            })
      }
}
customElements.define("w-taskmanager", App_Taskmanager)


class TaskManPane {
      constructor(args) {
            this.pane = (args ? args.pane : "processes")
      }
      
      draw() {
            let ret 
            switch(this.pane) {
                  case "processes":
                        ret = `
                        <div class="titlebar">
                              <h6>Processes</h6>

                              <div class="buttons">
                                    <div class="item" data-bs-toggle="tooltip" title="Creates a new task">
                                          <img src="${taskman_runnewtask}">
                                          <span>Run new task</span>
                                    </div>

                                    <span class="seperator"></span>

                                    <div class="item" disabled>
                                          <img src="${taskman_endtask}">
                                          <span>End task</span>
                                    </div>

                                    <div class="item" disabled>
                                          <img src="${taskman_efficiencymode}">
                                          <span>Efficiency mode</span>
                                    </div>

                                    <div class="item" data-bs-toggle="tooltip" title="See more">
                                          <img src="${base64_ellipses}">
                                    </div>
                              </div>
                        </div>

                        <div class="proc_list">
                              <div class="processes_list">
                                    <div class="row headers">
                                          <div class="cell">Name</div>
                                          <div class="cell">Status</div>
                                          <div class="cell cpu">
                                                <h6>6%</h6>
                                                CPU
                                          </div>
                                          <div class="cell memory">
                                                <h6>45%</h6>
                                                Memory
                                          </div>
                                          <div class="cell">
                                                <h6>1%</h6>
                                                Disk
                                          </div>
                                          <div class="cell">
                                                <h6>0%</h6>
                                                Network
                                          </div>
                                          <div class="cell seperator">&nbsp;</div>
                                    </div>

                                    <div class="row headers2 app-list">
                                          <div class="cell apps"><h6>Apps (<span id="taskman_app_cnt"></span>)</h6></div>
                                          <div class="cell"></div><div class="cell"></div><div class="cell"></div><div class="cell"></div><div class="cell"></div>
                                    </div>
                                    <div class="row headers2">
                                          <div class="cell apps"><h6>Background processes (95)</h6></div>
                                          <div class="cell"></div><div class="cell"></div><div class="cell"></div><div class="cell"></div><div class="cell"></div>
                                    </div>
                              </div>
                        </div>
                        `
                        break;

                  case "performance":
                        ret = `
                        <div class="titlebar">
                              <h6>Performance</h6>

                              <div class="buttons">
                                    <div class="item" data-bs-toggle="tooltip" title="Creates a new task">
                                          <img src="${taskman_runnewtask}">
                                          <span>Run new task</span>
                                    </div>

                                    <span class="seperator"></span>

                                    <div class="item" data-bs-toggle="tooltip" title="See more">
                                          <img src="${base64_ellipses}">
                                    </div>
                              </div>
                        </div>

                        <div class="performance_pane">
                              <div class="sidebar-performance">
                                    <div class="item">
                                          <div class="graph"><w-taskman-perfgraph style="width:100%;"></w-taskman-perfgraph></div>
                                          <div class="type">
                                                <h5>CPU</h5>
                                                <small>12% 2.56GHz</small>
                                          </div>
                                    </div>
                              </div>

                              <div class="main-performance">
                                    <div style="display:flex; justify-content:space-between; align-items:flex-end">
                                          <div><h2>CPU</h2></div>
                                          <div style="text-overflow:ellipsis">11th Gen Intel(R) Core(TM) i5-1145G7 @2.60GHz</div>
                                    </div>
                                    <small style="font-size:0.7em">% Utilisation</small>
                                    <w-taskman-perfgraph style="width: 100%;"></w-taskman-perfgraph>

                                    <div style="display:flex; justify-content:space-between; align-items:flex-start; font-size:0.7em">
                                          <div>60 seconds</div>
                                          <div>0</div>
                                    </div>
                              </div>
                        </div>
                        `
                        break;
            }

            return ret
            
      }
}


class TaskManList {
      constructor(args) {
            this.buildList()
            this.eventHandlers()
      }  

      buildList() {
            let lst = []

            $("w-window").each(function($i, $e) {
                  let app = $($e).attr("data-app")
                  lst.push({
                        app: app,
                        w_title: eval(`App_${ucwords(app)}.app_settings.w_title`),
                        icon: eval(`App_${ucwords(app)}.app_settings.icon_tiny`),
                        wid: $($e).attr("id")
                  } )
            })

            lst.sort((a, b) => a.app.localeCompare(b.app))

            return lst
      }

      draw() {
            let res = ""
            
            $(".task-item").remove()
            this.buildList().forEach((task, index) => {
                  res += `<div class="row task-item" data-wid="${task.wid}">
                        <div class="cell">
                              <img src="${task.icon}">
                              ${task.w_title}
                        </div>
                        <div class="cell"></div>
                        <div class="cell">${Math.random().toFixed(2) + "%"}</div>
                        <div class="cell">${(Math.floor(Math.random() * 0) + Math.random()).toFixed(2)}MB</div>
                        <div class="cell">0.1 MB/s</div>
                        <div class="cell">0 Mbps</div>
                        <div class="cell"></div>
                  </div>`
            })

            return res
      }

      eventHandlers() {
            let _this = this

            $(document).on("contextmenu", "w-taskmanager .task-item", function(e) {
                  let el = $(e.currentTarget.offsetParent).find(".task-item")
                  if(!window["taskman_context"]) {
                        window["taskman_context"] = new ContextMenu({
                              id: "taskman_context",
                              pos: {
                                    x: e.pageX,
                                    y: e.pageY
                              },
                              taskbar_context: false,
                              buttons: [
                                    { text: "&emsp;End Task&emsp;", action: `$(\`#${el.attr("data-wid")}\`)[0].closeWindow()` }
                              ]
                        })
                        $("w-desktop").append(window["taskman_context"])
                  }

                  e.preventDefault()  
            })
      }
}



class TaskManPerfGraph extends HTMLElement {
constructor(args) {
      super()
      this.chart = this.to = ""
      this.dataLength = ((args ? args.dataLength : $(this).attr("data-length")) ?? 30)
      this.updateInterval = ((args ? args.updateInterval : $(this).attr("data-update-interval")) ?? 1000)
      this.peakRangeMin = ((args ? args.peakRangeMin : $(this).attr("data-peak-min")) ?? 80)
      this.peakRangeMax = ((args ? args.peakRangeMax : $(this).attr("data-peak-max")) ?? 100)
      this.color = ((args ? args.color : $(this).attr("data-color")) ?? "0, 111, 145")
      this.refresh()
}

refresh() {
      clearTimeout(this.to)
      $(this).html(this.html())
      this.init()
}
      
html() {
      return `<canvas></canvas>`
}

connectedCallback() {
      this.init()
}

init() {
      this.chart = new Chart($(this).find("canvas")[0].getContext("2d"), {
      type: "line",
      data: {
            labels: Array.from({ length: this.dataLength }, (_, i) => ""),
            datasets: [{
                  label: "",
                  data: this.generateData(this.dataLength),
                  backgroundColor: `rgba(${this.color}, 0.25)`,
                  borderColor: `rgba(${this.color}, 1)`,
                  pointRadius: 0,
                  borderWidth: 1,
                  fill: "origin"
            }]
      },
      options: {
            scales: {
                  x: {
                        display: true,
                        beginAtZero: true
                  },
                  y: {
                        display: true,
                        beginAtZero: true,
                        stacked: true
                  }
            },
            plugins: {
                  title: {
                        display: false
                  },
                  legend: {
                        display: false
                  },
            },
            animation: false
            }
      })
      this.updateChart()
}

generateData(length) {
      let data = []
      for(var i = 0; i < length; i++) {
            data.push(Math.random() * (this.peakRangeMax - this.peakRangeMin) + this.peakRangeMin)
      }
      return data
}

updateData() {
      this.chart.data.datasets[0].data.shift()
      this.chart.data.datasets[0].data.push(Math.random() * (this.peakRangeMax - this.peakRangeMin) + this.peakRangeMin)
      this.chart.update()
}

updateChart() {
      this.updateData()  
      this.to = setTimeout(this.updateChart.bind(this), this.updateInterval)
}
}
customElements.define("w-taskman-perfgraph", TaskManPerfGraph)
class App_Settings extends HTMLElement {
      static get app_settings() {
            return { 
                  w_title: "Settings",
                  icon: base64_icon_settings,
                  icon_tiny: base64_icon_settings,
                  h: $(window).height() / 1.4, 
                  w: "70%",
                  min_width: 550,
                  max_instances: 1
            }
      }

      constructor(args) {
            super()
            $(this).html(this.html())
            this.init()
            this.applyTheme()
            $(this).find(".menu-system").show() // Show initial screen
      }

      applyTheme() {
            let parent = $(this).parent()
            $(this)[0].style.setProperty("--theme", window["theme"]) 
            if(window["theme"] == "dark") {
                  parent.css({
                        "background": "#2B2E33DD"
                  }).find(".icon, .settings_burger").css({
                        "filter": "invert(100%)"
                  })
                  parent.find(".wallpaper-preview").css({ "background-image": `url(${wallpaper_dark})` })
            }else{
                  parent.css({
                        "background": "rgba(255,255,255,0.9)"
                  }).find(".icon, .settings_burger").css({
                        "filter": "invert(0%)"
                  })
                  parent.find(".wallpaper-preview").css({ "background-image": `url(${wallpaper_light})` })
            }
      }

      html() {
            return `
                  <div class="sidebar">
                        <div class="user">
                              <div><img src="https://i.postimg.cc/SRF6ZBRx/15175744784262.jpg"></div>
                              <div>
                                    <b>Dan Wheeler</b><br>
                                    <a href="mailto:dan@x2i.me">dan@x2i.me</a>
                              </div>
                        </div>

                        <div class="search">
                              <input placeholder="Find a setting">
                              <img src="${base64_search}">
                        </div>

                        <div class="sidebar_items">
                              <w-settings-sidebar-item icon="${icon_settings_system}" text="System" data-menu="system" class="active"></w-settings-sidebar-item>
                              <w-settings-sidebar-item icon="${icon_settings_bluetooth}" text="Bluetooth & devices" disabled></w-settings-sidebar-item>
                              <w-settings-sidebar-item icon="${icon_settings_network}" text="Network & internet" disabled></w-settings-sidebar-item>
                              <w-settings-sidebar-item icon="${icon_settings_personalisation}" data-menu="personalisation" text="Personalisation"></w-settings-sidebar-item>
                              <w-settings-sidebar-item icon="${icon_settings_apps}" text="Apps" disabled></w-settings-sidebar-item>
                              <w-settings-sidebar-item icon="${icon_settings_accounts}" text="Accounts" disabled></w-settings-sidebar-item>
                              <w-settings-sidebar-item icon="${icon_settings_timelanguage}" text="Time & language" disabled></w-settings-sidebar-item>
                              <w-settings-sidebar-item icon="${icon_settings_gaming}" text="Gaming" disabled></w-settings-sidebar-item>
                              <w-settings-sidebar-item icon="${icon_settings_accessibility}" text="Accessibility" disabled></w-settings-sidebar-item>
                              <w-settings-sidebar-item icon="${icon_settings_privacy}" text="Privacy & security" disabled></w-settings-sidebar-item>
                              <w-settings-sidebar-item icon="${icon_settings_update}" text="Windows Update" disabled></w-settings-sidebar-item>
                        </div>
                  </div>

                  <div class="main">
                        <div class="menu menu-system">
                              <h2>System</h2><br>

                              <div class="heading">
                                    <div class="comp">
                                          <img src="https://i.postimg.cc/1PB9FhbC/w11light.jpg" class="desktop">
                                          <div>
                                                <h5>Danz-PC</h5>
                                                HP ProBook 630 G8 Notebook PC<br>
                                                <span style="color:navy">Rename</span>
                                          </div>
                                    </div>

                                    <div class="updates">
                                          <img src="${icon_settings_update}">
                                          <div>
                                                <b>Windows Update</b><br>
                                                <small>Check for updates</small>
                                          </div>
                                    </div>
                              </div>

                              <div class="options">
                                    <w-settings-option icon="${icon_settings_display}" caption="Display" text="Monitors, brightness, night light, display profile" disabled></w-settings-option>
                                    <w-settings-option icon="${icon_settings_sound}" caption="Sound" text="Volume levels, output, input, sound devices" disabled></w-settings-option>
                                    <w-settings-option icon="${icon_settings_notifications}" caption="Notifications" text="Alerts from apps and system, do not disturb" disabled></w-settings-option>
                                    <w-settings-option icon="${icon_settings_focus}" caption="Focus" text="Reduce distractions" disabled></w-settings-option>
                                    <w-settings-option icon="${icon_settings_power}" caption="Power & battery" text="Sleep, battery usage, battery saver" disabled></w-settings-option>
                                    <w-settings-option icon="${icon_settings_storage}" caption="Storage" text="Storage space, drives, configuration rules" disabled></w-settings-option>
                                    <w-settings-option icon="${icon_settings_nearby}" caption="Nearby sharing" text="Discoverability, received files location" disabled></w-settings-option>
                                    <w-settings-option icon="${icon_settings_multitasking}" caption="Multi-taking" text="Snap windows. desktops, task switching" disabled></w-settings-option>
                                    <w-settings-option icon="${icon_settings_activation}" caption="Activation" text="Activation state, subscriptions, product key" disabled></w-settings-option>
                                    <w-settings-option icon="${icon_settings_troubleshoot}" caption="Troubleshoot" text="Recommended troubleshooters, preferences, history" disabled></w-settings-option>
                                    <w-settings-option icon="${icon_settings_recovery}" caption="Recovery" text="Reset, advanced start-up, go back" disabled></w-settings-option>
                                    <w-settings-option icon="${icon_settings_project}" caption="Projecting to this PC" text="Permissions, pairing PIN, discoverability" disabled></w-settings-option>
                                    <w-settings-option icon="${icon_settings_remotedesktop}" caption="Remote Desktop" text="Remote Desktop users, connection permissions" disabled></w-settings-option>
                                    <w-settings-option icon="${icon_settings_clipboard}" caption="Clipboard" text="Cut and copy history, sync clear" disabled></w-settings-option>
                                    <w-settings-option icon="${icon_settings_about}" caption="About" text="Device specifications, rename PC, Windows specifications" disabled></w-settings-option>
                              </div>
                        </div>

                        <div class="menu menu-personalisation">
                              <h2>Personalisation</h2><br>

                              <div class="themes">
                                    <div class="theme-preview">
                                          <div class="wallpaper-preview" style="background-image: url(${wallpaper_light})">
                                                <span>--------------------------------------------------</span>
                                          </div>
                                    </div>

                                    <div class="theme-picker">
                                          Select a theme to apply<br><br>

                                          <div class="theme-grid">
                                                <div data-theme="light" style="background-image: url(${wallpaper_light})"><span></span></div>
                                                <div data-theme="dark" style="background-image: url(${wallpaper_dark})"><span></span></div>
                                          </div>
                                    </div>
                              </div>

                              <div class="options">
                                    <w-settings-option icon="${icon_settings_background}" caption="Background" text="Background image, colour, slideshow" disabled></w-settings-option>
                                    <w-settings-option icon="${icon_settings_colors}" caption="Colours" text="Accent colour, transparency effects, colour theme" disabled></w-settings-option>
                                    <w-settings-option icon="${icon_settings_themes}" caption="Themes" text="Install, create, manage" disabled></w-settings-option>
                                    <w-settings-option icon="${icon_settings_dynamiclighting}" caption="Dynamic Lighting" text="Colors, effects, brightness" disabled></w-settings-option>
                                    <w-settings-option icon="${icon_settings_lockscreen}" caption="Lock screen" text="Lock screen images, apps, animations" disabled></w-settings-option>
                                    <w-settings-option icon="${icon_settings_textinput}" caption="Text input" text="Touch keyboard, voice typing, emoji and more, input method editor" disabled></w-settings-option>
                                    <w-settings-option icon="${icon_settings_start}" caption="Start" text="Recent apps and items, folders" disabled></w-settings-option>
                                    <w-settings-option icon="${icon_settings_taskbar}" caption="Taskbar" text="Taskbar behaviours, system pins" disabled></w-settings-option>
                                    <w-settings-option icon="${icon_settings_fonts}" caption="Fonts" text="Install, manage" disabled></w-settings-option>
                              </div>
                        </div>
                  </div>
            `
      }

      init() {
            let parent = $(this).parent()
            parent.css({
                  "min-width": App_Taskmanager.app_settings.min_width
            })
            parent.find(".icon").css({
                  "background-image": `url(${base64_back})`,
                  "background-size": "15px 15px",
                  "margin": "1em",
                  "opacity": "0.5"
            })
            parent.find(".title").css({
                  "font-size": `0.95em`
            })
            parent.find(".icons").css({
                  "margin-top": `-1.6em`
            })

            if(!parent.find(".settings_burger").length) parent.find(".icon").after(`<div class="settings_burger" style="background-image:url(${taskman_view})"></div>`)
      }

      connectedCallback() {
            this.eventHandlers()
      }

      eventHandlers() {
            let _this = this
            
            $(() => {
                  new ResizeObserver(() => {
                        if($("w-window:has(w-settings)").width() <= 850) {
                              $("w-window:has(w-settings) w-settings").addClass("min")
                              $("w-window:has(w-settings) .sidebar").hide()
                              $(".settings_burger").show()
                        }else{
                              $("w-window:has(w-settings) w-settings").removeClass("min")
                              $("w-window:has(w-settings) .sidebar").show()
                              $(".settings_burger").hide()
                        }
                  }).observe($("w-window:has(w-settings)")[0])
            })

            $(document).on("click", ".settings_burger", function() {
                  $(_this).find(".sidebar").toggle("slide")
            })

            $(document).on("click", "w-settings-sidebar-item", function(e) {
                  $("w-settings-sidebar-item").removeClass("active")
                  $(this).addClass("active")
                  $(_this).find(".menu").hide()
                  setTimeout(() => { $(_this).find(`.menu-${$(this).attr("data-menu")}`).show("slide", { direction: "down" }) })

                  if($(_this).hasClass("min")) $(_this).find(".sidebar").hide("slide")
                  e.stopImmediatePropagation()
            })

            $(this).on("click", ".theme-grid [data-theme]", function(e) {
                  window["theme"] = $(this).attr("data-theme")
                  toggleTheme()
            })
      }
}
customElements.define("w-settings", App_Settings)



class SettingsSidebarItem extends HTMLElement {
      constructor(args) {
            super()
            this.icon = (args ? args.icon : $(this).attr("icon"))
            this.text = (args ? args.text : $(this).attr("text"))
            $(this).html(this.html())
      }

      html() {
            return `<img src="${base64_transparent}" style="background-image:url(${this.icon})"> ${this.text}`
      }
}
customElements.define("w-settings-sidebar-item", SettingsSidebarItem)


class SettingsOptions extends HTMLElement {
      constructor(args) {
            super()
            this.icon = (args ? args.icon : $(this).attr("icon"))
            this.text = (args ? args.text : $(this).attr("text"))
            this.caption = (args ? args.caption : $(this).attr("caption"))
            $(this).html(this.html())
      }

      html() {
            return `<div class="image"><img src="${base64_transparent}" style="background-image:url(${this.icon})"></div>
            <div class="body">
                  ${this.caption}<br>
                  <small>${this.text}</small>
            </div>
            <div class="arrow">></div>`
      }
}
customElements.define("w-settings-option", SettingsOptions)



let base64_transparent = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAANSURBVBhXY2BgYGAAAAAFAAGKM+MAAAAAAElFTkSuQmCC`

let wallpaper_light = `https://i.postimg.cc/1PB9FhbC/w11light.jpg`

let wallpaper_dark = `https://i.postimg.cc/Zn2QKbb3/w11dark.jpg`

let base64_startbtn = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAbCAYAAACJISRoAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAK+SURBVEhLvZS9jRRBEIV7R3gYJLBaIc69MHAIhAQgCMgAG584MMkAoWORcE4Xwe0M9b1X1d27OmnPojU99ffqve6en12L8e7H46/11F5v29bWdWtbznVtbVVujbi1cNv3ty93t9/uN2LlI2c82FU97o1cFH+/3++WELiL2t7gbICYGJsCNDEZYBF3j20XUD5nxPsvx7slnEMUX1idlWEHaQm4KQJElM+JQNguUPiKt3ZYVBToXMC5FNKKyUuj18kPH0tcR+s8cezkmoDrlWeIQAIQRl0Y40qg+mmJnQwBGkpAfoJ7HmZEphXr2fTeIWC888ssUOozwDPJSkT+c22IzAKVLAHZmP04TtJIHPnCjd6zRcmXiAlEnkneovJZRC2EyVA8kXiCSfKsmTufSRcClAWLOka0CBhdQISoehG1+s7HTuPGd9LBJVQCJuLFsACxRIqk99Yk9mxY9evBO2nlWg0AyL0DgZNYImDUN/KUitSWOrk4LhyvCjA+M1cvf2uncLwIadhCwHRqxNFT8Sj+h7F78/Xvtp3Ybqw2rHeAnXdnn9zDx5vdq88/I2TZXOSDCTwmcAzlsrZArDfsigCWWK0AucBBhsUExvVRw+rf5QBQFpNwFqh8DcV2ntyBfdv8rUBAkrfpQgASpnJxYxBPtshswM+5/OJLAL8LRNHkrvujVd+5QNRxzEkPvgL3h+vfyiRgUk8vAOu6CN09BBxyl+0C4AXK4zKRC3U8QyD9mYBZvsxFPWymqfjBnwkUqY5oCMhPEjFAoND1M4GqZ82/+vDOBYZQiQkTr3kymegZAty8k1O9VVFIW8+h5xIjsrxDck0Aq189jndycUQCIYaAazPhEPB8SoCxhD0G2eMQcIOFaicjZtQRMzDydSVx3LLMOC4PH24OQfKHowDcifH51SCQ+bg0Rv/1sX26PfwD4qLKftYrlRMAAAAASUVORK5CYII=`

let base64_startbtn_dark = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAbCAYAAACJISRoAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAIQSURBVEhLvZQxchsxDEXFvY7LNKnsyr37dDmJj5DjuHXlGdcuPeNLpJVoPACfwlK7E6kJZr4+AAL45HK17WD2/NXNDoeTQXwyp8biP3dL+/XZu9ecAqwdk5VX7uVHawsCJEkEd4cGVFCDXSsAP773vvjwLDhaVv6Mo4EmF6FnGuZ1c44640UD9Hhm0OAbgelMkdUwQE3NlXg5mReIhTFQvoYcYhMuks2zADwLEPtJKkZjRQoAF9kRGLB4bMI47sRQWX48wjil8tiegPLUSQBenSTuJlF2L9CAeXylAHG5+AIJWIFOIN9FiHO9DgOzAGwXH0kfZBl/jTO+EDe4CH72aRg5/JpTPB5Xz917Qea24CIMLcPI7wmwtsQfkH95JMXCOR9fAolo2L8EiPcvPuEN9qMY07CxXgZuxf/F2tNHfCB9p4V9p4LWDG8Prf187b3uej6BauWfH1dJDoG6ljF2iwA8XmElVwLVzxi7RQAOkdLk/lZDAoOvFYDjcVkwBGBhiqnBbhGAzyepxaVA0GDsFgEQ364MevKq2TB2bsAuauTPnP741CPgviWHWOYkgO8i05BNTp/ehYGzgIRVBCvnImV9k9Onlz6/kz2Bi0bDEJnXa535EvCTXAhQDOQrb6DBRab1welXAXJ+8SsBuPhVAN9FyvrcMwvgL2/3rXnhVKwCimuji6hWnP6WwN/frX0DLyztC0lszt0AAAAASUVORK5CYII=`

let chevron_right = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAASCAYAAACNdSR1AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsIAAA7CARUoSoAAAAAsSURBVDhPY6AtaG9v/6+lpfUfyiUMKisrRzUwQWnKANHOGAoKSU5IVAYMDADA8zMSSBbB/QAAAABJRU5ErkJggg==`

let chevron_left = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAASCAYAAACNdSR1AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsIAAA7CARUoSoAAAAAwSURBVDhPYxg4oKWl9b+9vf0/lIsbgBRWVlaOHIVMUJp0QLQzYGC4aCAqIVEAGBgAXawzEnqs+soAAAAASUVORK5CYII=`

let base64_tray_network = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAMAAADzapwJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAB+UExURcrO2l9hZxgZGhkZGhkZG32Ah42QmCorLbCzvV9hZsLG0cTI08PH0tDV4cvP27q+yJebo5ibpJeaon1/hsDEz15gZl5gZUxNUcTJ08HF0NHW4YyPl5mcpGxvdTo8P7m9xzs8Pzs8QIuOln6Ah3x+hUxOUnx/hsjN2KSosQAAAHVRcccAAAAqdFJOU///////////////////////////////////////////////////////ADKo8FwAAAAJcEhZcwAADsMAAA7DAcdvqGQAAADSSURBVChThZGLToQwEEXZaRXbjgq4wKLirq/V+/8/uHcoJAQ38YRM6Mn0UqYFrlKg2IlzIk6clxvc8r28ow4hxhSVj+r9gzxqqkpqr/NGI0pVN0+eWtZ670Pb9X90dCzqTKdsJmiAg1j2Wg+m91P3OuTZv7w249s2BMe2PI38Gfg4m5muZtmEkFCxUG+6/9FDXi50DUuB94+8XJi7j6W3yVrhcB26rIE0aOo/Odj41celOxPstKgD0OZzG6rfZ96EnntFyJ8kP3ZrE8wefxe9BbgAp3Q42pjA9pkAAAAASUVORK5CYII=`

let base64_tray_volume = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAUCAMAAAC+oj0CAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAACEUExURZ+krUNFScHG0SYnKW5wd0NESFJUWMDF0IeKksLH0m5xd4iLkzQ2OZ+jrF9iZ1BTV1JUWVFTWKywujU2OV9hZ4aKkZOXn3t+hV5hZhkZG7W6xBgZGquwuba7xbe8xrW5w56iqzQ1OJWZoXx/hmBiZ6quuL/Ez21wdoaJkXp9hEJESAAAAKgm6ecAAAAsdFJOU/////////////////////////////////////////////////////////8Ax9YJjAAAAAlwSFlzAAAOwwAADsMBx2+oZAAAAM5JREFUKFNtkIkOgjAQRIUCIhWhAl71PtH5//9ztgUSg5PQlJftzO5O8Fcj7MEIB4GcPQ5V1N3imEeHQ6US+VNTQKU9nqlMC0YyB3IlOFwUJR1Sg2jpS6sJcVU3egU0CdYsTStgvSHe7pxPUwB2z08SiO3BYwMYOtgjDlawr9aCG2B7ws7ho8OMhGUmTc4XF6nTq49knGbs7U4c1iZhg7pE9mCD9KlyYtFTvVo3juEDNtJhcjd87oZvB8ylvLtbLCvs8aDPz2IHMZYaYRHwBbMgOkckAhjRAAAAAElFTkSuQmCC`

let base64_battery_volume = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAATCAMAAACjpw26AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAACiUExURdDW4Xx/hl5hZtLX4hgZGn2Ah0tNUcDF0MHG0c/V4cLH0hkZGhkZGzs8QJeboykrLbC0vn1/hq+zvaSoscnN2cLG0To8P7m+yF1fZV9hZl5gZl1gZYqOlkxNUpibpM/U4Ds8P5icpJaaojs9QCorLYuPlsPH0qOosbi9x5ebpLq+ycvP219hZ4yQmEtMUUxNUaOnsK6zvMrP28PI07/EzwAAANDvdecAAAA2dFJOU///////////////////////////////////////////////////////////////////////AKGPTjEAAAAJcEhZcwAADsMAAA7DAcdvqGQAAADKSURBVChTbZDXDsIwDEXbYGgooezRlL33vv//a9guIB56FEXW8UjkAIWIDsI8/kN0aPL4D9YlKtRlqkQWVWttzHx1qUaO6khIcY1mrlscU1trhA5V+Q7Q7YXUx2CYGuNNNsI4UT2ZJlw84xY5BD9X7XqLJZoyVizB0GrNurbZ7rhYvGovl2hgK4LhBDJuUx2Hn0oBmdMhFOmX3SeDdK9P0uHovfGZYdLTGZeF6tZV/v/jRrpUINXmL427JCX1iKx9xrGs6vVbVQHAG4jENGEFlGbIAAAAAElFTkSuQmCC`

let base64_cut = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAWCAMAAAD3n0w0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAB7UExURXd4eHBwcYSFhomJi25ub1hYWKSlp2FhYWdnZ5ydn3NzdIyMjpCRkmhpaVVVVZWWl5eYmmVlZWBgYFpaWnp6e4aHiAR61RuG2CqN2gN51EBph0Vtiwh81Qd71G6w5T2X3VSj4Uyf34C553y35h6I2DWU21un4Vel4QAAAG0fRqMAAAApdFJOU/////////////////////////////////////////////////////8AUvQghwAAAAlwSFlzAAAOwwAADsMBx2+oZAAAAKVJREFUKFNtj9cCgjAUQ6uiDMUtxcVw5v+/0OZ2PpiH9CR0XBT+SMrky4RmyymdmmV0u2kubmTBlotcFhSlLO66aklf1RLCG3JuLRjLsgDqjQu+RLaNHCCcNYplvnOQlns3j1EoD8kv+PJ4MmNWLrBsdHu+MFzPum1seWO+BzNRoeuJQ4dICuNA7EZEUnhoYvtEJHPn6w30kj3x9Y/WX3aB/JyJgB+omD4SO/p+PAAAAABJRU5ErkJggg==`

let base64_copy = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsIAAA7CARUoSoAAAAH0SURBVDhPY6A2YITSOMGpBx/+77r7g+Hyi58Mn3/+Zfj3HygIwkDAwcbEoCrIwuCkws3gqSkINougga6z7/3//peBwUmJi4GbFVU5yPCLL34w3Hv3m6HBSYjBS0sIv3kzjr38L9F6A+oe3MAZaGnJ5sdgdUxgERzg6qtfDOLcLFAebmCvyMXw/Ms/MBuueuvOvf/Pnz3N8PXLZwZePj6GqopyRpASHnaCocLAzszI8P8/xCNgF+49dOz/vt07GFSVFRn8/XzBhoHEYYpIAWAD79y8waCupsoQHh7OaGFhQdhJWAAjI0Qb2MC3b14ziImJgQVQAFQRKQBs4N9/kADFAOR6mRoAJVLwgX//ifM2ShjiAsqCbAwPP/yC8nCDc89/MvBzMIPZ4HQIMx0dFDtIMGr33fpvtvDBfy91bgY+dlT7QZ48+fgHw85bXxmqHQQZpgH5YAPxpberRWqMeksf/p91+gMw8kAi/8FxBXOEGDczQ4GNIEOMiSjCVe2d3f/XrVtHepRiAWA/SEpJMzx8+BAsgA80Nbf8P3T8NF6Lwc48fubC/w1rVzFwc3IwaGpqMrCysoIlYeD79+8Mly9fZmBiYWVoaWrEHuBQAJc8efbS/2tXLzO8f/8OEtpQGVBYgbComDiDjp4Bg76mCl4DqQwYGAA2WaUiTjPRUgAAAABJRU5ErkJggg==`

let base64_paste = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAWCAMAAAD3n0w0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAACBUExURW5vb1VVVVhYWISFhqWmqH1+fl1dXZqamtDQ0MvLy1xcXG1uboyMjm1tbaioqG9vb4GBgZiYmIuLi5SUlF5fX39/f6+vr3d3d1Ch4D2Y3YC55w+A12Kr43255yCJ2QB41JWWl4CAgAR61SeM2mes435+f1dXV4S85xOC10Wb3gAAAB05AVoAAAArdFJOU////////////////////////////////////////////////////////wAjyafQAAAACXBIWXMAAA7DAAAOwwHHb6hkAAAAgElEQVQoU9XRWxKCMAxAUaJUi48ISlFQLMrT7H+BlIRxOuoGvB9Nej7bgH40YwAAi6XsjKFSq7XWOtps1W7GcI94iBExgSOeUkGFbiTGmDhzC3j47jwdn8h5eMm5wsfrreTuhYdWBpX5v2P1kMtTBtWNQ2rdV3RE/WC51/QgXxGNY2U7qLXH3+0AAAAASUVORK5CYII=`

let base64_new = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAVCAMAAACeyVWkAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAACuUExURYaHiHNzdGhoaHZ2d4mJi6WmqFxcXGpqaqOjo6+vr4uLi2FhYn9/gGRkZKamplhYWJCRknd4eXl5eZWWl5eYmlVVVVdXVyeM2pSUlG9vcKKjpQB41Hp6e2dnZ4iIiI2OjyOK2YC656CgoH19fmlpaYaGhpiYmGFhYWBgYH9/f4iJil1dXWFiYpiZmqSlp1paWqmpqYCAgJaWloeHh2JiYomKi5ydn4yMjn1+fgAAAB9e6YMAAAA6dFJOU////////////////////////////////////////////////////////////////////////////wA3wP8KAAAACXBIWXMAAA7DAAAOwwHHb6hkAAAAxklEQVQoU22Oi1LCQAxF22qFSmvrA4TWgooKKFBBUe7//xg3m2yRGc/MJrlnMrsb4D9aG4TR2bnNZuOLThdILqOei2rTzM3kKi+kib2+kcnIbllo79pNR5+HdqAJ99qGI7FlpAmVdS4HeODrDm/rkra20NrxhFZux2OlPHF+ntK+iBX87mtBm75Z8nYW02Ju6eQP8D+TO8ni3Vl8aFSSJYvYld8mSS5VLNbNpzSykE2zQNhstt2v7/5Oo1ng53dfxDYf7R+AAwDvVgyrKzhWAAAAAElFTkSuQmCC`

let base64_rename = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAMAAADzapwJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAACZUExURSKJ2QB41At91lun4S6P262usKSlp3m25j2X3ZOUlVVVVXR0dH9/f4mKi6ipq2JiYmhoaJ+gonBwcaysrE6g34S86Ax+1lKi4EOb3hiF2AR61W6x5S+Q2xCA1wh81R+I2D+Z3hSD1yeM2n2553q451al4V6p4nBxca+vr2RkZGpqapqbnYSFhlpaWnZ3d39/gKusrheE1wAAADVsaioAAAAzdFJOU///////////////////////////////////////////////////////////////////AHGevY4AAAAJcEhZcwAADsMAAA7DAcdvqGQAAACySURBVChTfdHZDoIwEAVQUEEtqLiLuKB1VxDn/z/OWUpSq/E+DJdDA6H14Gds9nxMQyrPOs2WKcxBKIF2B8LAcFdFsYQ4jlSPuD+gxxJkTDJEHo2pTqY0hSFBVtz8GU3Dqub5IqXlLi8BUrw4nK0A1t+82eb5bu+yTrXWB3zRJ/Pn4Jg7fOIbyGw+X7hyDNPvhFeuHOHbHRkeRWlvVVk8zcZW9sZWJP+OwYQP7SWVpxOANzLQSTLguYj1AAAAAElFTkSuQmCC`

let base64_share = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAUCAMAAABVlYYBAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAACoUExURWqu5KWmqKSlp3m25gB41DmW3Hp6e1hYWHd4eH19fiSL2hiF2Kipq19fYFSj4T+Z3oSFhpeYml+p4h6H11em4ieM2jmW3ROC1zeV3AR61Yi/6IC55xqF2HKz5TKT3Gat5DOT3CaL2Ued3xqF12es40id31al4Qh81Uyf3yyP22as44GCg6iprJ+gond4eaWmqWtrbFVVVVxcXZWWmHBwcZydn39/gAAAAE2r0qYAAAA4dFJOU/////////////////////////////////////////////////////////////////////////8AO1wRygAAAAlwSFlzAAAOwwAADsMBx2+oZAAAALVJREFUKFNtkNkSgjAMRSvUpSKyKOK+74rimv//M5ukHdDxPORyz9AORMA/vq1tlBXHcTBdWcUgW6s3lFJY3KbHWkDLpwekHQBrAWFEBuKO9LoASY+soish7VOwtnYwJIXIkbXjQhbvTqbYZ/PvexcAS7labwJIzDegldvdXhf3wNLalErp39AeuUBskm2J01kPbTOuhstVDwFRztVww6F3ds8zvUnm4T+Nhddbb5IJ8TzbXwA+6HVG5figWaMAAAAASUVORK5CYII=`

let base64_delete = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAWCAMAAAAYXScKAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAACTUExURZ+gomdnZ5qbnZeYmmRkZKusr6iprGFhYpWWmKWmqaSlp6KjpVdXV4SFhoOEhX19flVVVXR0dH9/f35+fnp6elhYWHNzdK+vr2xsbIWFhp6enqioqH1+f4uLi5aWlpCRk3l5eYSEhGhoaHFycmBgYF5fX6amppOTk3BxcYSEhXd3d319fV1dXaysrFpaWmNjZAAAAAcXGGkAAAAxdFJOU////////////////////////////////////////////////////////////////wAfmk4hAAAACXBIWXMAAA7DAAAOwwHHb6hkAAAAsUlEQVQoU32Qhw6CMBRFwcFGS3HXvXD7/v/rfKNITYgn6c27J6Hk1YM2Guv5fseOje32+kEY2YI2TpA0y5NkkKU0x2SHqtC6HJU2CpXzDaF8VjOWeydTqZaZ2PlCqmCWYqOVdGG9ERtvMYwG0AaHXSoW9q494GGrXHtstVT+WFrja0+15TXOABWVCx62ubOGuWKwddeo6DXZxjdK4R5gsIUH/YZ5vijFwltZ5FWt/QHgA+c3SGOtQFZOAAAAAElFTkSuQmCC`

let base64_sort = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAASCAMAAABo+94fAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAA2UExURZKTlYmJi1VVVWdoaAB41FxcXW5ub42OkJSWmIyMjlel4m6w5SaL2gt91lCg4ByH2Gas4wAAAH5o120AAAASdFJOU///////////////////////AOK/vxIAAAAJcEhZcwAADsMAAA7DAcdvqGQAAABxSURBVChTjc1ZDoAgDARQ2VwQl7n/Ze2CiI0fNoGhj6Qd8FmV7a/2zgdJIGoIu+TDKG3PLsFjVH+YlLh644mUWb3xzMGMhU6/sjLXb878EF57LoUu5i2/hrATb7uZTR5FzcpyRFHDOKLoza1ODctSwAWhEBdo72GxvAAAAABJRU5ErkJggg==`

let base64_view = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAQCAYAAAAS7Y8mAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAABsSURBVDhPYxhygBFEZGfn/H/16iVYgFKgpaXN0NjYADZ3aAG4k5csXf4fyqQIxERHgs0EE719E/5/eP8OxKQYqKqpM8TFRg/VMKZmUIiJSzDk5mQx0izyhh4AO5uaWVpJWYWhs6N9yAUHAwMAhQEkB+d5JHMAAAAASUVORK5CYII=`

let base64_ellipses = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABcAAAAXCAMAAADX9CSSAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAPUExURZ6goywsLRoaGoKDhgAAABl4tukAAAAFdFJOU/////8A+7YOUwAAAAlwSFlzAAAOwwAADsMBx2+oZAAAAC9JREFUKFNjYMEORoI4GpuRiQnMZILTjGBxIJ8ZyGUA0iAdzGB5POqxgqEtzsICAKRQB/27K4B6AAAAAElFTkSuQmCC`

let base64_back = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAARCAYAAADQWvz5AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAACJSURBVDhPYxhawNzS6r+0tPR/KBcvYILSGABkyJNHDxncfQKgImQAmEuS0rOJcg1WMPgMiYhJIMsQRhDh7uX7/8rFc2ABUoGugTHDjq2bGFlAHBV1DQaYQQrKqgxCQsJgNjHA2NwKZBCUBwSgcAF5DeRFqBD5YNQw0kFqdv5/BQUFyg0iHjAwAAAO+EeFhoR9sQAAAABJRU5ErkJggg==`

let base64_forward = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAARCAYAAADQWvz5AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAACLSURBVDhPYxiaQFpa+r+5pdV/KBcrYILSeIG7TwDDk0cPGQgZRhRISs/+T4zLiAKD17CImAQMwxhBhIe33//LF86CBUgFOvpGDDu3bWZkAXEsbOwZWFlZwRLEgHfv3jI8uHsbzFZR1wAZBGaTDEBeAnkNFF5QIdLBqCHYgYKCwv/U7HzKDCEOMDAAALfISfXi8HxcAAAAAElFTkSuQmCC`

let base64_up = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAASCAMAAACKJ8VmAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAnUExURUdKTWtxdTc5OhsbG2Jna1hcYDs+QE1QU2VrbyAgIEhLToCHjQAAABnUEiQAAAANdFJOU////////////////wA96CKGAAAACXBIWXMAAA7DAAAOwwHHb6hkAAAAT0lEQVQoU8XMyRHAIAxDUWJlg7j/eiNbhkMaiC7+85ih+XdL2jajrgG7qoQwSWI4cJooJRpXHkkWRUHRUwjzDkmQuPX6mZNwv8h4KpbU3F923wxL+bPtAQAAAABJRU5ErkJggg==`

let base64_onedrive = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAQCAMAAAAlM38UAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAADAUExURYGw23us2DeExwNkuAtpuh50v0OKyV+p40WV10OPzhVvvniq2BOC1wB41A9+10eR0BJtvA9/1yOG1TOCxx10vzyQ0TyW2U2n43y35z+W10md2hSQ3hSQ3zuh5Eyf3wN71hKN3iSi6Cio6i+q6lGu6BuT4HK66h6I2AiC2RiV4Sen6j2u6kKm5i+d4lel4gF51A6K3B+d5k2x6i2c4iKW4QV+1hWR4CWk6S+r61Kv6Fqx527A7zGr6z+x60Sy7AAAANFG0dwAAABAdFJOU////////////////////////////////////////////////////////////////////////////////////wDCe7FEAAAACXBIWXMAAA7DAAAOwwHHb6hkAAAAl0lEQVQoU23P1xrCIAyA0VbqFve2Wq171r2V938rExL6ecF/RQ4XEEdZ+2PH5QMUc0JAnrkxnESFUjQSpzPZHHteA3JBQsWSp7lsuIIKVWtC1BvNFnGbFep0ez7URx6wBcNROJ5M0WfAc42L5SrE1hvgLfBOymh/0KY7nvwzPnm53lio++OJ/OIx7s3rfHimvvRvW1ZW6gecJToOKMkf9gAAAABJRU5ErkJggg==`

let base64_taskmanager = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAARCAMAAAAFWBeyAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAACNUExURY6OjlJSUlNTU1FRUYeHh1lZWUVFRYqKiomJiYuLi1ZWVhoaGhsbG6CgoDo6Oi8vL11dXT4+Pp+fnygoKK6urjMzM0tLS7CwsGhoaHZ2do+Pj3JycqampqKion9/f2RkZGNjY2dnZyEhIUlJSTc3N5OTk2FhYa2trXx8fCUlJU9PT6enp2BgYHV1dQAAAOd22PUAAAAvdFJOU/////////////////////////////////////////////////////////////8AWqU49wAAAAlwSFlzAAAOwwAADsMBx2+oZAAAAKlJREFUKFNtkNkSgjAMRQGtLK0WFXHBFRUV5f7/55mkZRxHz0PSnGnSTgL8g2wQClE0cGnIVo1iRxKnKecsJKt91wdD1lAeT1ztYMt3lW+wOUftrZ0qLmEsx95qiZjNJfkJxQKlWgKrtd2E1Vbu7rA/ABm9aovcHE+12HN9uVJfo27UVtGJrcFdpuGhW8n93Kerevo/fMO2ffkteJKmJIvOrYqj0MkmfwDeSuYs79KrhkgAAAAASUVORK5CYII=`

let base64_taskbarsettings = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAMAAADzapwJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAABsUExURSssLRkaGj0+P2JjZoCBhX+AhGFiZT09P5GSlhkZGhoaG2FiZJCSloKDh4GChpCRlZ6fpJ2eoisrLZCSlU5PUU1OUICChWFjZZGTlhoaGisrLJKTlywsLWJkZp6gpIGChYGDhpKTlnFydQAAAFpKbmgAAAAkdFJOU///////////////////////////////////////////////AFgsDQ0AAAAJcEhZcwAADsMAAA7DAcdvqGQAAADFSURBVChTbZHZFoIwDEQTUChaURaBuqL5/3800xbqA3MgZ+bSlZBsKmFizqL9w/lOZF/EkHC5FgjY5FoqpIO+R6MFmG1WVSfgmpnOHDBdQJIasDABKpYNW8+4g++pM+0VzuoqGEoDCoiOkxrFJ/08TjDT6EPETrGFsYo1BHzDIpjq04CiLzcgPdk79XBT2PIBr3ouB1SG5xVjVLyOHrx1/AaZHZOJl5cPfpU/AEiO2wF7+RasfVgx2jB/Y0hYSrfVtH+J/ABAODdwWwmMsAAAAABJRU5ErkJggg==`

let svg_minimize = `<svg class="min-icon" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="minus" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" height="10"><path fill="currentColor" d="M400 288h-352c-17.69 0-32-14.32-32-32.01s14.31-31.99 32-31.99h352c17.69 0 32 14.3 32 31.99S417.7 288 400 288z"></path></svg>`

let svg_maximize = `<svg class="max-icon" aria-hidden="true" focusable="false" data-prefix="far" data-icon="square" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" height="13"><path fill="currentColor" d="M384 31.1H64c-35.35 0-64 28.65-64 63.1v320c0 35.35 28.65 64 64 64h320c35.35 0 64-28.65 64-64v-320C448 60.65 419.3 31.1 384 31.1zM400 416c0 8.822-7.178 16-16 16H64c-8.822 0-16-7.178-16-16V96c0-8.822 7.178-16 16-16h320c8.822 0 16 7.178 16 16V416z"></path></svg>`

let svg_close = `<svg class="close-icon" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="xmark" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" height="14"><path fill="currentColor" d="M310.6 361.4c12.5 12.5 12.5 32.75 0 45.25C304.4 412.9 296.2 416 288 416s-16.38-3.125-22.62-9.375L160 301.3L54.63 406.6C48.38 412.9 40.19 416 32 416S15.63 412.9 9.375 406.6c-12.5-12.5-12.5-32.75 0-45.25l105.4-105.4L9.375 150.6c-12.5-12.5-12.5-32.75 0-45.25s32.75-12.5 45.25 0L160 210.8l105.4-105.4c12.5-12.5 32.75-12.5 45.25 0s12.5 32.75 0 45.25l-105.4 105.4L310.6 361.4z"></path></svg>`


let base64_home_small = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAJaSURBVEhLxZNNaxNRFIbf6VRioNjAVFvBnR9V1IAfm2KocePCRTSK+BPcFRGlCbjoRlQq2J/gWgiCrgIKLgMRFBRcCorYTktmqrbaZGau59zkTGfSmWQlvnA49859zzNnzk3w37Xx/Ib6WbuuetuhMnp5oJwnUwqb61CEVbvGYc0vD60bamgtTqlgw4EKaKMMnRk+ubAysHbg4er9SYXf1KmvYJ+qEjTAxNuHQEBlmXHsf2Cn1qce2Av7VEBQUIdrZyvwj15FQGDjYw1W4xFALzN253BgaS2RMdLLMa3c26v8Hy6CLYXV0xV40+XeCdCeLsE+cxd+W6HjOvh800q80B1vW54n6CZBqVNnpgr/+DbU9326QAJ2Ohj98ALWm0XyUefZHA49bcVYsc232xMEpc+nHlrnKghOdKEM4zGwOHN4ngfzPcFfP9ZNmDSWI8+ckBcuvs5ZdPvr2uTOEjRfhmEYGiLgKJyftdttjL57CevVEj1UGBnL4VjN1Uw94y93DqqO68KnmbYKdFEnr/Bj/ekMkSxrCX7xVv4S7OKtrv+Xi0/XcnrmGpw5PAsPY3DOV6nTy7qbfmhS5mD4n/xFfL8wxyjsmek2FY6i0Wgo0zT1mgs5omsZRzTLmoNnzlEulzUzBDebTfLtLC4UCqEnqnq9nugvlUrbM2bxgXxmNNI0zB+C+2cnkaZ+v6xFiR1L5kiTfL6E1Ihi4KiBM0ea+KKkJskfGwVHFM6RpqgvyR+C5V8mRok0Rb2yzmazvdMIuFgsGplMRhtlfrxPE0MEypn/A/Ib/ocC/gKr6EHSWoTWqgAAAABJRU5ErkJggg==`

let base64_desktop_small = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAASCAYAAABfJS4tAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsIAAA7CARUoSoAAAAIjSURBVDhPtVS7bhVBDPWNolDwB6QBAUG6dPkJqkj0BIkCBD9Bgmho6AmiQkBBBVIivgA+ASQkaGgoQKQDdO/OTs45tmfnQp2VvLaP7WPPY9dO65mFtoc/j2utZnWsNoMuZYTjfqVJu9CGwHEcIGPUyjV7vL0pTr1uff9Rv/5Z2MgkFg8jbGQW1KHBSAySmgQjc9g8ahRDzaWzG/bu2tZsjcRffi+sDNXeXzxnH7Y2rSxRtKw2LAtsFEGEIadCCnAS02aMuAT2519/SWkidiK0jmfkpEFOgsLpVOh2BT6RAot66rJwHhE7yWhXXx3a/OUhbE5KMievsEkkskVM/w9pE2ArxEz4eGPHPu3utCLHo0nkEOeeNnKI46xxfyLuAD7pp/Z9nYi5XJ8Qew09NfIcPtNWoODKs7d2+ekbFJa2h0kqAvhJzlvAA/eVhVZNR5wnv3FhbmfOz5WgA0MSt8LJk4QYfDRPImFYRWKNWMEomsSJ6uC3RndbREkWmhiEzXN1E3GbxKWf7L8pobVNFMUdz1qD34g51coEy7zbKOBBKR4xTc5Yr7vanpgk+iwjQcsWxtVkkWOajPtJjKsILPN4Jh1x3lUPDnEIea30CYuEzZ1kui3RuNkrWxFJKuqmhOgTFtYXRzPlM86GFA7gh7fO1521b/bo9RE6YBLi1GyMvxV/cnzJj3j7TcJ/vnfXbu4f2IsH92z3/hPbu33d9pF6So/ZCX/OYQloTRp4AAAAAElFTkSuQmCC`

let base64_downloads_small = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAWCAYAAADJqhx8AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAGCSURBVDhPY6ApWPnq3P+u+4f+Q7lYAROUxgomPD3AsODhZSgPO8BrAAj8/ccIZWEHhA34S4EB//6BMEUuYGT484cCA/4DDfj3H78d+A0AOp+iMPgLDIO/f6EcHABuQODVOf+Dr85FSTQgF/z7h2qH9YGl/y33Loerg8uCFD/89oXB69wCuCTEBQgvmO9Z/v/ex+8Mv34jDIWzNugmMwozCDA8+PyVwfHoYrAhINthLjDeseL/3Q/fGMSY+RnOeoTDTcUIIbtDS/8/+vqFQYKNj+Etw3uGFy84GZQFeMAGy3DwMFwJCEHRgzWITXau+P/wyzdwAP79ywTGMpw8DDeCgzDUYzUABHQ2rv1/9+NXhn/AMJDl4mG4Ex6IUy1OoLRiw3/F5RvxZueBB2B/BQET0fNfn8AC/8EOhnj3H5D9H5gW/v8H8UGJCoQhfFB07raIYwSrdDmxEBjqwAADxjko5P8DM9AfIA3SAEpI/0AxAdYMwSA1crzAWAkMJj1gUQEDAwA4T645qdUHbQAAAABJRU5ErkJggg==`

let base64_documents_small = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAWCAYAAADJqhx8AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAJrSURBVDhPpVM7axRRFP5md002s7Ozk2TRH2BhpVgIKYxl8EFQSC0LFhZi4W+wsVGwtFNEEVIJFgGFQEgaGyOxF+xN9uFm3dfMvZ7v3JnZSRGbnOHMfZxzvvPdc8/FWcVLx//K3sEva6yFquEIrF27qLH629n/afvDMSAGOsXGIEksEvFUTWQt+9k8Fo3qPu6vXfFKBOj/HXGQYOMyGAc0y8jAVGVtrYffnYHGKAA8D8JRHE8G5gxE+SkQ10wkSlEAWwiKJYuhypzqbChkn9kKAMwsTmqQ84qyDtk8Y8Xg3CdJFKDCH42xbNxeuYTAn1dDJr3jId59OUDr5lWEtSp6gxFeffyqMRQFcKgWbz/tYjyZ5Gvn4mEhiDSY0pBxIj6lUlnXCsACErB19wbqvnPMhAxeb31D588Ai2EN7W4/rYsrovbB5vYPO5nG6HaOMB6N9J61FwS4XJlDtRai2z5EPJ1I1cqo+nVN+PThLS+vAbW1fh1hsMCtU4VMXm7uKguKMnj/+budxokyGA5His6ixsKAMo1jrXoiPuXKOcwLAyZ89mj9JIMH91bRCHwNOk3avWO8+LAjveKuURm82dq3zNg9OpzdguzHktnwHbAXyEjWJWEwV/WFkcHzJxvuLTA7sWqNJUTNC2gsn0e42EQYNVGPlhHIPm21aEnoB5qAoBQHoBU3eu88thUw2nWUPeLrvjwiZi52omvlNIBObKDcyUjh9AhJHsTRKdOlAOqUPmW+ezZJFpRpMTib5wDatgKYFYuFU2eOsmYC9wqLQIUjPN5Y8Vz/08EZ6ahHUGcXODuawZ3VywpwRgH+AWBRVByQnQGcAAAAAElFTkSuQmCC`

let base64_pictures_small = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAK/SURBVDhPrZQ9aFRBEMfnGQ81eCJR8+FdvBMTRAjiJ5ik0IQUKmhEQkohoGBj4p0p7AVbIZDOJq2d+NGIEMHazkIUIcFOOEkQ7+O9t8//f2b37tJn7uZmd3bnN7Oz957stkTeyvLnWlaPXZcH4jLJMoHih6KTYDNxWKfjyP4eeT49qJH68+Dj7+zDZkNibIjwcZnThUyBCKLVsVNLWLftzUVypdArr+ZK0R4C138ZjOIcg6ApNqewiROXpubHXOGwxYM9tg7/33oin35ua7wC/yU+GzcwCDBCFOzhosHmX7tVkC/3R2RtdlgTIJu04rQDJMT5bASHatTn/boGHc7vlRsjeQ2+OZqXIua2z05oQA2wfmhlAd4GhTUnG7WmvP++pcHvvm1h3rBYxFH0UgZWf8Djj02DQB1jo4qOCe+Mhw/lZPNPE1Mfh73bzy7bpVgG09ArU4wxdwkuhUl0br1lZc6hKoxDaygKpBO7kMgWOxUxibWAxw633V5nEfBrIi3fA0NTbQPHvo/sSxrLWF8kE0M94lo4IqGo2PrKPTwBLLQNtOysLoAsa5TEsjx+VNYfnpXXC2OyOluWrIVLIFSTeahXiq+QoACzRVZTBWx5qiRMDrfMnx+UlTunsNbQhNoiVGtAu8B2hdYvRBHWbEh1sl+eTJUNxruCcjx/4bis3B1FpU3NEuI0FtIB8gjMkiZSmRyQ6rWSQtRFaBd47mJBXgCaNutwIM5fEkWBVhmcSVMWx49JBZWlWaSQUCGfzlAlk8xdKkp1+oRdFJw7KtQeJi1ZmhiSpav+mFC+zQhSGMdQfG0d9vH101KZKWESE6OiwHxOZOZkXh51HTNUxJPosb0SpkkIhS4CujBZkHLfPgXqo/fmay17+nbDnsvQD1i+TLXpvEX+cfGl0x43jk0OH8jJy3tn5Pa5fuXtooj8B4U8wgtWB8ymAAAAAElFTkSuQmCC`

let base64_music_small = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAOBSURBVEhLtZRPaFxVFMa/9+bNy/xJYp7510xL0opV2iKUQoviwlKkRkWKYHXlRkQQLVQpLl20u4ALi5RuNN0UURBBEDd1IaiLQrc12BJjEywZaww6M5l58967fufc+yYdmujGnnBz77vv3N/5zjl3Hu6XeW7e1jaufmOS9TVkrQaM8eEPj8GvDGHwiaf/9ey2L1tfXzRJ/Ta6zb+RttpI466CMVCFVyzDG3oQA7tmEM2+tCVjy83Gp+dMvLyILAWyzEdmCm7Oh8cgHgOUUJysYecbp+/h3LPR+PiMiX9fdYBAgWlGcA9K1Q4uA/ARTu7AzKkzfay+h+al90y8+htBPhUFSAg0HClBSeZh8q330eX71sJ1NBd+QtbuwBAhf8HYOB56ZxPO8NY2vpxjTVc0RSCwcMIEKut2wt2RCOVHD2D0xEmMv/Iqulqeggpo19dwa37eWNpd4OTX65qm0XpKDXkIVOz2krTnqlbevQdxysCp+DMrBvnrxpJ768DtK5+YrMO0BKa1s7W09bVrwyBi350/j8Xvf0B94Wd0E5eRvDdFpMxq+YuvVLWC09UlB7NQw+0cZoNREdWJJTd/wcLlz3H1wwtsojRXGiuKeZbr5q3b6mfB9WWFgQ4CEicQqsF0tgHFotIgdkXjmBmZRMEPHZQ9YZCU6436uvqpdxbH7jBryy1bX1EgQ55tEDHDxvqE6B7Xidweji7Vdhkg7tj+qbc3PLF5N13jjACpdujxJzF9+l3sPfW2HtCMRCWhAurmYJm5F07V1E/B/sRuq9alnKeehSWMPvMcr9kIKrUpPZDkUAXytrBpMdVa1QGCKFI/BQfT+2wJtAySrtSZkGBAnXJr3uHHiFkoXKAoKlDgufLHXn9Bu6zg8uHjnl+qqmK7JQF8tP5Yx80r34qL2tKP15iJVSo13ZwtvOjUitk75Gzl7JsmSeVXR0eOTlLA8p8NNAbK6DRjDHoVRINjVB0qTGvtSgfPw4mPXuvxVHFu1SPH+N85ci54BdQeiDBF0HQlwuhQpLdCy9AbFMGS7H32kDJy6wNHsye94adm9YZIWaQcvhegGpZRCiv0KPZqrGUgVMaeo/ux//mDfdn3PdxtN+bmTPsOP/LSGLmfmXQ/RKyNCjmK/OiX8eIHL2/J2Bac2+L8Z6a51sL6ypqC/WgU1doERh7eiUeO7fvP8/+zAf8AQwn+aPSab48AAAAASUVORK5CYII=`

let base64_videos_small = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAAWCAYAAADNX8xBAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAALcSURBVDhPrVQ7T1RBFP7uvmRZJGtA6U2s7IyFjRa+OjtDQac1jRYkvhLxkdhqQjaKxhi0UZDCgBWSGEzURCwUH7T4wLiYfXBX2Z17x/OdmcvuD+CEs/PN3HO+OeebGbBVFvgRS9Mta2MrKIC17VEhzWOdclQQYN9QTjn053WpaeurkU6TxFhIldD9wcb88VjW+R02QM9AgCMj3UGKSbWfkXxwyVEUi0ugOJN1XfZw38SNcxsHGlv9wR0AJWLwxMIYbj6/5BO5I1xi4pLc3sxi8n0JdxeuKG4TyaTWWENl/bdifnRjQpoQ+2oFd8bTVKNnI6HTV4yCqzTenbCy1iF+56GQdOh2r9OIGlAPbUEwx+MXu7H7YFoDY9GjXSnnndWRdFMji8eLJYy/HFW80dpArjfC3hMZHDqTRldRSFipJyDp7PI4Hi1e1TWaEpG53vijPRO3TEvGCCYyKAxYHD6Xwp6jLs5VY1GlRmFZD4GmGj0ZrqtGSZl/myEGb/XKPPa6OA/XLF6NBZA9da46Sc7piR1OI5ad9Os0imGMkTFSN4ZuENY2pNqmxqlWkmPEaU4jA8x8vYOH79izK5+JCUGj3sTb6TKmR1dR+SVtSzvz3+9h6st1JdskYgXJvdDKxF01BitL65i8vIIPM00Usn1IBzndqBoyvqyYpho9OFXRB8u7Ekvv/1ohjp0HPs5V8WmugXy2iHxmu5JQGtagI3MEDD/t9xqxCmFWFxzYFKYulLE8H6Mntwv5dFHWshqXHH9kZPRa0ZxGMnnxTXr+fA1WcMpmUMj1o5DpQzYoyK4pORC/kTgJ31TuY3blhh5Um0gmTiPXs43TyCCPVLBNLxwrSDw53ZrcgarcI+1TTDUqDcoFkQXqw/8xHBhBUq7rPSIk5pq3QLK5dnZmZ/utcaf2e+M78m3I7sRKIElMptNIkmAl2n+yy5O4hORhshUtRUyr8bjTDgx1e7QlBvwHY4SmZ5oCoXQAAAAASUVORK5CYII=`

let base64_mycomputer_small = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAASCAYAAABb0P4QAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAHbSURBVDhPrVS7SkNBEJ3ER8BCG//AV2Wb0sZC0J+xtbYyhaBgEbHxF0QsLAQrSxu18BPEQkWUJHd3PGd2594bfETQhcnMzuPMmb27kf9eDf60j471+b0nEqPEoKIxi9vQoppiIdKsYhaPMt1qyf3OZsMAl/a6Oru+gQAwC4JGEdooCtgLNG0K/aEI2aYv1bxcnsrDwVajSUAD6UcJ/WAS+yqF2fAP6KdGMWz6mWv+7LNYgQZYJSCLrLBAY0vKe/rNBpADoJhNPScMEOMkDsgzSCAYMTMILGAjA0kSes6uArMGyNU6YHIyIbEoGRLAbdNsko+DPqtJ8SGGTCqZeIIDQBcAtvMliLO0vNSQoJyyAsTGQSqW9bFSM2PEPCPAWCYBdp8+ihXXhYwMrC7Jl46ialj0EKuPzAO1RLJjVwNi58TKCxMjaNuncV3s8jugF3LMiiESzZdsB/bxKcy3e0n/EEO/NrkoYAQCMFlzE2dSNih9JIO8zNCe3tzmrj69vg2/YcRpC8SeGTXeerVnHKOaVpmZasnjybbhjVyd/UPt7HcThRHrR8Sr6zuQULm5vcNOZX5h0dhMTozLSnv5y9pvAVfX1rXZHDO7gT8l5RnkFUKQi/Oz3433tyXyARLXu+/azkeNAAAAAElFTkSuQmCC`

let base64_network_small = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAMzSURBVEhLtVTdbwxRFP/NftT2Q6OJr7aEhKiviEZCpQ808URIhL5IJDyIN5GIf8GzVxEJD2hFEBKJtBXpA9VWP9QKRUrLLtuu3e7HbGfuzFzn3LurymIJv+TknHtn5nfO/f1mBv8LRj4rPJz4JBOWxLKaStwdeofwWBR11WXY37wO2+sXz7n3d/DlM57FEjIUCqGyvBxDEROjcQtxG+gbi+Fm9zAG3sdk/taSoIhjGVt2vE2h96ON9nASd0eTSAofAmUhFe8/m5gxDAxGJksmV8TXX8QhEMTrhIu044MRCMDnD8Dw++Hj2udHWTCAaDqrHioFijg8aSKe85CwXCwI+WlHggaElDQgxfhkAvFkBk/Cr/j2kqAMOdA+IvnIuxtqsGZRBW6Hp/AyEoedTcPKTCM3HQfMacSjExCNa+G51NCT8Bypmktac/B+6+YGnG3dZQSYOCQdzFgzKPc5WFjux/GmOtwYcNAxNAXXtuAJG7lMBpKMrdq6UxGCSFzH0+RMSjXntt4HTKml2LGiGraZRmc4iqlUFjnLxp6NtTjSvBoil4WYMSmyMJYshWcTkZBwbJdqIqZwuaY91yJyblog3rehFkHHxPjHSfS8iiA2nULX8Btc6eonOVIQHK4DX+NWReKQF9yAyV0mZ1KuBTVx3FnipdUVxrGmVQjaWfooJtA1OIrL93oQ/RAhjZOwSCZjSxNkaL6ekAg8DiJn4kLwtcLEc76mSCIlL3T241bfCDwzB9cTcOqXA2vWE2kVmUOeKV0pSE/WuaAxN+NsPu1G8vwpfql+xMoz52T1thZlDvn6lUx6VPOkLq8Lps0lzo10I3XxtKGk+B5M4pAR6oiCddRasrZKBpJAm0Y1rZWRlHkttcRa4+/BOikyJqIGbI7WVIcyKd9Aa5vPtMdTM4pPzEfj7iQDZw6nkFUz3XD2NBz6OgejOPG3JKrW76yakl8tlWmt5CpMrZ+RpD+jqHknrnbItsfP1eR8NDaNH1Br+pTBJtJa7+s9ZSztHW7ZhAsn9xbl/SUuXbsjOfLLn6KoFP8CJY18/9GgTKUzELYNQT8kYQudhUBoXhBHDx3886P/HYAvKHOfm9MfHwkAAAAASUVORK5CYII=`

let base64_start_search = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAA2UExURZGQkENDQyAgIDAwMF1dXTo6OgAAABgYGAkJCX19fRAQEGtrazo6OU9PT2xsaygoKF1dXAAAACheTmEAAAASdFJOU///////////////////////AOK/vxIAAAAJcEhZcwAADsMAAA7DAcdvqGQAAABxSURBVChTXc7hEoQgCARgREXyqrt9/5dN1rqpGGcHPn+A4FUESZoLxwnVmqq1P1Rfomv9BLEPO3iKFKT5A6xsBKocgcUiBfWCzSMFhR+jNEeOLW0uzDZvGq973Tc1423U1M2/8qMQziohd6A8AOUNAA5NfQ3pREpA0QAAAABJRU5ErkJggg==`

let base64_search1_r = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAbUExURYuLi3t7e5eXl3h4eImJiYqKioiIiI+PjwAAABZYjb4AAAAJdFJOU///////////AFNPeBIAAAAJcEhZcwAADsMAAA7DAcdvqGQAAABOSURBVChTXY7REgAgBASJ4v+/OJok9sG4neYE2kgBePYQg5yRgtgG0xNgq0EzBF6B/QVnx7KxskPOkbwiJOUfngMXf3ZRsouSb+lHE6obn1IHBKRajr8AAAAASUVORK5CYII=`

let base64_search = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAVCAYAAABG1c6oAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAIhSURBVDhPY6A2YITSGKCuvuH/7Zs3Ge7eu83AzMzCoCCvwKCppctQV1eNUw8IYEhOmTr9/9bNGxg+ffrE8PfvXwZePj6G7z9+MHwB8/8xyMjJMfgHBDNkpCXjNRgMcnKy/9vb2fz38vT8DxVCARMmTvqvra31X1VV9X91TR1WNXAwf/7C/44Odv/TUlPwKwQCY2OT/1ra2v9XrlqHW62ri9P/6KhIgoaBwIKFi//Ly8v/t7KyxlDPBCKWLlv5/8+fPww2dg5gQUIgIT6W0cjYmOHp0ydQEQQAG/jwwT2Gf//+MWRmpBMOaCgwNjYF03PnL0JxJdjAu3duAQ0kyrdwoKCgAKbv37sLpmEAbKCUtCzD//+kGfjixQswLS4hCaZhAGygnJwC2MuLFi8h2tRrV6+A6dzsDJRgAhuYmprECHLhkcMHwYLEgEuXLjFwcXNDeQgANhAEvHz8Gc6dO8dQX1dP0JXu7h7/X79+xZCZmQMVwQGiY2L+Gxro/y8uLsFq6KrVa/+HhIaB06CZuTlWNRjJJCQ45P+Nm9fB+VhRUYlBUUmZ4cf37wxXrlwBRsRzsBoeHh6GL1++MBgZmzCsX7cWxQys6a5vwqT/G9evZXj27BnYYBAGAVVVNYaEpGSG69evMyxZtAAs5ucfyDB50gSi0y9OUFlVC/Y6CBcUFpOW5nCB1LQMuKGlZRXUNdTFxZU6BoLAqjXrqWcYKmBgAABLANiF7ZrMMQAAAABJRU5ErkJggg==`

let base64_maximize_tiny = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAMAAAC6V+0/AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAASUExURZeXlygoKBoaGlJSUoqKigAAALgjhAUAAAAGdFJOU///////ALO/pL8AAAAJcEhZcwAADsMAAA7DAcdvqGQAAAA7SURBVChTvY5BCgAgEALXbf3/lwMziOhYzUFxTgYPvJOBHHgqs5Vo0LQsFStVnyXmpVWGv8NTuXFfkh3t3wc5khylWQAAAABJRU5ErkJggg==`

let base64_minimize_tiny = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAABTSURBVDhPYxgFo2A4AkYojQLOnz///9OnT1AediArK8ugpKSEoR+rgRoaGgQN5OPjY7hx4wZxBt69e/f/kydPoDzsAGSgoaEhVv2jYBQMLGBgAADrdxUEiGkOnQAAAABJRU5ErkJggg==`

let base64_close_tiny = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAABcSURBVDhPYxgFQwSYmZn97+rq+g/lYgCQnLm5OU55DADSICUlhdVQfHJ4ATaNZBsGA8gGUGwYDMAMItYwJihNH4DsTWQ2VJo0gM0Asg3Fp5EsQ6mesEfBQAIGBgCOnmcpbdNraQAAAABJRU5ErkJggg==`

let base64_restore_tiny = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAMAAAC6V+0/AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAbUExURdLS0lJSUk1NTaqqqszMzMHBwba2tlNTUwAAAHMRaqEAAAAJdFJOU///////////AFNPeBIAAAAJcEhZcwAADsMAAA7DAcdvqGQAAABPSURBVChTtY4xDoAwDAONCUn+/2KUOF0qNsCDqztZbZEP+VPiIHnagI60ykXhdO1IeAi76TX0MDaO7MuMLyWE6tBD2i2J/lEIltzyvcy8AQw4Cw0z6AqMAAAAAElFTkSuQmCC`

let base64_closewindow = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAARCAYAAAA7bUf6AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAADeSURBVDhPrZPLEYIwEIapI9YAXZFOAOtgsIDokQRvoA3w0AtWspLHOkMgkGH8bsnsfPzZXYK/0fcvqOsHmKMXjN3m9U3zBEIIcF55idI0gzAMYRw/83oh7pPotCvSggiG4b1eV1VS5E6ECeTzzdU6nAslksnMlSJJUiVwJrBBESbSggi6bvATICiilPo9wUUcUyXK8+KYIMvOKkFRXCbR/tQWYBOxB1KgRcJPhAK7BygqS74twj1wjREX0h7/DxS0bb/5JZ2IgFxMc6Vh7LqZwAZFi/rFz7TD4b1ZJwi+r2LJUdGyCHcAAAAASUVORK5CYII=`

let base64_view_tiny = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAMAAAC6V+0/AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAABOUExURbm6voSFhn19fn19f4SFh7e4vLi6vn1+f4WFh1hYWJaWlqioqFlZWbi5vba4u4SEhn5+f1paWl1dXbKztrKzt7Gytbq7v7a3u7GytgAAAPHCN2kAAAAadFJOU/////////////////////////////////8AFCIA2gAAAAlwSFlzAAAOwwAADsMBx2+oZAAAAJ9JREFUKFN1j+EagiAMRZmjRpBaQdre/0W7CyUr26/DgfHd63RnIB117A92OJJIADl1p5hSPPfgSgOkj/YokmqoNEJKMkysypUukF1F0fVaIMe6FNo6QQ5X+/6W9U2IlImFij3Ko3C4v3L+zj85BRGa7TChkQe1RkNr1ENSDeJ1JYu09ED4RttGG7k0+lyfvxsVSM2eO4JTLSRMj93wqk8cZBxxdvyDjwAAAABJRU5ErkJggg==`

let base64_sortby_tiny = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAASCAMAAABo+94fAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAACZUExURZKTleDi55/J7YmKi1VVVWdoaOXn67XV8AB41ImJi1xdXW5ub+Tm6rjX8s3P0r/BxOPl6rXU71xcXcrLz+bo7G5vb+Lk6Y6Pkc/Q1JSVl8rM0IuMjrfW8bbW8Njn9lel4dzp9rjW8G+w5iaL2rnX8At+1svN0CaM2wt91lCh4N3q96TL7ByH2E+g4Nrn9cTFyNLj9Was4wAAAOJ0OTgAAAAzdFJOU///////////////////////////////////////////////////////////////////AHGevY4AAAAJcEhZcwAADsMAAA7DAcdvqGQAAACmSURBVChTbc/ZEoIwDAVQkIKFKrjiLtWCouKW//840wa0jOTl3jmTSacOdE7NjksJPQpij/mBKX1ugjiMmC8Gug0t9qKYJUKMsI5/HE5iYNOZmKf2kUW0BGQIhLB5FWOwNUC6cdtPEuvZdvPuj/eZrG8fjva2UtJwXmRfPgFIdZbIeXlp374qdeN5gWpv6/2Kl3fdGsYv4TwqbrThJwW83pQ1twfgAyGtPuH1+P8tAAAAAElFTkSuQmCC`

let base64_refresh_tiny = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAMAAADzapwJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAADzUExURc/R1aanqX19fmhpaXBwcZOUlsrM0LW2uZCRk93e43Z2d1paWo2OkKiprL7Aw8LDx7CxtIuMjn1+f6SlqLi5vFxdXZiZm+Tm6ufp7ZeYmlVVVa2usausr1hYWLq8v8jJzVxcXYGBg319f9nb383O0ldXV3V1dnd3eIyMjoaHicvN0ODh5szN0aKjpoKChKmqramqrGtrbLa3ur6/wmFhYn5/gLO0t39/gI6OkJqbnePl6ru9wJWWmKKjpdLU2MDCxdDR1a6usc3N0aCgo5aWmOXn7Ojq7rGxtMTFyIeHiMzN0GdnZ8rLzmhoaWlpac3P0gAAAGom1nUAAABRdFJOU///////////////////////////////////////////////////////////////////////////////////////////////////////////AGjsqMEAAAAJcEhZcwAADsMAAA7DAcdvqGQAAADqSURBVChTbc/ZVsIwFIXhULACgYoyV4oVlKGgiGIdkEFFxQn3+z8Nyekpqyz5L5KcLxdNBXYWsogZ8YSxZ6rjfjLkVFpmstZB7lAemcgbzIViqUzXqFTt45BrTj1A3Yl72iBuSouJOjtvEbc7DEDd1nU1e26PUeV5/b5+jcDFZSBbCbQHfIwmICPPCKpcKR5e87TpZqT41udp0+BOcfLfJ+8fFJvOI49cWY4Vo/HEMzdJ019O7TEDNXPmxHh2I/7ivqpVM3LO4k3vwHtVfuidGMuE/PStL78z+v4hCBiYZ37jq+Hij8eQtwLWdKJ/Z2zyfIQAAAAASUVORK5CYII=`

let base64_undo_tiny = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAAWCAMAAAAVQ1dNAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAADJUExURZTE61yn4t3p9mas4zWU3B+I2DKS3Giu5dHj9Hq35z2Y3oG66At+1i6P24S86JjG7H235wh81YS753q251Wk4gx+1qTM7n245wR61T2X3tzo9jaU3CKJ2c3h8wt91uHr93m25j2X3cnf8xuG2ODq9heE2CuO21+p40yf32as4gF51GCp41un4met467R7zmW3dnn9qvP7jmV3SqN2lCg4Nvn9SaL2sXd8kGa3uPs9ajP72Or5Ii+6avQ7s7i9K7Q7lOj4DmV3AAAAO4U48oAAABDdFJOU////////////////////////////////////////////////////////////////////////////////////////wBBYgTvAAAACXBIWXMAAA7DAAAOwwHHb6hkAAAAw0lEQVQoU2XP1xKCMBAFUMAaiqiIgmJBxAaKvdf9/48yWQK2+5Kbk8xsIsB/BBBELFImm8sXirERma2KqpX0slapohnMamadnUDD0vGeDc2W00YCIJ0utZ7b99wBJwCfTgAy7Iz4nmUsUptMHdu15YBbGFIrzgzSI8acWxRQ+87CWv7Zas3e8pWN3/yxbX7HPvdpe+9wZOuHndRzXN6mWBfeUhPNK2+JSZHXjxtNbLdcS8KCQbubD9zwoD0J9iTpjDQAL7CsW0CRzLdWAAAAAElFTkSuQmCC`

let base64_new_tiny = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAVCAYAAACpF6WWAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAKJSURBVDhPtZRfaFJRHMd/iwhhTFDvrnuIwBXupbecYg6CRRT56nQMBmPtwbf2FPNJe9tDL6MxXAt8qRs+jcr2EpSRD0Kx9W/qUmOsqy5TV/4JXMGve367yjavMkZ94N77+/3uOd97zrnfc+B/0CU/FXn85Bmuf/oIxWIBarUaqNVq4LheuGAahMvDl9r2VXwhCEFcWXlKIlarFXieB61WC6IoQiqVgnQ6DfX6LjgcTrDbr3UcGIiZPPp8t3FqagojkQjKZUUEQcDR0VGcm7vbsR3MzHjQ4/FgPp/v3FAmFovRABYW/Mrt/f571OCogg2i0SiOjIxgOHxoZltft9HlcrWd8ppYxYE7n9t+bH5+Hm9OTzffn2C3V+EXoNFoYGhoSHHRC7U/sFHYlbNWnE4nZDMZePP2HQmTaDweA5vNxsJjIbmji7kjHlunnESZD9lI98Om/HzjB13vt+tUa+Ts2ir+OrAcBoMBCoXvFJ9kt1KpCN3d3VRo4BAykC79lrM9rgREOQLwDevkaI++vj7Jv18oJlGO46BcLlOhQfrWQHN92chIcPZ8s+ablQOZbDYLOmm3MWj6PK+HXC5HheOSTCZBr9dTTKJmi5X5jQrHYXNzE6vVKlgsFyknUfv1q10qlQpCoZCiF8/pTrWs4X4CgQCYTGboN5w+aEnmsfHxcZSm0dbkSiwvL+Pk5CR+y5eU+y0uLqHb7cZEInEkYSbIDpWWLXqYBw8f4djYGAaDwbbnAFtDr9dLI3wZft3SRnFbxhMpvL/klxyRBaPRSOdpT08PnafsL1cqFTANmmFi4gboeW2LhqJog9W1D7i2ugo7OyXJxz9Bp+OgV/qARXLL2f4zHfv+YwD+Aj1rL1q15kglAAAAAElFTkSuQmCC`

let base64_displaysettings_tiny = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAXCAMAAAA4Nk+sAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAACHUExURXZ3eFdYWFVVVVhYWHZ2dnh4eKLB25C63GtrbCuM1gN51Feg2X+y2kOW1wB41Fuh2DKP1mSm2Ad71CGH1huE1UaW1i+O1mpqa5OTk22o2VtbXISEhi+N1h6F1VCc121tb46PkhGA1HV2eJWXmjaQ12in2W1ub4aHiX6x2Wuo2VlZWWlqawAAAJKETOIAAAAtdFJOU///////////////////////////////////////////////////////////AKXvC/0AAAAJcEhZcwAADsIAAA7CARUoSoAAAACcSURBVChTxZDZDsIgFEQrdWvVa92te92X+f/vcy5QA4k+exIuw8nAAwm+8lsnDRORqkPS9I0PLUqk/hCQUhufA8z/dZurA3RjneW9/kCGTJEuRBkxRXps9YQp1FORGeYimerF0lttAqXd+Ikr+51rYCOyLXllp23H/sBRaVMKplofTxxnqy9Mtb7edFZ3PHINTj/19ZeNjrodAbwBCL1HEFt6Ru0AAAAASUVORK5CYII=`

let base64_personalise_tiny = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsIAAA7CARUoSoAAAAG5SURBVEhLYxj0oLau4X9hUfF/KJeBCUpTBCIjI/9zc3EyqKupMqSmpoENp8jgufOX/I+IiPgfEBDAUFFRzsjGxsbAy8cPlSUT9E+c8j8qKur/kSNH4N4HWQJlkgf6Jkz+HxMTi2JIXl7e/6aWNvINBmlOSUlBMWDGjBn/YWFLFmhobMYwdM+ePf9BkQflwgHRkQcy9P27Nwxz5sxhhAqBwYIFCxk8vPyhPBLBpCkzMFwKAtnZ2f/b2rvIC4Ily9cAvRqFobmjo/N/Tk4eeYaCACgJ7d+/H8WAlStXAlNFDPmGJiQk/F+2bBmKARs3bgRnCiiXdOBSMvN/Yecc6hkat/jWf5aqq//Vum+Cae/5D8AGUexS4aZrKJolWm/8z5m9n2RDUdJx7KKb/61kOaA8CPDT4GHYd+cLw4oVK1DSLyGAYvCFN/8ZDKQ4oTwI+PzzH4OMgiqURzyAG1yy9vb/2+/+MjS7S6K4bP21zwz2cqxQHokgYuHt/wwVV/7nbXwKDscJh1/991vwABx5KctukRVhYNclLrn1/+izvwxPP/9j+PmXgUGal4nBVIKZYU2iGknhSgfAwAAAXYfHYMPXKHgAAAAASUVORK5CYII=`

let base64_showmoreoptions_tiny = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAMAAAC6V+0/AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAADwUExURbS6v4qNkXp8fnt9f3l8fqqvtIC76TqW3TqW3juX3oK86YqNkF5fX5OXmp2ipp+kqJ6jp9HY4KzR8XS053Oz5XO05nS05iWL2gB41LO5vl5fYNHY34K86CSK2omMj5OWmjqX3p+jqIK76HS1556ip4zA6XOz5oG66IzA6qnP75vI7Hp8f6CkqFVVVV9fYH+Bg8zS2Xt8fpOTk9DQ0MjIyFdXV8zT2sDGzaessaioqJSUlIGEhp+jp4mMkJubm7G2vGBgYOjo6Nnh6mBhYq2zuIKEhmFiYp2hppOXm2BhYXt+gLC2u3p9f4mNkK6zuQAAAMO/nvcAAABQdFJOU/////////////////////////////////////////////////////////////////////////////////////////////////////////8AE3OmeQAAAAlwSFlzAAAOwwAADsMBx2+oZAAAAOdJREFUKFNt0dtSwjAQBuCaVoNVQEA0akWKBVQsSouHqoAcPSD87/827qaRwRn+i+zmm92bxMKGMFpbwna2gR2ZkXJXuox7+9lc/qAAFEuH5aNjJQlPTs/SJR1PnTNWLsyd4yqvVCUUvgGKpzyUM/+xpmrAJa+LwBDqyqWzoXE12bzi8/qGsHWrZT00GVLad/cGOBY6URzH3ejh0cjTM08mun951QXwBU+m2G3rArytYRzqAgQtwl5f9yvMVggH70Pu/3A0nhBiOusnSRKFwYef8z+/vtNHnvdEx7Z/HCGEs1gSbPgO4BdgRWBI+6wNvgAAAABJRU5ErkJggg==`

let base64_cmd = `data:image/png;base64,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`

let base64_icon_desktop = `data:image/png;base64,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`

let base64_icon_mycomputer = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAbCAYAAABr/T8RAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsIAAA7CARUoSoAAAANISURBVEhLzVa9ihRBEO6VM9rd8NZ38C0MBN/BxOQSERE0EQMRxMjgQAQDA0EQwcRQMPBdzDzvDXanx++nqntmFY/bROuo6er6+eqne2av/Cta8PHg0ePx5/m5FKWMZRxDSgFUIdO567ofBYlUwIk+tvEhRbNvjo/Lm9enCyW+fedk/P70mQOGsdQKtwo/rMmMpG2Evg40Yk37ABCsLS5w6LuPcf3ji/L504fFFRdix7qr4AjSnivs4GE7lgH72my1jNzLB3HSs6jU2af5gxnPrklKzM0gIHfDwGGLvWQzg9lNgtGHcmGylmiYJcykKpg+9A9yx+R0DBAmVQcEURCLGSSL5YO8kYyF2uYik6saYHw0MO24jxogPBcmEmgH4SS4lthrzJI5pdDFRFywdW4GOtqgnyfGn6t1QOuSgW21jsUQLAHZkWzho4I1Gds4Ocbo6LD6PWpnnJUm96QGTHYCdUC9uiWgbRmXHVdNgP6cFNKQebtBbdQdHF0J1Ams8zk2wMbQc4UtL5mLY5xZMUjGu6Cj041qHRPUFft2ezyqkCAMVuI562goI6H3jOt763wh3TEw52fcgenkhJBVOYFcvc6XDJvkKDb3lHn5uFf3OmNjORZ25+0dU0mjAgkC9rtsIK7JtmdBsaeN8nSd+nIPeDyVMjoOQwQYDA66HNFl6BJI02iTsa1PJFfbslvq2GRPzBxhyIBWrc7XCXTe8nOR0+nYlz7Gao2ELEzKSrs36vYBIFA4d2Du4UqfsPlcXZiAlTQLsE/KLvq3jtlyJEGwbiYDJ9UKhPYApq+Kkc5++cpYnz7B+JERRrTsjkEzIAEnWADTTr1sPZl1BGYcmiCGzt926WIiwuTIQK3j9gsiR8ouYBqkz2PcdP8O209xnCL3iul6r4kFJ/8L0BPPRhgA/Oaqg9AlsAFpjy6lywROOMVS8bJD5ncUpPQnd++PZz/O2r8tvnpw8mJ5b9XzD7JXSamc+V3bbMr7d2+j70vS85evhLKI8CcP710ap12uy9BqvS6r1boslyvxIXRQ4uUSSVdIiuQs4hC6cEQ3bt4aj46uxq5TjpnEe8G97gdot9uWb1+//BX7wo7zsuyT3oTg3CdN5f+MSvkF6XTYOpRWozQAAAAASUVORK5CYII=`

let base64_icon_documents = `data:image/png;base64,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`

let base64_icon_downloads = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADgAAAAsCAYAAAAwwXuTAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAlqSURBVGhD7VhbjFVnFV7nxgBjKW06haGxQ2mlkVr1QTFKDG2hlAJW6wz1RuIDNvpCfDJGaxuDmvhkjKUmpH3QpC8amOFSG00b076oMcY3a8N4i5Vws6EyF2bmnDnb9a3Lf9l7D9An1LiYdf5/3df3r3/vOQP9r1PDVqH3H/5a8dr5N6hfsABOqSRLoOt4HWi36a6bh+lLm7cxb8/yXk8KjYx870BxevpiDsT2jQa7FSYkoAKle6at699NL+9/4j8CZNNWOj1l4FJmamDFSGVldtsV+NW/vE6jz38f0nWnANCb86sHYAJuKQbV6YULOvHa7+g7v5yAdF0pAAQwB3RFYHXM1ECGRNcoGvStl8bFdj0pPCedp/ZZq0xxl+9BJgdAKclzailtv2r5Cjq4Y4zazbbo5HmGWT6ZTFfIm40jsE/8QJAREGIld5Sdmlxv/0fuz5RB6DyZAJTmE1G2cOXCYsMP9uomOlCIcZlo2UCH1o3cxs00JcZdsAqXdcGmylyHvSqCLrXxx+Jbl+jrW3bQV3c8Ik1YJwzwG2WAWBElCgMBATZbQWYPlMg333IT3bv5fTS3rEG9fj82wrZ09XdYsIsM4A226QFk9jQukX0//7fTdOHAN6VB65IBPpECVEAIUFg8LS6mhCy6T6+WELZsGhxcSes33kFr77iNzi7M0Nxij3NpDHLqyrGyEVHlsMenyu4j9yWVKzrNJ7HMZz7xuBTUqkwrnvp8cc/GDTTEpy7J8Q/BzHz2Gsikp6ZCPHm1N5pNuuHGG6i1YoD+1ZunNxcui48QfMU/NhX2ECDLWgJWp0tyODCRE9vZR78g2OQDtOflZ4rO0CBNLc6H0YfE/AHRE6gOdtfpius031+kriF3vexN0ElyDnmZ8FbVTLmcHYTZPY+IFWC57twnSwC3/f5wcbE7pwEs1yfFT1pYw9VX17qriBMrFvkeYIWeJ83jZkZDCkzcZY354xp9NG/ag8qymg7+50f3SyPh9+DFhTlNIowADdJpuuy6uA/+fdVJkTSGv/30Fwtq9gr69qb76eCmrbKHjt874bZk/iZLHc6b9uBgYw8qpzng7xQAuoMmNdma9gSxkNnB4hMbzcBLHkyvoNsHVtHYyHvosfXvpaHWcrbZNBN/zyGy9+Cy7cXHai7VJ/ZOCcDEoSwLV5MIi2+qK8kojq4ASCoxMWCAlmklQPQZSnNgXyPDtcaeHq5TAJifXgyCrIGJXXzMFk7Pfdxfrwp0AoLZKU6H/VjWW2PxljfmUznrwWsn9txf64DyCS4BDF2EJNZcDjqxLyFLDl1EDpNLavrB6B66PIfL5b6qQGuvqPgnThBUn4GRK6QJgs7seaF0r7LTlXxcji+TaE+vs8jm43LcWyGm2gl60uxE/Vr4BJOrWT3BKKc2qSPsPlV/l1Ng0V6nU9nreF9O+QSTgCjX6XS/JLAAvmTzWnZYwT/4XSsw39ccLvLjwygDmI9cg/RE4GEJMp+SnACLhSM7Yas+7u850j2zH4T1EH18j0QW49d36Ql6oAUEWXXx/uPUqvYgw0/YdB6HGs7l+BADwfaw21WuHkScdGWCZnMqAYxAlk6astm9Qf461u/xVzIwvprhd13i5xTiOQbfaNK4PuLM7s998IfOc7m+9tZc8RlUBz3FRA6cyKkPZ0eDH7pxDW1auZqKhZ42Lb/QDSjqeC05EI2B773vWE2bVw9R0fUY+Hk930d56VukOqcSQDbWfJPIJ6d20bGvFmKZm9q48iZ6fuujdGTbXnpw6HZuvJuARBFlaZ4T9HuL4rN7eISOPzxKP3nw43Tn4KrS5Eo9JDbXeQ+RayboL5OYoO5+l30SO4M9d3mG/jk3S51mi57+6C7afitA2iQ5GbsqB3A9epjBPX3fTmrxXxcXLs/S+dnZPG/Yu1zuIfWJslN1gsxVYCaXk4b7r/xmt0ufeekoNzpDnVaLfnjfHnpo7QhfOwbDz5aTPJ8Mbte69XTogV0C7tzsDO198Ri9BV9uy2uEq+gD4Pjq9QSrLL2zr1PpJZM61ySQK8n7ij8z/lOp0aJTM1P06V8c5UnMUBuTfGAP7WQg/W5P48AMbs87N9Az23ezT5POzEzT6MlxmuS1YFkek3INlx2oMPbOqczORtkEdXLuzFyZmMmlInKi3JT8Idtq0+TlafrUzzFJva6HdjxCO0fuskpEuzdspEMPfYxa7I/Jjb0wQX9m36LZlkPCBPPnSmvW3SzvuezvFHYjLx6Gja34YbWscK7q5BWd2UBaABXlCvLE7lw+SD/dNUpDKwbFQ/0iYcpjJydokldqMzg+DJy5peUPrYMPabysS2TtxWxM/cc/J9hKzyBYG83lVHcVO4DiumKS3PhjPxsXIGzK6Cyu5YlxvtJsa3U4xibHNsmTTCw+c7GO6+KtizbcNKfSM1hKUHcVxZbqbB+us61IzRM5NT1Ne0/ydcWUUIdZnrnjR2lymsGxjxwKYpBDaiIeeVy2PbMDg0N8ZNxmMm6bUWWC8bRcF2VJGmTT2dWUIuEbib415fcZ209dukRjx47Q6akp+sfUJRqdOEJ/muIXChrxOFxrMHepQJmtRrkPcF2fyRMXKGjWnXiW3dRZVzWJjAQGJOhkZR/YwECDBg2c6KVZ3rANuiYzW/QK43nDG5P3ckhoxV5SMlX4eA1ZZYk1RcCP2iv0xc+KIViHjzvAmCBLKqssuQxfMAPbcssaOvjBLfzqj4cRiBWqCiVNZhJVg7p8AE/++jf0ytkLBjI91HIP+FQdPkMupzLAtceekw7cEQnzZKoLPrKajEktLtJ3P/Bh2nf3Peorn1W6mv5Hf/gjfeVXv00AaotloFelMsA1EwlAgMMiQg402BOdxDHA4c5y2veuu6klwNXB/UB+ILqPJD4MZoEP6sevn6Iz810uUZ4gPq8RHKgM8Nbx54qlTiuVywVlZU6fNXke5SUBHzEHv+qBcQ2sAIPn0Z4//M+3hFgPb5sMYHyL9qSaFhUg2kjkVFY7MAUdGsep4yXRXkb9zjIqnFkm5qIzEPR9k2Fzn/T3oddxejswG3ybnALA9uQb+oqvBcZgbCJ19j7AMfdlCpgAvyGx8jT6vuJrmExH5fC1LN3L1NCS5kuJS10TAdzQ3/9qUulghr98oJhq4+tSQpLZ3JIqABeIQQYjDkBWkZR87y66JJukDdZBncNjSkpkeyfTre516cyzP6iE/5/+O4no31/3aYHFytWaAAAAAElFTkSuQmCC`

let base64_icon_pictures = `data:image/png;base64,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`

let base64_icon_music = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADYAAAArCAYAAAAzDXuYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsIAAA7CARUoSoAAAAm4SURBVGhD3VldiF1XFV73Z+7cuTOTSWJMm4Qak9JowYcI9sUSxArqmyI+NEZb0EYfBEGE4IO1rdUnDa1tpBBffCkipWIVCbSFUpWgEZSW2Gpao5ImJtME+zOZzNy5P65vfWvtvc+ZybRvKV3Dumvttdbe+/vO2ufecxJ5t0rDrbx4/0fGC2dfUG8s43FDP1XdjmJcxMZjVHLcaE3Kx396Nq31ThAD89y3d437r51fRQg6inFBJHKM5zEuwKd/9t93BMEmPvqvXVBQTSMBcMkC9Ch8za9Sr1Uduv/bO3foJbj2YsQMVB28psIfQ23sRKK+VhP+r++44ZqTM2IZuGoCG+BdSyIFodB8caBN+dWXdl9TckZsNTCCqyu7Uqtz0rgwZWeHSuuJg3uvGTm70X9/10b9bvAvAQfLLwV00+Oq6JR9iUSsYnM85k+0J+X663bqCPOKGqxhNRgDQfYjDok5+BgVMVoL2wcs8pcWrsidjx6zAvt49q7N47Sxg2cXsIlb99ckXauBnduwRT605xbpIDYaaZz1kGyp9HOMjms25uiPUT1A6/Li/CX51E9+3rDVnvnKe5xYBpcJwGJqHlvuKt3rdmfkfTtukh1bd8ro8psyHgxSTsxCWA9h3C3iDGbfhLWlRK6aMdry/nuPOLGD14+333CzzMxt0YTediNONEDqZItqJVaLAVSz0ZLp3pxM6vEbLy/L6Mpiqicx1pEcrI8R11hJJPKUHK/TqEqu2nXfQyR24cjt4829aQW0RBC+eQZfjxEIjivWS3XDoYz0W8O2sC8bpPO85uatSnhJhpcXUKHCdRJ4rGMWHwbN5q4pqMH2askiy+7vPcjQyiP7x+NlXGEC4LcbfX5h0MdKdu+Z73Gvq/huDbBadHiop2DboR/p41db+ufPyJVTJ1VfkMHFef9mCHS0nJ/lqgQL8Zly4/0PkFj/wc/ke8yutANCqX/FV/JmY4ya7Oc1CAYxkFoajGT3PQ/b1qUM33xdFv9+UhaV5PK/TytJLdZ5JrZeKR6/qrD6pu8fbvgPdAAqFIsEKeQsX5BKqjXWvVI17jHMB7E+ftjWkNbsnMzecqtcd+CgbP3iV2XY6ig3dDkuaF4XYyr8UjMWKITE1iAVPq4SfZ1U1pmPhXIsb1CN4cd/MMRO60t35y7ZsO8TMgAx1Vg/CATw+h6IlSQhuWNQXOUaEYIt46olKY9bnc6n9XzZtbUbtkp6N+6x7vKhWufaGlwvg1+txEOF8BNA6sB9zHNdy9kC4Ue8CqDMgRj0bUm7LSsgFl0bBXiuHXtk5Tj2AA5I6lj6AijB1vUtSeV43ghjgng7gsbi2MZR5INCJhEks5ak4deIAYCRiyIs6CAjH4tX4x6rxLlJbIRYfKO98ucT8rvDP5RTTz0lC/Pz9rhVEWVWPpAHFhLI69Y1E+Q+JFYB6prGOhGgzK/XYtHwYX2jqEmWcUhTfwcWT5+WU798XJ6++7vy5N33yPOPPS4XX3pZhisrsrIYv6cEmgj5+iXBsEmlZTHbBx8JhA2wgBMoAfrC3BTj0i9y5RzLM+5bSbPZlOlOV+a607JpalpabyzIK888K8cP/1iePPQd+cuRo/p41ub6CjRAj+xei/VKcmV3mbd97DOBUFXfjk0aO3HVHCtsbW7yfeOIxVFs6t+E/lZ12x3pTUzK7OSUk5wRpSld1WazbZWxloE2onm9rLEPyaKW+6ig2MhVJnnX0lg16tzPttzQAVRqsA2vYUMfdtrNlpKbkI6Sw0NzV3VKtafaUdItATHtloPFmgRNHWpuCOtqPwuW4/4QEgMJDfI+CtWUFRYx98urWSXFfM5VldJQctoV1ZYeubZ2ByTRxbbalo6Rj/vFiIzpk4jHkXdNBDUHCyExgHFNZLxjqUPQ5BdzylwQTjmQjovADXm04Te1oqUWJNtGFLaB+0t9klKgWpcJVTuVNedAFOK7gVCAhQQwWoyrBHVa+F6T/ELTDY28raGS8ux0jINI1gI0yDlBI2BdorJ7zEf3IPaZNk6bOhHoOjE7kmWN50GIytcVPtSinmKkUo0DNmCu5djyThTAa/lM0tdRhXjHCnJmsbn6RRfNGrhyrI6NoVhUnwnV733wZtl24IDs/tY3ZdfXvybvve1j0uhOodhrlVAJ0ABlcFQC5n3EsZGr5WOcu1wcRWykHwY0g6fymKoPRW34Ns6+dUft1s9+Trbv3y8zH9gjExvnZGr7Ntn+ydvkw4e+ga1MUkcNMMgRPAli7GpAo0atxZSMH7k8FzHkuQ6ExAAOJIKQjo1MjIs4bNnVUBy5uY/eKnN792LJVdLZMGsWFy9IJRIFeCPg48p9ZTESKMlHbdlxCD9VAqD5DpydYi7Fo04XiDp0a6D+ln37rG49wRw82Bo41wCbQRKoKcAbAYyjBiSyRpxk60fR1EmAjI5zPMh4TeScJLrV3LRZWr2e5dcTXIgMwrUcA2gcLScReR41aOQ4N44giVY6xisfRAI0hCQgjAfBqLcvDB0MvP6tZLgytDnV41h00EGHb8BrnTHfSdYvAMYQdsxQBhGI+4hpIBNizoyO7ZhancjlVy/KsN9HZl3533/O6RwcY4B2ckl5xTMhAoWWpGjzON1fVlf+QDvYejfCVrqnQeYQi3rVlYGc+cNxq7uaLOmT/JkTJ3WaPzI54ABddjHI8F7jOB85KHwfo9birIU4MQiBgkx0g4QYIxG3nseFwBh/LX2wffk3x+TVf7xkdXUZLPfl+NFfiKzg4IEY1gAgHkPrINRitAE4yFmsJBTj0moc4kcxQFNonZQNgmDYiNHir61dmNTlTjx0VJ577Al5/dx5eztevrwo//rjX+XYfQ/LG/88aw+7qzqm8/nWjDF8xPB0ko8YgLOr8OtKUrEeUanM/+DLYwRAkAu6b5abMZZ91rEG34r6nSBLg6Es9gey0F+RJbXaHG2uvoQ09fVkoivdiSl9gu/o+xbI8WXSAPl6BBYYssUFBXk7KUBsHyrJ4FLHZR/J/ke+wH8wHSgAiKUwSeuwYEyJFcI3a2uxFv//1dSlOvrKMaUvj3OTPdnYm5VN0xtkk9o5fYnsdUBqgi+R1rEgRNAlKbtYhU2dMl87B+vx0Diuff/3SyP2p3NLSo6wIeSeicBZ6xhmH//b0rT7rNNqa2f07Vhf/6e1Sz1VvEzipbLdnLDXEmyL9UwBSsclqbjv8hjHFsAJnseSmsZa29cG/e3ShYTK5IHbPz+eaQzU46LclJtjU8YJJHIAYDVeFzF7oi/zRgTXkNbW0Rytxrw24rFHGlus7uuF9RgE/8ez3BjJo0/fmzi9C0Xk/91r/adGQBPaAAAAAElFTkSuQmCC`

let base64_icon_videos = `data:image/png;base64,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`

let base64_icon_settings = `data:image/png;base64,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`

let base64_icon_help = `data:image/png;base64,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`

let base64_icon_taskmgr = `data:image/png;base64,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`

let base64_icon_taskmgr_tiny = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAQCAYAAAAS7Y8mAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAKwSURBVDhPtVTLaxNhEP/tZp/JpkmaNG1qUpu2qS1isaBFD6KeFA/izYPipajgRS/ePPbP8OZNETyUIvhA6eNQT1pvIvQhaAqFpqaSTfbhzLe7cateO7vzPX4z85v5Hnw4LJG4ebvy0W87HQGw+PTxL0kSfJ9mpAIPe5YIJxfqBcAh0BQVly+cZhhYeLfqnzk5yVaeipYNMZ6Y/Bfsokurn3Dt0jlJ5onrOmEFIRk1ixstHggNaonG4Uj4/1GOYe2EKw+IHVeEdD/yuf58B0ubrW7QQSIPa9ttrNU7f+E+FenGiKliQrsEnyloaiiNuZVf3YBIqSEFljdtLHwhO8UHMNtDLhJB7FCWeOBGo4NiTkculxQELJE90u9ND193vYBVrDNoXSdGzOXHgzYbLvozOoYKJl6v27TktsACe5Bkh/LV7ditCfXgVlCWyIG1vu8hk1SQ79Gw7iXx6IOLOy9/igCuiwlsit9zZEp4MJbPiyXYCiLe2nPRsGlpFFhvSdDUBFJGAtPVDGbGshgoWrg9vxsQ0PeDfIb7TNycb+Lqs11shQkcN3YrPM/F7KuWcOKT/kmVaIoEXZEFed5SMVlOY9s30Gh5pD4UTcVE2cKVmRImxvrwcNHGgzf78FwuLrbH0yMZHB/pxf33bYwOZYlYhiJLUBMyDD2BHlNBf1bH8paNueUmCmmNkirIpVRUCgaman0w8rl/97iW1zBVMnH34iBODBgYNGUUDQlFHeinfjAl4+ywhRffqNLxEs7X0ihbMipWAiNZBccKKsYLmtjWLjFPqmkZtUwCY9QfTUkoJ4EB3UfJAErUV0xgslfBrVN5jOcUjPbIKBN2hPwqpoQqJakSFlUs3orHT576zX2+7PSo0NyjQwjeCkZC4XE4j2yR8Dh6sKyUhXuzNwTvIQjwGz6Qwy+snqJaAAAAAElFTkSuQmCC`

let base64_icon_recyclebin = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAC4AAAA2CAYAAAC4PKvBAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAA1oSURBVGhD5VlrjF1VFV7nce9Mp51HO4U+Ut4EsEApbeQMBrGgiDHBBHlIgegfEjQxwaCJRn8ZExMTTTSGH0Q0gQjxD6BFhYCARYz3AK2EKVgLhNZ2yrTTebTTua/z8vvWPufMuefeaQo/RON359xzzj5rr/Xttddae5878r8KKz134DfPv1qLLVcsq+fj/xiSJBFbYrnj+q1jaVMOOz3nePzFXbUgCNkrbfnokCSRtNoteWLn7lralKOD+B/+tqfWDgK9TpJYzx8pEgsELWm22vIUuKWtipz4c6/tqzVbLUkYPersjzZMDEAk5dIGt+d27c3JK3GSrjda5pZ8yf2/wONJnNDpYjPXLFvq9UD+tPttJa9uPTg5VXPdqgolUYRB8sNJ0sfpvbnSPyoyDUgdKkkk1pzgFRvxbUOGZ/MHFL5Vljot9DeWeGazWqRS+DCKQrQl4oC0ksfTIAzksgs2jKncvv2HassGlqHZkjCGioh90dtx+VitcfTGGE+xQAQAUShWJUDKR6UwFIoZeTanE2j6Q7/FK8jwhIPOiGGDuqiTUOJwpG07oOLwgTSbC3LN5o1jGiqtAF4m2bQDjaoFTlWEg4PhB8/1oHo1mBmCKPpTjkOKwVKdTbECYZXDmdr4QJ/RFAQX5fDBoHTe+YwWaISaoxgeN4JKvN6K4GmKYtTpAOhRQxIfnnlAAY1GZMDn0BHrwHANY3yWRof5Si/oSfY3hGEHHbQPFMa0iXbzMW10Ihphh95QJXpPXY22XhjiJ1oogdDEgWmUZkRxT+9xSBSPUlaUy/TxZpEw1PGs3s8IG5uJpVLdhNFAR+lg4NGYs0udOoXGhJFh6MTSCE2jEl9ohfA4PUmihiS/qIRxryTxpYRJhsYLYaEVKDWslyqekjOdtB1dzEzqh4LmytJB4hay7KsOohy5cCCqRBVJsxgqC20QoDC1a1eTdKpER8NHUMKwoDISxlPtQgUZ6HAjbpKPYaGG2U7DBuxj9BvC1MVWLQBGWJ1IS/oEutQqHHPX9Vfq8q/E79q2aYzBrX0oiF6RxfvF5NPYw00HYZ4piwbOWBtJzlyhAR4h3EsCAQ5sIvIZjWCItkhalJRxlM422whcU8Zcsx+bOF8GSpzQKQctyqo3cKEG+DBNPPUeG6gkjeMIRtsgudCIkCuRzOF8vBXLbDuR40idOaxrc23kURMyQYypNuSysDAhZewSHIYOArrVprbxiw7ihUE+f2/s21/rX7YMV5ZEcJUOBLXVwkJCsqYz/tLOvKfiNmLuvemm/HTnEW9ynpszPBgYkGTNepXLYScy6FpyzwWxf8VIIlWUZU1PylNvykSdCndqDQ9DsR1bHMdRDy/U63KDd/liqBBtrpiYSzNGTiOuQFKniA2mWU+sMvQKw2GhGcmPXpj0agcWZP9MS/bP4jg8JweOt+VAw1o8FmzZc9ySH4zb3hxmg6FF/dSn3qcdHpxdnVm6hQLmAduCgstz4qzlJENNnDicgEwz/jh1NFaQacPBuyfq8vqhukrnoMzU0fSmE9OBJb+dsD2MF+RTx4CQhgfIMs4JhlOcjYhRgO8WkyRFTny+GSKmTULyscYdOqnXlTDboCetx0y8Bvbtj+6a9hbVLaJycl5Wu+zRjR0TjhxD7J/EwA/V6X2ShJZUkS5wapD1i83kwfxY1JcTZ+IowfSeIGmGRc96DNk9kw15HR7vhU9fPCi3ncVa0o1ZJOsv33W8741XvN9POF7IVINhEtaSCAOcAXJJQ18Hsv26LfmbUE789k9eNpaglNGfmiCqCAz14EwY0qYeI2HxOXwi8AYqueoc/UjC2zYN+9vWJv66/qIrFvHCUVvG50SuWR35VEwH88t8EBraQKSDorcKyIkTZklX6il5nDPuWrYMYSYOO37u4mH/V3ec639x04gUB3DDRUOybrgig2i79Wwq6o31yxJZi0O5IQQJ8lWvw0amkYzK6CCumYyYoFMpzCTWM5/pB3epVxg6FceSM4eqcu/VZ/i/uP1c/+ZNw7JqwJU7tqz0KyhjeNuWkSp2x5DvBW9VLFVUEVRKGjI5pR8D3fdnOKXH03JoEtR0Z8bntDECXSERuk2UtDrujyFeOdA1g658bWy1/8j2c/x1uLYh/+h7tvfDPQ4GXiCQgs8/MRr6KOcAHVEYHL2P2+xFhjhlqLRQ8HUryV4K+hshgts2Vrw6Lk5gNXxvIZEnDjne/btt786/ut4rM45HM/1VW4aWYcGAVhvHl8+L/Ac/3vbvPjuQ81fEgtDPsb4/lnMGuJ+ES4qkCb0lc91v4jIR1I4OdLjiGX9Pbc3KIW3l6slRxnhtiixHDjcS+csRx3vxqCV7kVRaCVJce0Ys39kY+suddG+jHwwYxpg3mBzhNvoIFqKXpizvlWlXtq4K5e6zQ7+qcYKBomMWGVrXsXLaCMWKXWGLHJuvyy2f2txdVYg6LHCFInPdEOGSyTIPLz/4T8d7YJ8le+bwelcgTbw+a6OmYzDoxNmhs7QjZswFsT47luUOPRzL9rMi/8ebm/72DQGqCV8MEvnXXCjHsZfJFkYuRJZWLzABQ85IcfEhOhkAr/3j3ZrlVCVk2Gh5xCAsV05ixfsjVrwH3ukYa47vXtKWbWfEPvcgBH1u/vChA9JwIDmuI1io5SC2BzvePOHtfHdB7tw6oiW0D142r2GRuIgt16nAgZFs23JJx69ZXSyMl2mRB27wRwLM+JemjEwvvHzMFf7AoS8okNXqowduU9LUTdLclP3s5Snvmzve955/5yT6JLJjzxy8zvDUoaZhk9KjkhK6iWtyQjt6Up4rJyvJ+KzI+PHe3iZ2zVhIbpiErJY19GWlyElzHYDa8fcb3n2/m/R2poQzzDUTeWbvvGcGzr+MPGYcG8AyuokzTlkWaRiGGPMk/vQkK0c3+pGQDJMtqMnjJ2zdtxQJExGKPkPjnbotZ430+aMr0ngq4dm3T2IHCPsgzWQldPaL9TxFF3FdPTFKLvEK3GZJ0wvXjoZy6WDof+PCln/lUOjr+2cBQWShjFry+ETFe+xgxbNcW26+bCR92gktjezOcGFyKmGzhyqji3gdOz6NTfRRcXzZ8N5N6yK/PG4HVq7oW5CJmaZ3cKYhh5FszP6MO0k3QPqJQ6738IGK8D1jf92R9WuGZGhoQKSKZbVwfH7jSqmg+rGSKAECXJrlIg6UuciTL79RWzO8XK/bYaAhE6GWcgv6/beq3t9nC9M8cwzFeTK9ESwwljz0pQ0+V1GqJuknJ1zv1yDd7bNOrKok8vNNDX9VH/ZBcYBFzNJfr2wQmJpvyq2FGk50edyMDl7DN8OUs2Shcx+GeDtqbz5ShtI0iJfAUGOfJkj/7jRJEzetD2SwD4TASPMDf8bx2KiVSBNdxLdft3mMr2ScbjWosQ4vgPFFK0SuHE4zfG4Gta17v80wizDNT7/veo+cJulV1UQ+eybWACxW9LA6J2OW5VoJXcQN6HHTgYZZWbjD64fiWzaEvs0F4tgpijqwvj/CC/Hp0Bb5wroQW+BEw0NzMufKf6T0Rk/iWd3kYLUjvzB9Lo6PLY/k8gQh0qO2Evw5mHJbVsb+/Re2sG1dyrTBKLx941ruWbBG57Fpmb0L2Gk57IGexCmbm9Oabu5YXfrdRO69tOKfP1qVFRW780CMch/OVbsPmr3R2P/WRWFOngNagbxdAR081iIRv35+W5jLDksfOcIWLyWBAnpuCeIU6cIz/nhtAOWJm6aQnsXwbZe7NNWrW0xuc3XlM3+s/NhQ2VLF/qLC30ygmQtPA7KvTNveT/ZV5fKRWO67MPS56TIzg4Hiugr99DYdHiJv+K7l2g72KejfasuNY+a3lCJ6epykCB05CDFdqJTg9FXhoeVVC1XAlsF+7MFxDPY7aLNz0oSDnMD2XK4eTfxvY3UdwtiHKzHiWeDlRJbjgBolnYEOoJepg2HCbUQvLEHcvKJRDWMtny6e0ksOgC8MxUO9lpLOQPKM3zGQ/+p5bXibXmYiUrZTPlv4zP9XzYNW4SeJIkpmFrFz994at7QhFyEOANtLM4oPADN2c6mD5k966ch7AYkZwR4rmMMlFJ2u29q5nc2A8fdGns1MEp70+wOiME46UUmfQhEXG/UNVyFAw2YJLElcJ0iNZbbwTaUf5iiifF/gZiHz1S6+SKx3kBiU1eR4/rW3aq7jSBCYd88oCvS/Xz1B49RUOGeXuYW8oQC2EWkfvgvwjYe/0FZgm++911+1sWeolFXleO7VN2sV15UA5Wn+6BEJ2o30CVAkkyE1vhQYKln0Efl9qV+lv1+GV6/DaxtsB4F85qpLP2CMo4ZTc2N2CrU7UEX54aRHua14Xzqc0vP8vtTO38QXZo/CNP81uLQnliTOX2JPTEMBNlwuFp8PfaA69LwutpXa+U/Z+Zkp/Z1nKWST3hNPPfvnmp1meI5sejNkTsnayvdFZH3LOopIn8Vw2E03busZJsRS3RUPPfyYoVE0Zlo624hyexFlmTKKugoy93zlzqxnF5YMlQ5kSnuBzzJjRcNF+bJMGdmz7HwaODXxzEhGiEfWViSSHcW2Xs8zZNfFtv8PiPwbQw+t6A4YUd0AAAAASUVORK5CYII=`

let base64_icon_explorer = `data:image/png;base64,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`

let base64_icon_fileexplorer = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACMAAAAjCAYAAAAe2bNZAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsIAAA7CARUoSoAAAARrSURBVFhH7VbPaxVXFD7zovlBYhOM0mJBpFp3LYLdFDSStFAVW5QiaBcu3RT/DRdduLLgolAobVcVCt0IQpBu2i4s1V1BJE9DA6WLvOTFl/fmzVy/79xz592ZTGKEbAo5vuP5ec/57r1nZiK7tEuvSYlJaX4/6VzaMmtzahyckcMXfi3W7SRp0e0CCdSYel8OX3q844Aa/O91gJDy5cfyfP6aM3PHSHe38K04t0Olky3OS3uAtZX1o2/o7U/lyPlf/NIn34jLcuzYEl5F49PvyJvH52R4bD+sDMzFFSn9ge4gHX2UEZPgX1tekonZPz2Y326JW+1gGddtAejgoaNy7L0ZmZx+C3VXwC+wAE11mwTChtTB2pwFKUnUGTNgRSPmOklO3vdg/vvjSzd96F2fVCpMjncCuw8A6b9Q00GuFjYu9MhfirNmsCm8npyc92Dcwk0nvSV1lorpvZEJxmS+PshRacWLdZF/g6/qJ/lY8sGDRJ8m6T5DnzZ2vQoJpuzDzsH0Z2vQwRnusnT8BBl0k6V4ja+qBxvkwWTcrTmryVvqYaexr6JTxnocL9kBTDUpllvqdjIb4jX+UjzmDHtCPsiDqSYFvc5X0qOTKcU5BxV/HFcmYAOS84mMwVQX1Dap6pUTKOLcadAjv50kAQTeeDJ1C2N90/hmJ2D+OJdN8RJ0fC+BVVfbAyJF1+RRez0UiPQ6nxap8ce1CMJY8wsAHpTaYFJ0Tdt8Mkq+mhMIfpXWmM1MD3bQ1SaDomuiMxQzrtNLPltT8vvi8RXwahyHlFJt+AlQQdLnB9i/gR9d5BbxY1HuirrDz+ElnGMNh87HXHgrh90XOiXyzJfo+lwaDTBt9Yf8UI+m9+8989Q+B48+Yxdq+PnCOb5NvTSXVjuVlXZPMgXEGMM+p1gD5j+1GaNMchlC9YmxRPaNi4zscbBtHUHpWqZ7fXi2aWD+usAKluB3v97L5O9mW+6+OCc/rF+W1WyMqYghB3EWYV7V5geWoOmn/UajLdcP/CQ3jt2T8REnexq+DzK0HnXy8NyifZvUgfszxBnusrXak+/an8udtWsKRBtkuG+cUG6yzla9T9vzcndEvlr8Qr5+8pGkKeJhljhD4GKGQLXvmQzF1jqp/Nw7Dx9BhEb1AMq8ESzB3X5+Sbq9voKBcwBCBzsGYyAoebwcWu5iJR21wvU8iL3itFCzhRPq9wGGfjY3VlD2OfAz8/BjXjY1BJx0upks/NOR04s/qq1zgRNKfp/Hnxv4M2Ib5PaOSOfoCV2rNbDB5uxVmRpPZAhPmO/HRH8Io5+0bIAfzrEjNSwCmHWAWerIqSbB+GKMB2BVezDAFqO0IdaY2c/mrsjkhBRDrL3tRsbOtqMBNqdnHl/lqKOhVLtWt9xNrktr6wD7F52+7MJAg6KnCayALMhJL4qBsbu4sOtXwAZ/jSzyQu2IfS8wSMF0Jz5UMOVXeChGrinM3MjPJ6YADo51ZV6Zfj6oD5ifg3T/OcLYpf8DibwE200lzEiETAUAAAAASUVORK5CYII=`

let base64_icon_explorer_tiny = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAQCAYAAAD52jQlAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAHASURBVDhPtVS7TgJBFL2zaCRKQhBijIm9CWiMfoC1JX9BZa+NP+An+AEWVlb+gAVW2mhvY+EjIAECu7PjuXfuLLuEhkQnnL2vM2fuzOxC/zEMPyYvF27l45aMHVDqiBxAFJGtnVL5+Fo4y4xIHsNXogSCKQRTA9FIfPN5T6OnM1limeE7fWy7qN/NOmTLHXOZfedgOdSYOakQPJdhqkdk9i6pur1vRHTw0HbxVxdEPykImmiNKrsnVK434a8il6AIOICs98XG+A1pvNWhSqPlReP3O1eiAUnkQApIp8DYW55MOJOUbY4TgNyo0aGNetPImZrI4pJ6UP+eIWH0vaiLYRkQd7xQDiG27GNRDBH1W8IkJghUhNQWhDjO5USMMQFfzk1FZasqIFBiZlUo1CwEQo3FJGbRfKcygQk6ORMIMQsrWCQfh5zYRdsvEHN+iOdz3J1A48L25VXRgkwOXWpOgMlh25lYLpYdLLwoFQtnFBbJ/JCfq4fF8526ZIi70veRyYHEtnApnNe6AL7W7XSCRn2n8vL3nq+cfbtBoz/4mni12efJvvzJCF9j9aUv+YQNlWoHtH54Tps7LdH840H0C+Q4tfYe74dZAAAAAElFTkSuQmCC`

let base64_icon_notepad = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAqCAYAAADS4VmSAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAATvSURBVFhHzVZNaFxVFD4zybyZ1E4msYKCG/GPLkRQ8KckoVHbtFgJuGhRqq2IEEQXKiIuimA3dVEXbhS78KcQqSgUpLQuurHgQrARsirYRclCosSYaUzSJnae53znnnfvffMj1Ff0vLlz7vfd7/y8e9+bhP6XNjP3a3rXu5+l59k7CiZY+Jm53yJe7HpixErOR3bL2x+nzSvr1KgltPDeVKbpxotdT4xYRhy5uJpeaaWUpikd+ehTxxK9NXWQOSJeoaPHjjuW6PWXngOPFfYffDINXuzVF55FHln+8PMTSrJNPb8P2oE+oqMP3IraZfmS4mvXWtTiVRnVJBEaJhjJwFccy2UdZzFJsKYxqkkq7TErGy164/w82kcDq1zcFmU8M7kLTeweH2HMCfleeHNo75MTaGLn2DZg1at/evcTaOLxkUeArfHJicfQxPZtDzk9D75W/mpJaT2CQxeWhWdzCQOPD4LUQ9UDK6VeWCfJNEKY9tijt5ewAxrot9OwcbicD7fX1n0M89CoB87WdIR6MTTgE5jIAtULhoZ3TbEl8bp8jnB4fcxlDchczll8zyBoeDjfKWk4B7aYrEnftJg/Ar7NLCgY3bHG+RjDvkCErWn2liNrAIR1mgl8ok7Yxxjvh+pjnHHckXFieAvenF1UKAK4lE58c4YWFpeE/dc2PNSgPTvHJT2bNIBvOj52R/e3oKjiYn8sNdtryNmwdXkLUtoyPARBETbcGGyvgb12R/DaTwtCy75gaxhkHjPBCuBl1hPzVFilDOc07L8Yv9MdAUTB9nQafGHNafnTplds+dT7t8JrbC6mR+CezFikgT6Bw/xjFCYRPtRD43yIQ85w1gDTTKgXPgwOA4ChYex8qMnjtpgst3oxPAOv/DgPbKT4k2fO0iI/vUVYgx/CHdv5LyvPwxpf7bg3fg3lQtd8FVVcrNm8HO2QHbmYew2tCfWCb+Yfj6KsMVh3+V0N3Kiu4QimfviF14Rmcz7CLkg8ZsCqASMa4yON+hDrR/HJXVtzR8Cj/WHyAeIFR9vpBn+Ug0a9acLh9RzA5o5ACGuk82sFjquHnM074pxW1+MaWQMQ5Tr2QQFnGuexO+F6Nmeer2j3onUdYngGXvx+DtjEMjt99jta4qe3CBus12l05GHkRnEh2Z/ac58+A1GnfAkuqrjY5eXleHf4S2qI+SMwAa+IH+Ifj6KsXt+MwqiBG1UvhiM4cO6SUtKdLDgPDJ1f64n5S6H6bli8TL6dvN+OgBeEcz7CfAnOdig3j7Bcgp0P1+MYrsEasfYjcKM9KB66Fjed6d1fTDxb4KyGYR1RAyoIkkSDNXwhAe7OEub1bvegUZ/PF8ZkDSSlkhNYYmsqd2cy58VOSTti1hr2Gs1dLePx0wb2DTS5Cbs7H2TzCDuNP2ffdBgDDI3l9es1rnpw859oAG3Mzs6mzab+59qSf3kCE66ThXxe02utXC5TX18f9ff30+joKO8926WfL6Tl6qaoeLckvZL3WjOTBkpy5BtrdPdW90s4/c5+Kl1bp1qtRtVqFSM/N9xt/k9rMpIkoUqlwrWu0teHD6Ah7MD7EwPp2oZ0De6Gmux5P992o1qil0+v6hF8uf+29OqK/F5Dc0NNHn4Z1U112js9rw38fnEmPXf4KVpfLe4PUDeTgslNgzR26BRtuedB1P8PjehvL6od5/4tIjsAAAAASUVORK5CYII=`

let base64_icon_edge = `data:image/png;base64,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`

let base64_icon_edge_tiny = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAPCSURBVEhLtZRPbFRFHMe/M++9fftsayGkKIhoTSABq9aQ4EEu3kXjnwsknky8YBpPJB56Qi8kJmA8cfYiiRpj4kkjB4nxX2wDAYVUUKF26Za2u/v2/Z0ZvzO7+9K1lRu/Znbmzfzm8/s7xf0S0Z+3lGO/rJkb3S4y/hmUMKKA9DKEQYa9kcT5Jw//7/0tD47/nJhrnQxKdAnLHdAqapHC8xR8L0HgdxGFLWyraXy677VNHNmfKzlywUJzmtT8EtDGuKFQuLko7R5gjOeM5aKFlxfOcWdYhsDPX+ia1CiGTZApCUvpbckT7hjN0dPLizptKmR5QLhCSO/fWHxvCF6Bj/9YmMzdFMRoFHmBYt3CrLc5d5TTs95KWUCVBkIYwn3kZQCtC7zVmKngVW4OfUtfVYblS1cQ31qkooLUJTOSozYeYuzQPtR2BE7XZwEDGaNea2EkbGI0uoso4Mz1gfrjeGd8VjiPX/2uazIWa+Gbn9BqBTAT+yF3HYTcMwX5yBRUuAurFxfQmlu0WWeYOQIWULKwgrm33ksWWKscf+SXnXEH/v1OjJs//AY9shsmHIXxQp6EMH4E1MeB0QmEOyeRNUp0rt6BMDGKgsUt24SxBiZD2i2RZj66qS16H7xyexWlP0ZfPBhNn3hmc6m5VnGM7bcWsHjysFh+/6jYU9YISuGzGwQ9l2oZZdahri0w806jFTgrfEJZNB46qOLMYZIE6tfvcf2Dl6paXDzxgkDSoQtrbIwm00C4acPTK6wJIygzp+fA7dXEWbNWnWULt+trlzBWH3GKG6VWbxPInNqobVsWds1ImeMIDzgdB7YKFmY97nnNPMQdjjY6ue3jYRH6rvNS6BYMO8k6ZXSCIpP46IkvXXQOHPk2rwSSN4CbtWUI6bOnJY6d/rrqTyu23YVhlJphqxZ8pkWqFJ88/UWVMrd49ux1M9dg6/BLSMHWAbzm3wiat3kqqaTQOv9mdWkgM3OnzYfTJzftW6k2xbuX7VPqwfnjr/yJWvMfa8nlSXAcOfAQvjp1dEvQf6VSmqbX80sMrQ/38i7qN+bosO9it2BngP0zuXMUu7f3itSOU/y1tI71OMGLz03i49lXHHPIejR7xSQlL/fh9ZvzNJC6swF4o5FBJHYv9CUan89UPFe8gSSnDoqICq7KLFC2dwo64P8H+3EPCQN/CGplCGzFwqcf5nMmzL7E9LFnoCS9UkXPgDMyGMBTkxNofPb2ENTKpo2NYvN+dSlFISX8mC8r5mvjOioSPPqgwPyZ1+95/z4I8C/BHBkWPcrfXwAAAABJRU5ErkJggg==`

let base64_icon_cdrive = `data:image/png;base64,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`

let base64_icon_cddrive = `data:image/png;base64,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`


let base64_icon_notepad_tiny = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAL7SURBVEhLxVbLaxNhEJ8kJG22NE89FREEi4gi3ixafNGCD0TEiwfx0ItgoQq2igr+CXqr2IsexBdY7aGieFFR8IWiUEUhIj5QlBbSptW02c+Z77HZTXaabqj1V35838w338zOY7cJCSHgfyCs1wWHb8ahUEjv5gd+MWpmnO3rF9lj/c7NKhn3pNNilcyBDXzly5Q4/b4g8sUZyP+ZgZNv8+LESN6R+96MiaOvRwXtSXfk1S/R8/KnIx96/kMMfBhjH4ANPFIogW3b0BCLSdq2gJIgOSppY/mIMdwTS2hLNrEoyki6+2JsSnurBtvjU+/GBTmmcyL6dPZKplXp5J7+KnXI8+tafGOwGZsMyiRZ6UrasY0VoCrQ6rZTd5WOAxvYCSadm0Cq3Mapl/62HNhS9+LwmJJduH4LxicK+nR2NFkW7NnRIUtOdy+2Lw1W6nLJBGRTSVicTUsuyniZzaQgmy4zlUg42dLKgc34ML4edGaI8Z29kmlFnR4qJZt92fbSpmXBMzb9K8lV9dDbR7Khyii7atvqgAZsxt34ATDZXL45DBOFSX06OywrDts7NuvMBVzbujxgxnRRZ5BOJjx9zDhMQgb7n3Yx0dzsqQIHNuODT77pD0jtPnrkCtsbnSvqyFiydh9Vz7VcYcuBzbjr8Wc8oqcGGBy+C4VJ/rvrRjzeCFs2btCZAwxtW1lfxvQ+WvhRcPeRmMK+u5nUjDfG1V1ZmTq+XAcefpIZk5P8+ARMT0/jnvpNKPeR0iIdycRwJAJWnIJLK7i9c7V/DF8lBt5//yPmqsplghjnfjrO9s6uNcFKLQdGDggNixoaMzA0RM5/JbRz23rskBzYwKtiWFoZRDuh1QRyOa58KPeEr23iA7OlzuVyolgsynIR5roahMNh/GUSg9bW1mA9fjZ4Tixp2y1lznmlvnL9+nQI2vZ2Bwt8ttMSo79pZIKDfhxH0EdDFOD4valggR+c6RLfH13VmvrQ0r4P1vcMBAs8n5hz4IUA+zr9WwD8Bb7vqn4q++ppAAAAAElFTkSuQmCC`


let base64_getstarted_small = `data:image/png;base64,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`


let taskman_view = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAASCAYAAACuLnWgAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAACaSURBVEhLY6AHYAQRO3bu+//y5QuwALWAsIgog4+XK9h8MOHrF/D/7JlTICbVgJa2LsOe3TvB5o+CEQrAsX/67MX/Hz58AAtQCwgICDCYGusjkrCXl8//CxfOgZhUAxqa2gz79u4eTcIjGYBjv6d3wv/79++BBagF5OUVGMpKixBJOL+w+P+D+/dBTKoBOTl5hsmT+umVhBkYAIWHKgflM4KAAAAAAElFTkSuQmCC`

let taskman_processes = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABcAAAAXCAMAAADX9CSSAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAADDUExURcHDyKKjqJiZnbGyt4iKjW5vcnZ3enJzdmBhZEZHSG1ucaanq5KUmGhpa36Ag6ytsp+hpXFydSQlJp6gpFVVWHl6fcTFyoGChoCBhbq7wJmanikpKoKDh7m6v3x9gLGzuJOVmCgoKbu8wWtsb5CRlbW3u6qssHp7fqeprV1eYMPEyTs8PScnKCIiIxkaGiYnKE5PUZGSlrO1uaiqrnh5fJucoGlqbHN0d4mLjsXGy4aHimpqbXBxdLa4vLCxtr/BxgAAAFZL1ZQAAABBdFJOU/////////////////////////////////////////////////////////////////////////////////////8AMFXsxwAAAAlwSFlzAAAOwwAADsMBx2+oZAAAAKtJREFUKFPFkkkSgjAQRQMOKAgIiiAqiorzgDjPuf+p5HfYWMVa36Z/3iKp7g7j+aSeSfI3BfKsWCoDpVJVKJRVDb6mGyaoW3aDgtl0Wql3vba40u+Iyrte7xc+6IvjIBSVO8YQfjSOwGRqzyhE82ABv7RDsFpvthTCWEJfrrpLwP5gaxQSzCzvXfA/fzydfXDR48wBxq+3O23pYcmZA+jhSVt6vYUR5P8Hzj8ng2GJ3P+9ZQAAAABJRU5ErkJggg==`

let taskman_performance = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAMAAADXqc3KAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAEXUExURb/AxaChpcvN0piZnXd4e3V2eXp7fnZ3esrM0YeIjE1OUGtsbqiqrrGyt7KzuKmrr2xtb4WGirm7v2NkZ3x9gH5/gmFiZbi6voyNkXt8f7O0ubS1uoqLj4aHi4OEiLu9wcnL0MDBxoSFicHCx5KUl0RFRsLDyHN0dzAxMqSlqV9fYkFCQzY2OHh5fCsrLL7AxGhpa3l6fcPEyVBRU5ucoLe5vVNUVkdHSVpbXaKjp2doaszO087Q1dDS1z0+P7W3u5aYm2BhZLy+ws/R1jIzNIGChWJjZm1ucMbHzE9QUo+Qkzg4OtHT2GRlaKaorICBhKWnq25vcZSWmZWXmtLU2VhZW5CRlJGSlVlaXKeprZ+gpJ6fowAAAEFA8sAAAABddFJOU///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////AOGvnZAAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAEOSURBVChTdZLpUsIwFEbpgrbUCqgpRe3iioi7Ni6IKEoRxbrjlvd/Dm+STk2m4/nz5X5nMslMUiD/wERBkeAdIaqmFycEJnXNYMIsWVP2dIZdrpSqVMzMztGtIsipgXDr8+mcsVBfBOH5/GaBH7IElvxlKqorbFpdU1gC654gjMaGxVpAEs3N1hZrAUlsO+7OLqtlEe7tHxwe8T4TUQ3j45NT4p21z12McRSlIjAQQkqH2BfdyysLobAnngFc3/TjwS0spMMpw9ZQo5kTd/f6iGZORA8Jy1Q8BmyitHn0+lQ8Pb/w8Y/XQRPEW9FJ1I6AmsSNEQhSjt/N8UfG2Px0vtLP8F2R+KEdf6QchPwCeDCP6fBjf5MAAAAASUVORK5CYII=`

let taskman_apphistory = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAbCAMAAABVyG9ZAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAFWUExURaytsq2us9LU2aqssIWGimlqbFVWWKmrr9HT2IyNkYuMkMTFytDS15OVmHJzdnN0d35/goGChXx9gICBhHFydZKUl4aHi66vtLW2u2ZnaXBwc5SWmbq8wLu9wZWXmmVmaH1+gbS1unZ3emNkZ0xMTqaorKiqrk1NT6ussUJDRC4vMFxcX8vN0l5eYTo6PF9fYqeprTw9Pmdoajg4Ok5PUZKTlsPEyaChpSsrLISFibe5vY2OkcrM0YmKjlpbXWBhZKKjp8jKz4OEiHBxdJqbn0pKTJ+gpC0uL01OUB4eH1BRUyoqKz4/QMfJzo+Qk7y+wpydoV9gY46PkoqLj7i6vr/AxZaYm77AxGhpa3l6fcXGy8bHzHt8f7KzuH+Ag4GDhrGyt2FiZZCRlJGSlcnL0MzO011dYM3P1ERFRoKEh6+wtUVGR7m7v1JTVcHCx2JjZoiJjQAAAKXAshIAAABydFJOU///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////AHzXy+gAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAFeSURBVChTdZLbNwJRFIfDdEpiMi5NUwoRSuhCqKQREZXc71SiQpz//8U+e44xPfQ9zN77982sdc5eY6I9AWXqY03/gGAmxCxYrJgDoAZtQ9Q+PCI6RiVpzCGOT9h1NSk4ZYdLcXsgsk55Fd/0jK5mJf/cPE5IYMG/yCpTS8EQZnRZKzQcZo6plVUtW4tggVeiUTgMU7FgnBCyvpHY5IoGlC1U20mJYUn9K5reQaVjUJbMbi+VVfd6KZrbB+XkQ7c6yIM61D9MHBUIUfC6NHEM6iSHPVBkBy2VsT+NgKqc8XUasZbCoM7FCz4b8IhpUJcFN58NXMWvQdGb2zse6Nw/uHAbj64nnug8+160RSWrNS35o161wZOpVyFUS2GGNOpvahYq3vddbbbaDdaBaKsfLexRUfr5Fau45U5H9mZiBX4ZriiV0/5mPt/8/tH+GUBXsKeyLJeLfAAMqhtKfwFSxfxL/iVocQAAAABJRU5ErkJggg==`

let taskman_startupapps = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAVCAMAAABi3H5uAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAFQUExURdLU2c3P1LS1up6fo5GSlYaHi6Wnq8vN0qChpU1NTyoqKzEyM0BBQi4vMEZHSIeIjKaorEJDRElJS4+Qk7u9wby+wlxcX7q8wNvd49/h5sTFymRlaJaYm5SWmVZXWYKEh7e5vc7Q1WJjZszO0/Hz+c/R1oGDhjQ0Nq2us5KUl2doaoWGipmanjs7PaGiplhZW3FydY2OkaytsldYWissLW1ucHl6fVRVV5ucoMrM0UpKTISFib7AxGhpaycnKDw9Pq+wtUtLTYiJjV9fYkxMTkNERWFiZcbIzXN0d8bHzGNkZ7KzuHV2eVlaXH5/gk5PUXR1eLGyt8fJzkRFRr2/w4qLj2tsbmZnabO0uWlqbGxtb09QUqeprW5vcZCRlFtbXpKTluPl6oOEiH1+gbm7v8jKz9fZ36ussVVWWKKjp1JTVUFCQ5ydoXp7foGChQAAAMpCng0AAABwdFJOU////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////wC3YWLSAAAACXBIWXMAAA7DAAAOwwHHb6hkAAABJElEQVQoU32OV1PCQBRGE0nECEQRAyZgCRobKE0l2DACYsVCsyvY6/3/b+4md5xFZzgP2ZzvzOwsB13ojNwfxROA73EJoij0utEJv7FP6vd4fT6vPIADAeOgfygwzCnBYGhE1cIRZ8Q4OjY+QQ49Gp2cMqZnZnG2v3PzMZ2eNKpx/4IBQoA6jYuJJN6eSunpzNIywErWJErWXGJ1LedEgPWNzfwWuEUrQyYStwvF0k4Z467ssWBvv2QVRDvK8fLBoeS0SPYoXIHjk9Mzs2rHGhl1xW5Ktd5onkONPo8s+BIHrXGRvkyiENjI169C1ze3aAQ2uu7uW+2HRzQCE58qzdZzMYZG6Yzqy+sbGoW91pTeP9o8CoWNxufXt4b/Nmz8R5cI8AN2H9HetbkmtAAAAABJRU5ErkJggg==`

let taskman_users = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAaCAMAAACTisy7AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAF0UExURdDS15OVmGdoaltbXnN0d6mrr7i6vmxtb3Jzdnd4e3V2eW9vcm5vcYSFib/AxXZ3elZXWaOkqM3P1Lq8wFFSVJqbn46Pkr2/w42OkUxMTsDBxs7Q1aWnq5SWmZmansjKz3+Ag2tsbsvN0isrLKKjp8HCxyUlJmBhZD9AQUJDRIqLj8LDyIGDhiwtLp2eoktLTby+wnt8f2prbbm7v4CBhGZnacfJzqSmqq+wtXx9gJKUl1NUVrW2u9LU2YOEiE5PUcTFym1ucHp7fpKTlr7AxHBwc2hpa6iqrsnL0Lu9wYyNkVVWWJCRlKqssM/R1sPEyX1+gXBxdLa4vE9QUnh5fFlaXIiJjZucoLW3u2VmaLO0uV9gY4GChXR1eJydoT4/QC8wMYWGioeIjDAxMo+Qk01OUJiZnaeprV1dYGJjZp6fo9HT2H5/gqSlqbGyt8bHzMzO015eYWNkZ4uMkMXGy0RFRlRVV4aHi0hISrCxtnl6fQAAACK8uT8AAAB8dFJOU////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////wABatoxAAAACXBIWXMAAA7DAAAOwwHHb6hkAAABiklEQVQoU32RZ1PCUBBFY4hCxNgQiQUFBAsiIIIiSlVRsSFgRcXee9f9877dl+g443g+vLt3TyaZJAL8gy6FKtEgVWtFR5M1RpNca65TeNPhsr6hsakZLEqLlaoOl60tNkq1rR2go9PeZaFKstvhpAKuHjd4xN6+/gEvVpKDig+DMeRv9gaCIAyHRlgj6QpHMABGe8ZsiokN0fEYO/kz7ROTGPFE0pbypdkUzUyxk8vpmezsnDCfW7ADLE4sLa/kV/FqLqGQTPrUdLHERkukUZXW1nGrSYANk5iY5qPfmN+k4Vv+BcrWLcMPpW2IRwyG8k6cpD1tln/YCg/Cjiybs+w7MxlI1PO7ENbdPYyUt0Jy309bjfaDQ8q9I5KVX7+iRsHXBzg+Ibmbc1HlnMoFjLPzU5LRi0tacyQJT7cYuiIJGaMbF8jydd0NWFTJ6bhlDWVQzsZu7wS4D3aGH7oAYo/lpxReihKeh19eM2rsLfReHGP1w4NLBkmA+8tPpyhNBXnT0eTf/CMBvgAiGQ8EJ9sHcgAAAABJRU5ErkJggg==`

let taskman_details = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAATCAMAAAC0hZ1zAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAABLUExURZeYnF9fYpmantHT2MjKz8bHzDw8PiQkJW5vccXGy1NUVjc3OTMzNVBRU5WXmnR1eKSmqri6vq+wta6vtLe5vcnL0NLU2cbIzQAAAPvLSyIAAAAZdFJOU////////////////////////////////wABNAq3AAAACXBIWXMAAA7DAAAOwwHHb6hkAAAAT0lEQVQoU2OQwAMISTIwMgEZzCysKICFGSzJxs7BKSHBxc2DArh5wZJ8/AJAnYJCwihASARipyjIfGyAkINwA6DkUHStGIs4ChgY10pIAABxAClF065nyQAAAABJRU5ErkJggg==`

let taskman_services = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAbCAMAAABRPb9kAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAFlUExURZeYnGxtb21ucKGipoSFiXFydWlqbNHT2KWnqzo6PJCRlMfJzry+wnJzdktLTcTFyre5vZSWmZKUl5OVmIqLj2doajU1N56fozs7PX5/gpKTlpqbn7q8wLW3uy4vME1OUF9gY2RlaG9vckRFRlpbXrKzuKOkqCsrLMbIza2vtH6Ag4yNkZ+gpMHDyIaHi8bHzH+Ag87Q1cPEyZmansHCx4WGilBRU0BBQoCBhHBwc1xcX11dYMzO02BhZExMTpWXmsnL0E5PUU9QUouMkKmrr5ucoHZ3eqChpaqssXt8f7CxtigoKcjKz25vcX1+gcLDyMrM0Ts8Prm7v4iJjWNkZ3h5fH+BhIKEh4mKjq+wtVJTVZydoYGDhmFiZVdYWqqssCwtLqaorKiqrrO0uZudoWprbXN0d7S1uoeIjF5eYbGyt62us6ussayus7i6vs/R1oOEiDg4OmVmaDw8Pj4/QK6vtAAAAKf0j2UAAAB3dFJOU/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8AqZ+kZQAAAAlwSFlzAAAOwwAADsMBx2+oZAAAATRJREFUKFOFj+sjwlAYxrdkpkkxcxnFkFzSchcjxLKUXHKJuS23jHI9f7+zc06XfRi/L+/zPr/z4bwUcMAmKNrVRKJNuF3NDF0t6qKFbfVwbd52H16x8Hd08l1CN0w9vX0i3z9ARCA4OCRJ0rD1BE5pZDSExVh43Bo1JiansIiE0V5jOur+W8gxm5iZnfMiMb+wuEQ6C99yfGXVA4Wytp5gSQnZ2NxKRrZlKHbUFOkQu8EAmhQQtTRKBHYvgyYF0tn93AHKCP9h8ohT0OXH+RONtBan+djZecESIHVh++6lfnXtcGDO6fL/xc0tf2cYRdQZED1+j0VGeHhUGfoJpueSqqqCzmEBwItpRksiAK9ZxjTfyrAhAlJ5/yiWhU+ZrHUBFO3rmw6RpVGAyk+h+t4uGgDgFwpi9KIhyCfIAAAAAElFTkSuQmCC`

let taskman_settings = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAZCAMAAAAc9R5vAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAtUExURa2vtHh5fE9QUlxdYGpsbjU1NycnKBkaGsjKz6CippKUl0JDRIWGirq9wQAAAITZlVsAAAAPdFJOU///////////////////ANTcmKEAAAAJcEhZcwAADsMAAA7DAcdvqGQAAADjSURBVChTdZHRloAgCERFBczS///cnUF3rYedUyfh6giU5j86IEku9RXu75yaRbLt4A0cy+Y72KDxjZxfOwwg7tLvyrDaI+ZlgeSjZ8vMg2jug654bm74qKCGhAPh+RGuSrh1u4iarFW1QatmNyOxp2vsKbbu2EV6n/Nizcs7gCI3GTYfoNE+gcCSI6E5c86WAMJyzuFuvyvsSfDlfuqiI9Wi3HX1R6wBgMaj7y5Hx3nFLGiqqmbrXMfC468QjPKwNAJF770wyXcp2jpzO4CDis6XDqgO7XlCB6D8Px/oDV6a8wfJ9hs/YlecCAAAAABJRU5ErkJggg==`

let taskman_runnewtask = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAaCAYAAABCfffNAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAN4SURBVEhL7VVHSyRhEH2jY84JUTGCYkb0IBhQzBcPHgQFD549eNGLZ0F/gwieBAPqSUEURL2YMKIYwYAgZszZb/uVM7Mz68wyrsue9kF3019116uv6lV9+BfQGZ5YWlpSe3t7uLu7M6x8HREREcjNzTX5NEIWSDAxMYHj42O4ubmJwRzPz884PT3F0dER0tPT4eDgYLBY4ubmBsXFxbwsiPS8zc3NYX9/XyJJTU0Vgzmurq4wNTWF6elp1NXVwcnJyWCxRFtbG5aXl7G9va1iY2NNREJydnYmBPn5+UhLS/u0XaKjo0NNTk6itLTUqp1oaWlRer3+U8qt7/sv4z+JVYSGhsLX1xesizlMJC8vL7i/vze8fcbr66tNVRlBeSckJCA5OdlCHPLS2tqqLi8vER8fj7i4ODGYg/pfWVnB4uIiuru7TQ52dnbU+fk53t7e4OnpSflbVZ6JZGhoSJrRWqO5uLggMzMTDQ0NDEQ3Njamurq6sLCwYCHXyMhIVFdXo7a21vpObm9vkZiYCK2JxGAOEnt7eyMgIACjo6Po6enB5uam7PD9/d3w1UcwwcHBKC8vR1VVFWJiYsS/qUJBQUFISkqy2YzEyMiI6uzsxMbGBh4eHuDh4SFBaTVgGvH09ISDgwMMDg5Cp/vpxm51ra2tqf7+fqkNCQgfHx8pdkVFBRwdHWWN4IgaHx/H8PCw4rvdJIeHh/Iji+zq6go/Pz+EhYUxJfJkJgIDA2V3JDw5OQGHLmE3CX9i3Qg61kY6cnJyEB0dDXd3d5m+ZWVlUlcvLy9Qrdp0l+8tu+Y3YJ8YUVNTg4KCAomcUbP5mpqaxMYhyrpx19fX17JmNwlTZER7ezt6e3sRFRWFwsJCZGVlob6+Xs4dHgvcNc+lkJAQ+V5IOOZ5pgwMDDAKKZYR4eHhyMvL0zFqXmy+3d1dsRllT1XNz8/j8fFR1gkSpKSkoK+v76MmGRkZkmdGQgfmF5Wyvr6uGAhTZN6sJKFkt7a2LPqF6eMcy87O/njnjV3M58zMjPp1fjk7O3MeiV07HZU2SkgqMr64uOA/QkbVEawRA2IKi4qK5D+bjWcLs7Ozqrm5mUespImDlaBzBuTv74/Kyko0NjaafH+ZhFhdXVXa/BIFaU0qZIye841SLikpsfD7RyRGaONFcUAqpWRuaYX+lr9vAPgBzuKKlAzmmkQAAAAASUVORK5CYII=`

let taskman_endtask = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZCAMAAADzN3VRAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAFiUExURcPDw5WVlWxsbFFRUXt7e6ysrNjY2La2tnd3d29vb3x8fIeHh4qKioWFhXp6enV1dY6Ojs3NzdfX16GhoXJyco+Pj7e3t87Ozqqqqm5ubsLCwpOTk1xcXIGBgdTU1LKyskNDQ2dnZ7+/v5eXl1lZWYCAgDMzM2hoaLGxsdXV1X19fTk5OaampoSEhNzc3Gtra9HR0aenp3Nzc52dncHBwWFhYaurq+Dg4HZ2dnBwcIyMjHl5edLS0qWlpZCQkMbGxt3d3dra2n5+fmJiYqioqLW1tTg4OJ+fn9vb20dHR7Ozs8/Pz4mJiTw8PL6+vpqamltbW7i4uMnJyWBgYLCwsJiYmG1tbczMzGRkZH9/f8rKytnZ2UhISHh4eKmpqbu7u1NTU3FxcTs7O1RUVKOjo1JSUoaGhpubm2NjY4KCgsvLy42NjcjIyL29vVdXV5aWlnR0dKKiot7e3rm5uaCgoAAAAPS2f24AAAB2dFJOU////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////wABYqlHAAAACXBIWXMAAA7DAAAOwwHHb6hkAAABZElEQVQoU3WRB1MCMRBGkeZRpUiTA0U5EUQRRQQFpKigYEWxACqKBRu2/H+zmxzjOOObucvu9yY3m5yC/MfAKIaUKpVKrdHyXjbDgk5vMBpNJvOIxcoiNDb7qNLhtNHK5TZ5hDHI0Gi9os+PHTA+EZiEFcxUUIKSo/VMhyClz4zOyDIkHJmNBufm0cT0CzyluCTRSeKLS2ASy3SRsfqUSUJWUmkwq2sJHhOSkXRZWHOxdWpEbx5TSqFY2sBiU4pSs1XGhlKJbO+wquqo/Tbh4u4eL7nZZ51LOjhkFSFHNTD1XAEaOpUbU+BYHafmxAyXIU/FsDSs1Jye0fNUzvlUSCWVwjtIqy+akRafCrG3L9FcBa47N/JUQPjWR99wq927VhcjRqZ0Dz8PTP6h3hjsqWQfe09QgCFE4zE/J1+aTf9r2dDuVDFjhh7zrdTr9y3vYuiDJbIh5PPLKwjCN34IGZg/EPIDs0jhNyQsLfYAAAAASUVORK5CYII=`

let taskman_efficiencymode = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABsAAAAYCAMAAAA8nnbJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAFlUExURcfHx6Wlpaurq729vd7e3re3t4CAgHp6eoODg4KCgoiIiNra2n19fVxcXKampr6+vrW1tZWVlWRkZF5eXo+Pj8/Pz3V1dW1tbZqamk5OTnNzc8rKysTExCwsLCkpKSgoKNXV1X5+frGxsdPT02ZmZmJiYouLi7KyssnJyaSkpE1NTYSEhG5ubqmpqc3NzWVlZXd3d7CwsN3d3dTU1ENDQ6enp8vLy3BwcI6Ojl9fX7+/v9jY2ERERHh4eN/f33t7ez4+PsDAwIaGhsPDw2tra7S0tIeHh6ysrJGRkdvb24WFhWNjY6Ojo5iYmLOzs2pqary8vKqqquDg4JycnF1dXaioqIqKip2dnWhoaLq6uldXV1hYWGdnZ39/f87OzsbGxpKSkjk5OVlZWTs7Oy4uLjExMZSUlFJSUtbW1iIiIioqKoyMjGFhYY2NjYmJiWxsbG9vb3FxcczMzNLS0ra2tq6urgAAAJgFfi8AAAB3dFJOU/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8AqZ+kZQAAAAlwSFlzAAAOwwAADsMBx2+oZAAAAVZJREFUKFN1kPs3AkEYhleoTZuiFAldKVZKN3KJUkjC5lKiCLnf+f5+M9/MEud4fth5v/c5c863I8D/ECd0IJrOLt6pCNCt1YmIvkdj4C1DAMnYa6KY+/ot1gFeIwLY7DwCDA45hp0cMv5yBvvI6BhH51Kd20M+Xp9/fCKAOIOTHtVNydMQmglHZul1SjQWV13CnZxzz6dYT1lYpG5JXiY5kV6JrbIaYS5jc9Ehu2bEksNcLr9Oh2x6A0sOc5uFLTqYdBosi9t4MAelHYm81W54j1RKeT+Czot7Amh80kEibj8k6qiSRwXV4xw6KNVOMnpLDaBcEdGQHz6tMwfQOAv7z6vWJr8FoYs4fU8VQ+byqsVzwHh90+4U7e3dvYLRIz80yPHtlHLzUZJlMRh8Sj4XqrRSHW4YLepeRNHx2nrDTnVmB9vwPZWqYyCo7uOThzZ+dvkLwBcxCeMnL+J00wAAAABJRU5ErkJggg==`

let cxt_rename = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAMAAADzapwJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAEyUExURUic3g9/1Qh81gV71Q5/1hSC1lml4TaU3JzH66Gjppucn5qcnpqbnpmanYO66E6g4KOkp6GipZCRk2RkZH19fY6OjoG55peYmHx8fIqMjqyusW5uboK553Nzc6iqrXNzdKampni35p3K7KqqqnBwcWJiYsLCwh2H2B6I2bq6umBgYF9fX8fHx3O05kSc3xGB14vA6V1dXSqO23Oz5SGJ2YG45k+h4X+65z6Y3RqF2JLE6hmF2FCi4FKj4RCA1kie33665xSC122x5WSs4yiM2qzS7h+I2YG76Gqv5GWt5GNjY8PDw4rA6XN0dW9vcKeorHJycnZ2dqKjpoeIimZmZnt7e4aHh4SFh7u9wZqbnYK657u9wJHC6E+g3zCQ24u+6Ax+1gd81gR61Qp91ROB1gAAAIEt5Q8AAABmdFJOU///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////ADWOqLcAAAAJcEhZcwAADsIAAA7CARUoSoAAAAD4SURBVChTbdF7NwJRFAXwEUXuMFJIeWVEeZOQtxFCXlPJ+72//1dwzj1aTY/9x5l9f7PWXXfda6BtvGx0+Dq7/FL1rCXQ3SNFc7BXKdNUfei3MBD658FwZEiCYQsj0fAocyzOvyVjFs/xCeLJKa6JaZ7C9gxxcpbrXIqncHqeeGGR2tLyymqd12q8jswGfbKbDby1DeR2Wng3tbd/cAg+oIePjh3HOcmfNvHZOa8KF8jW+fIKBV4ARe8Br21tOrKJfUN8e6dFR/jeJUapXIlImB8q5apc7KNL9/pkKoVnC27ohajhGV7f3j/kHbxsfH59//xK1bMpwB+xIZQHKZ3hJQAAAABJRU5ErkJggg==`

let cxt_delete = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAWCAYAAADAQbwGAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsIAAA7CARUoSoAAAAIySURBVDhPrZRLaxNRFMfPPGwmaR4NNq4SXwQ0q4qLlhpcJUrVQvELaMRNNkFqqztpxW8g4rYpDX4AUUPchECQadF1UAkKWWheM8XazdjmOufmZnKnScdU+oNL7v/cc/5zM3PuheNGYL+Hsr7xinz6uGnOBJi6dBnu37vjWOO4+PzFS/LlcwVmr1w1FYGtTRVOnzkLS4sPDq2jC2vZDWL8MVhAAEII7O3vwZb6AU5OhuDCxRj6QbX6Feo/f8D0zCycGBuj+ZiLyLJs7v6uQA1Xnz4j379VIRqNgsfjoQmYiEMwU3DwMVEUqUYMw4BKpQLnzkdhdeVJf+fLjx53H/UfLD5csmqtRymKGwqFwpFNS6UScbvdTHGGGGw2m0yNDtYoisKUbYcKNBoNpvqUy2Vr16qqDvyDVqsFLtcQQ38gAJqmMdUlm82SfD7PFEAul6MxJilo6PP7meIMMajpOlPD6XQ6bNZH394Gr9fHFG/o88Pu712mRkfXdAhMTDDFGd6au9ZrtyOxbx6AhfkbVqVliIiSxGajc7DGZihLMpgfYeReLBaLRHIydJmtw/diJBKho0csFoNwOMxUtwcl0cEwGAzSNuiRSCSEdDptvZ9MJiMkk0lLt9tt2wdBbIZ4s/CG/6Jer8OkWcNjM8TFg83tBOaGQqeY6jLQKKlUisTjcfru+GuKB6+wWq2GxxJPjs1jwPDNu/ck//Y17Oz8ooXDwIYdH/fC9bmbcHthfsDjGAH4C3jXw3dborFPAAAAAElFTkSuQmCC`

let cxt_mapnetwork = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAASCAMAAACDzGUcAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAC0UExURaOlqKKkp6KkpqGjpamrrrCytVVVVXZ3d35/f2tsbFpaWmFhYaysrIWGhoeJipOTk39/f6ioqHx9fq+vr56enlhYWMjIyKCgoH5/gHx9f3l5eb+/v2doaKCipXl6e1xdXYqLjXqq0SpmlHSz5Q9/1jyW2wB41KDK7DWT23q45xyH2Wyv5GtrbH255xp0uZ2fohmE1y+Q2z+Z3j6Z3h+J2UmW03u35ne15Xe05Xe15oG65gAAAPtvSmUAAAA8dFJOU///////////////////////////////////////////////////////////////////////////////ALuI66cAAAAJcEhZcwAADsIAAA7CARUoSoAAAACfSURBVChThY4HDsIwDEWTAmVvyoYyw14pUIrvfy8yHBIQEk+K5P9kxybwC2kJFXg05YlHaVrZjJ/NueQL0hZLashSrgjrY1BUawD1xrdtttAGbTSGTlfYXv9TD4YjYWEc+C7hRN+LOAv+2ekMC8HbzhdLtsLa2DVjG9gyttORwF4uZjodjjKcTO/5wjmPoutNR/PvPY4fSfLEZG+wALwArytFPRW9Ok8AAAAASUVORK5CYII=`

let cxt_disconnectmap = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAMAAADzapwJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAADAUExURTCR24W854S75gB41HCm0Ya96KKjpqGjpqKkpqGjpaKkp6mrrq+xtVVVVUN4oIW86I2Njn5/f2tsbFpaWmFhYqysrIzB6YWGhoeJipOTk4uLi6ioqHx9fqamppubm3x8flhYWMjIyKCgoH5+gHl5eXWq0r+/v2dnaKChpHl6ezBljXp6e1xdXYqLjb/BxZ+hpGBgYLu9wXOp1Hd3eGhoaFeMtoe96WprbGVmZnN0dGhoaYSFhqOkp6mqrjiU3AAAAIKHvoIAAABAdFJOU////////////////////////////////////////////////////////////////////////////////////wDCe7FEAAAACXBIWXMAAA7CAAAOwgEVKEqAAAAA1UlEQVQoU23Q2VqDMBAF4EBaQpdRaatWAaVVW1r3uq/n/d+qk0BCLnJumPzwTYYRCEZARG3pRyCWAecmPdkHEqVUqgbpUI0aHtOBPMRRZjOZGp4d44S9y+lcM3Hl/OwcyAvLzssL5kvN1aJxvrfJ8kpzcW38xs65WteasalIZ8t9bvl5d8/vvJ/XbuMxxTJuS49reojcHhw/PmX0vLPztPxCVOKV6E2+m7PAh5nDHJCbeTjt159fZk3fP7xP3d/2/lUqUckfV2b/3SQuEc8ZYET/QQawB/MYW9X35gVAAAAAAElFTkSuQmCC`

let cxt_pin = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsIAAA7CARUoSoAAAAGuSURBVEhLYxg0IG7Fo/89+1/8h3JxAiYoTRTgrr32/+773wwN+98xZKx5TNBwokDu+qf/VbpvwQ3jqbv2P2MtFQznr7/+f8rRVygGgQzPXPuEfMNb9zz/L95yHasBYJeTGyxKnTf/N+x6jlMzWcESufQBTtciA6IMX3DqzX+XWff+M1Rc+a/eg4gwQgBkeOdeSFJESW4FG58AXXfjf8amlwxC3MwMDB06jDdL1Bih0gSBmQw7w4UXP6A8KEhcCfQG0IUtewgnfnQw4fCr/9r9t/9zA10MFWJAcY0aMJ2K8jAzHM1UJsqVWeuf/F90/hMDNxsjQ7wBH0OXjzRufapAw62n38Xr6qodwBQC9J3NtLv/QfEBFSYMQC7HZzgokqBMnABrWXGrVI3x6fvvDFbT7mAYkLT68X9nJS4oDzfAavDuvQf/G1ydwPDk3TcGdJfvuvONwVWZE8ojAezZd+h/RETE/1Vr1oMNxAhzYNhCWcQDkEuRDYUBmOFl2579N518mzSDYS5dvXYDVo0gw0GurQIaDhUiDGCGrly9Dq+moMUPSHMtxPvYXTrIAAMDAKAG8qLjQv3xAAAAAElFTkSuQmCC`

let cxt_properties = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAMAAADzapwJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAACoUExURamsroWGh2tsbHx9fqKkpm1tbmxtbZ6enrm5ua+vr1hYWH1+gF9fYJCQkHx8fG5ub4OEhnl5eYyNj1VVVXl6e5ianF1dXW9vb3Fyc7CztsjIyFxdXbu+wVpaWqmpqWRkZHh4eJ+ho4uLi2dnZ2RkZaCgoGlpanh4eWZnZ3JzdK2wsqaoq7e6vXR0dGhpabGxsWtrbJSUlK2uspiYmL+/v6mrroCBgwAAAM/H7gwAAAA4dFJOU/////////////////////////////////////////////////////////////////////////8AO1wRygAAAAlwSFlzAAAOwgAADsIBFShKgAAAALtJREFUKFNtz4kOgjAMBmAEFZkHCtOpqCjeF972/d/Mrls2IDZZ+/OlgeHA3yqxU3O9ukrUVTWafitgbRkL3Oli64WULfcH2EijIsd4SDkbFniER3BUEYwtT1zZBecCponl2ZyGEAALz3Iq76FquTKcZjrg8trcZGM1Y9gUa93u9of4KBOxfoOfnM4XSsR6109oUCGbXRqqHIiuFEqKnN/kLCvy/YGjoshP9nr3Kio/+Qnzr34ypX6nUgA/BFRbV/EIAlUAAAAASUVORK5CYII=`

let cxt_showmore = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAMAAAC6V+0/AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAC0UExURbK2uoqNj3p8fXp8fquvsn655TqW3DqW3YO854qMjl9fX5OWmZ+ipZ+jpqrP7XS05XW15nOz5HW15SSK2QB41LS4vIK75iWL2juX3ZSXmoO96J6hpI3A6IzA56vQ7ZzI6nt8flVVVV9fYH+BgpOTk9DQ0MjIyFdXV8LHy6issKioqPr6+pSUlIKEhaCjpnt9foqMj5ubm7G1uWBgYOjo6GBhYa+zt4KEhmFiYnx9f7C0uAAAAN/xDOQAAAA8dFJOU///////////////////////////////////////////////////////////////////////////////ALuI66cAAAAJcEhZcwAADsMAAA7DAcdvqGQAAADISURBVChTbdFnE4IwDAZgKCrDIg5EEQcgOHDgwpX//79MIHeO822vd3na9EOrwJ8QKqrQtBpAvaHrOA1C02pKaeNmy2l3uj23gdi3yhaO5w6GiKrPNWXkGg6dFNTJMVwDKgxYqNcDcHRCyQRjsl/0JrROZ4jax50cBcIIE8+5LoOYpGm6SJYMsFoTZhvKdse4F29cxIySMK8wjRiDEPFw/Maming6X76wuCLC7X7MsiyJpG1L2y8e1SM/zTzEIfCphflE+PMdAC/TVkZXOZQQ7QAAAABJRU5ErkJggg==`

let cxt_copy = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsIAAA7CARUoSoAAAAH0SURBVDhPY6A2YITSOMGpBx/+77r7g+Hyi58Mn3/+Zfj3HygIwkDAwcbEoCrIwuCkws3gqSkINougga6z7/3//peBwUmJi4GbFVU5yPCLL34w3Hv3m6HBSYjBS0sIv3kzjr38L9F6A+oe3MAZaGnJ5sdgdUxgERzg6qtfDOLcLFAebmCvyMXw/Ms/MBuueuvOvf/Pnz3N8PXLZwZePj6GqopyRpASHnaCocLAzszI8P8/xCNgF+49dOz/vt07GFSVFRn8/XzBhoHEYYpIAWAD79y8waCupsoQHh7OaGFhQdhJWAAjI0Qb2MC3b14ziImJgQVQAFQRKQBs4N9/kADFAOR6mRoAJVLwgX//ifM2ShjiAsqCbAwPP/yC8nCDc89/MvBzMIPZ4HQIMx0dFDtIMGr33fpvtvDBfy91bgY+dlT7QZ48+fgHw85bXxmqHQQZpgH5YAPxpberRWqMeksf/p91+gMw8kAi/8FxBXOEGDczQ4GNIEOMiSjCVe2d3f/XrVtHepRiAWA/SEpJMzx8+BAsgA80Nbf8P3T8NF6Lwc48fubC/w1rVzFwc3IwaGpqMrCysoIlYeD79+8Mly9fZmBiYWVoaWrEHuBQAJc8efbS/2tXLzO8f/8OEtpQGVBYgbComDiDjp4Bg76mCl4DqQwYGAA2WaUiTjPRUgAAAABJRU5ErkJggg==`

let cxt_folderlocation = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAUCAMAAAC+oj0CAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAACiUExURY6PkXt7fJGSk1hYWHx8fKioqI6Oj1dXV3R0dZaWlqysrFxcXYiIiFVVVZSWl8HBwVpaWqyusa+vr4GBgX9/f2JiYoSEhY6Ojm9vb6amppCQkIeIibm5uWxsbJubm4KDhIODg5aXmXd3d7GxsWtra6mrrouLi3FxccjIyFlaWm5ub21tbrS0tHNzc4qLjYaGhnZ2dlxcXI2Nj3l6e3p6ewAAAPv0ik8AAAA2dFJOU///////////////////////////////////////////////////////////////////////AKGPTjEAAAAJcEhZcwAADsIAAA7CARUoSoAAAACtSURBVChTbZGJEoIgFEUp24syW0zLNtv3wvf/v9bjcbUZpzMI3APDG0TRX6xWFabqMmDt1epMowkjKGq13azTdaOgqNjV04LX57ki7WTBwB/mOhiNf0ym0OEsslVB7EGXzonnohcJMliuRC9DZLDeiN6myGC3F+0j5nAp1kGpIvThiAhOZ9EJfkpOerH6qm/I4P6wmvQT1xOi15uX7DN8jMm4ZRl/xsh7SVeG6AsGfUlq3JhXogAAAABJRU5ErkJggg==`

let cxt_copyaspath = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAASCAMAAABo+94fAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAACrUExURaKjp319f3V1d3R1dqOlqGxsbVdXV3FxcXt7e1hYWGVlZnh5emFhYWNjY3N0dV5eXre3t6/T7lqn4nq455DD6lxdXVVVVQR61X255zeV3Ax+1qjQ7gB41FKi4GKr4xSD16DL7JjH6xuG2CuO2oS86Ha25j+Z3ked35TF6l6p4juX3Wqv5Lm5uXV2d2RkZGVlZXBxcmRlZXJycmJiY56go3x9f3x8fpmbngAAAFXCVf8AAAA5dFJOU///////////////////////////////////////////////////////////////////////////ADqsZUAAAAAJcEhZcwAADsIAAA7CARUoSoAAAACvSURBVChTbdHpDoJADEZRQAVxRVAEFUXFfcfte/8ns2U6CSbcPyQn0IFioDJmw7SsmmRZZl1xw3aapRy3xdzuFI+V6vaI+97AB4KhGOWNiENgDESxGBcqnkyBmRAnnMyBRSpGCS9XgE8H6IR5QrpQxGleZ3/DNW+2QBwpozTrV9ztcQgU9z1iOhM0/JghOeHMn3O58u3lbndiPOxctlSUu0+12NdbL5avny9R5W8AflWNQkBu12+cAAAAAElFTkSuQmCCdata:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAASCAMAAABo+94fAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAADSUExURbCzt4SGh3p8fXp7fbG0uG9wcVdXV3FxcXt7e1hYWGdoaH6AgWFhYd7e3vr6+uDg4GNjY3l6fF9fX7e3t6/T7lqn4nq455DD6l1dXVVVVdDQ0LvZ8AR61e70+H255zeV3Pb4+Qx+1qjQ7sPd8gB41Obv91Ki4GKr4xSD16DL7JjH6xuG2N/s9s/k9CuO2oS86Ha25j+Z3ked35TF6l6p4sff8svi8zuX3Wqv5Lm5uXt8fmRkZObm5mVlZXV2d2ZnZ3JycqyvsoOFh4OFhqaqrQAAAEZNijEAAABGdFJOU////////////////////////////////////////////////////////////////////////////////////////////wBplkTQAAAACXBIWXMAAA7DAAAOwwHHb6hkAAAAv0lEQVQoU23Q1xKCMBRFUQ32cixYsYCCiBV7w4KF//8lA1xFR/fjmskkOSHnby6HwowJFGPhiM/RWDzxUTyZcjmdyeKrXL7AuSiWykClSsgTa5zrUqPZQlsm40l1j5VOF6rWI3wz9D5gDAgDHo6AMr+AevFYm2BgEAaMqYmeppIGPJsDcps0YHqislhiVfG5KALKaI2NAWVrQt9h737nYB3pMHU8nTk7l5hNK3nZScsf9npzh2VeArs/aO+fHOcJdsUv/8Wt0FoAAAAASUVORK5CYII=`

let cxt_openinnewwindow = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAMAAAC6V+0/AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAACNUExURVal4jyX3TyY3oa/6aSnqaKmqKKlp5HF63e25na25ne353i35yaM2gB41Hl7fFhYWHZ4eXx+fyWM2qWpq19fYIfA6oW+6YOFhpaZmnt9fjuX3aGlp4W+6HO15qmtr3x9fp2ho6OnqZaZm2tsbFVVVVxdXWprbJ2goqGkppSXmG9wcZqdn31/gKOmqAAAAA3kkzAAAAAvdFJOU/////////////////////////////////////////////////////////////8AWqU49wAAAAlwSFlzAAAOwgAADsIBFShKgAAAALhJREFUKFNtkAkOgjAQRYHaslmlyiJuBfd17n88Z9ohEuMjDfyX3yGZAP4wkkEY0RMJLydSKoA4SbM8meqQ5GxeGGNcGUDoBcllyZmodJ1HKJsVC6TWAjKSLY5jBDrI1yQ3rPAuOkhophmaW+cgpeuDFLpy73hHUrpv8D0HzmTJ7PF8mwzF0Y88FAOwP9I3O46eoid5OHL0nPDgls6X600pJZWU/b18eAnPl2ktbs9Y27ypPdr8AMAHYZE4emo8oU4AAAAASUVORK5CYII=`

let cxt_format = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAUCAMAAAC+oj0CAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAADPUExURS2P247C6SaM2yaM2gB41GKs5He25nm46IvB6wt+1jiW3TyX3TyY3hqG2U+h4I/E6xaE13W353y56A+A15bH7CmO2nK154C76ROD13i35x6I2BeE2Gqv5X1+f1hYWFVVVVBYXRB1wyqO2kGa3gt2yE5XX3x+f3d3d8jIyNDQ0MLN1juX3R6H2C+Q27jJ1nl5ecPd8oi/6H2557vZ8Lm5uaioqObm5tbW1mFiYq+vr7GxsWFhYquusH9/f6WoqaapqqSoqaOnqKSnqKOmpwAAAGAAizAAAABFdFJOU///////////////////////////////////////////////////////////////////////////////////////////ALLusTgAAAAJcEhZcwAADsIAAA7CARUoSoAAAADQSURBVChTbY/ZUsJAEACDWQwJEeUQI5iMB5AseKICHsQc8//f5GRnQhUF/dKzXXvUWniUOlsNGRjJJza7hrOtmqeO0zKzgbOrvLbvnynfrAi5xO0YefVd9ZPuudFF12iXhZ5sl9xn4UCxJV8O2VcBW/L1iD2+YVMOI4Dbu/tq9TCZAkSzKodxorWeL1TwqJ6eaUxeQspRYo7h69vynfSBmESUQXNmPmGFGg4yrpHz5kvCju8fyr8Qb/eIIaWM+JfleVaUZVZkRZHnKSX5zj6I/8t1Y/thuzP5AAAAAElFTkSuQmCC`

let cxt_eject = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAMAAAC6V+0/AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAABgUExURSKJ2COL2j+Z3ked30uf4DeV3I/D6hCA1xSD14jA6Qx+1gh81VKi4JDE65DD6pHE64i/6IzB6ZvI64nA6RuG2H255x+I2Ha351+q4z6Z3lKj4T6Y3X266Hy553y45gAAAC9epfcAAAAgdFJOU/////////////////////////////////////////8AXFwb7QAAAAlwSFlzAAAOwgAADsIBFShKgAAAAJdJREFUKFN1jtkSwiAMRWtcaNG6VFFjofz/X5oLgapTz0MIZ5I7aeICs2xW2nxIWm+22la5MzG2nX6KtCj71FZJhHrQgCz7NFgDsrTH9JSAJPMyyBdAnnQZmLMUSHtJ/wwCRFI9GiBAZLlOMYPI6819cX9g8klMM/zSk375IzsemZhH2ZRHAnpMeh+Cd9PknXcuhLC4HuMbcC0pI+YwY8YAAAAASUVORK5CYII=`

let cxt_shortcut = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsIAAA7CARUoSoAAAAG/SURBVDhPrVTZSsNQEJ207qlgn1zauuKCWnz1E1w+wAdfBBUV9Dv8AVFU/ACfRBDULxBBEaF1Q5vUaquIFqGCbdo73pkk0s2teCD3ZmbuPTlnklz4Lyg07O7tY2d3H7hctYCcRkC6kQPHcqA7zlH4mUcInB7B6MgQ80Ds6dVa8ncELzTe66ABUdBUEiqrVZ5Z0t1DHL0NblNeFgY3oxhJpK0IQGQQ0oYAr1oGJxM+Xn+lPWJXW73CioQorsj2K4QkSAkwkoKJtOekVZE1y41JZHcxD4djTcr9ZLMSm25RGqsckEkLeSEYktQGPYRgKfq+1wMbt6jHDfDUOMF4z0BKXjZsET8S+dfDqMWTksQBgZlWxbZnI1fRF9b8a2GpJMXNDc62cXPJntzAdUKetcJm96/qqL0kwSdJzuZMEkJLXTm0uiusKE/E2XU0R1Lviobq4hX2LIWKS83CcUDnNQXWepdDqL9IOy4nXMy3F3xb+cixhlme6fV6VCdcLnT8SELIsXZ6HsmK/oaDkxvey4reEgmaSoKtiOVvbe+gr6Ofjwf6L6hk1s2jgw8NK08JniVSbwZEL3UYnxr+VRt+AYAP+OvyllwLbRwAAAAASUVORK5CYII=`

let icon_power = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAWCAMAAAAYXScKAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAABsUExURdra2j09PcrKyhoaGszMzMLCwsHBwYGBgba2toKCgiwsLNPT09LS0isrK8vLy9TU1D4+Pp6enuTk5BkZGcnJyYODg3JycuXl5WJiYk9PT5+fn2NjY6urq+bm5ri4uLe3t05OTsDAwJKSkgAAAEjHD7EAAAAkdFJOU///////////////////////////////////////////////AFgsDQ0AAAAJcEhZcwAADsMAAA7DAcdvqGQAAADDSURBVChTbdDZDoMgEAVQYUpVWqnYVsSli/P//9gZllgT74Nwj2RIKPAomxbib59WRAmntMuqFKtEPJ9DD1pClbSCOmutL/SNE65NGVUBIxowvNyAppG2lltWtIJV6S40c3+EtWsU6bMPBV0Z/2Jfkw5xwBY7kPoxtZzRH56dSGnMPnRRgXObWo6YSRf9SjXmrRdStI1LwFk03c7v4P3Gznv6srpP8w1Eb6LDCVbEFYQ1UtoW1tCjYmEHAJhsrnHZBfEH5uM0dua09h0AAAAASUVORK5CYII=`

let icon_sleep = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAWCAMAAAAYXScKAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAABCUExURRoaGjg4OHZ2doODg2ZmZjk5OYSEhJCQkEdHR5+fnykpKZGRkVdXV1hYWEhISKurq3V1daqqqigoKGVlZaysrAAAAPKFQrYAAAAWdFJOU////////////////////////////wAB0sDkAAAACXBIWXMAAA7DAAAOwwHHb6hkAAAAmklEQVQoU22Q4RaDIAhGkcwW1co23v9VJ4ITz+n+0I+bqAn8hLMQ0NJgpwizRZ0EiQmWFo3XKiNtZXB2l1qNs4daDINtscwPNiZn09vCsjtLpwWmbmNb6u1FFpi3o9nYJUdUu1BvbzdDmv8HFVL9iwyT1Yp017VaKiSPJl/w1hcoJG0UyycRZuYVqewpVMucPwEgXF+tmh1g/gGxiyEj4ejd2gAAAABJRU5ErkJggg==`

let icon_restart = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAMAAADzapwJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAABUUExURWVlZ52doKiprWRkZzg4ORoaGzc4OaqqrlZWWI+PkigoKXR0dygpKZCQk3R1d4+QkxoaGpydoHN0dmRlZ6iorGRkZqmqrSkpKnV1eHV2eDc3OQAAAA/AVfwAAAAcdFJOU////////////////////////////////////wAXsuLXAAAACXBIWXMAAA7DAAAOwwHHb6hkAAAAqElEQVQoU22Riw7CIAxFESm68Ri6uan9//+0HWUP5CSE3EMCtFXYhLS60K6vBsCqW7as7x2i7Z2mM+fNrkOEISfEASJvrPt+NYJnzzrlXABarAEgwSM7ItD9pP/wuqmfY1NPlnSQcABIV/9gWJtS8IbmS5STtBFfpGcvaSN/0FSPdlJO9ShH1u7UqkVaRf7Q2FQay5jlTWOYPss+hpVZfSGZcZZY9AnEHwn3LJrYrBa6AAAAAElFTkSuQmCC`

let icon_changeaccount = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAMAAADzapwJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAABOUExURZCQkEhISBoaGikpKWVlZZ2dnVhYWKurq4KCgjg4OEdHR4ODg4+Pj1dXV5GRkYSEhDk5OZ6enqqqqnV1dVZWVnR0dKmpqWZmZp+fnwAAALmtJbEAAAAadFJOU/////////////////////////////////8AFCIA2gAAAAlwSFlzAAAOwwAADsMBx2+oZAAAALpJREFUKFNtkIkSgzAIRAmJrYlHa621/P+PdiHHaMcdJyxPwhBILlUxOfaheKhg5zuRG99zVnEfLXTeApQx2ymShmLOeJyKOeP5GrucVvx4WliSBaj8tgFf2avarchrdoseFZsSDxS4hwOmSfVGMrFKK0m2SCPNhN7iDTvDdTj5RK3cmTH8AWslgAWSUCYQCWgwO2uOr5ULukA7HPDmbVToOAke4P36VZyw74V1uYrx7ID7bSFQxn8S+QFBjiUFQfR8yQAAAABJRU5ErkJggg==`

let icon_lock = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAAWCAMAAAD6gTxzAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAA5UExURUhISBoaGnZ2doSEhHV1dYODg56enpCQkJGRkZKSkp+fnykpKTg4OFdXV1hYWDk5Oaqqqo+PjwAAAML1sxYAAAATdFJOU////////////////////////wCyfdwIAAAACXBIWXMAAA7DAAAOwwHHb6hkAAAAiUlEQVQoU42QWQ7DIAxEcUNqBzCl3P+w9ZZN+elEsj1PgxVI86EdJYBjtPqCZc4FshlHYDWaoSQZ1epOS4Ri+B+9ISMh0pahOKqNuevXmVtVVD6a3tWKIOrhTIyC8ImIbR7DWr8g8D9hOne1Zs1SX0+FfP0NdT14R7brvKFoiBGEFQ5VjJe4as4fOYAXb6O5pCAAAAAASUVORK5CYII=`

let icon_signout = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAUCAMAAAC+oj0CAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAABCUExURZ+fn4SEhFdXV5CQkGZmZkdHRxoaGkhISFhYWDg4OIWFhZGRkaurq4ODgykpKaysrKqqqmdnZ1ZWVo+Pj56engAAAJUVA2sAAAAWdFJOU////////////////////////////wAB0sDkAAAACXBIWXMAAA7DAAAOwwHHb6hkAAAAiklEQVQoU42R2xKDIAxEuWgC1Vq13f//1SaABdo64z4tBybZBIO/qthYV5xIsR9GImJHGakEh3ibkif4kEzGGSqeGux88fL6KH8JYwbui9gOy0HE9EgtP/jQUnEgLaLi2AY0glcLbJwO2Gvuk3HagLUlnifjtEWizRc9lsWyhOWhX2zR6/sbfgS8AXvnHZaJMnn2AAAAAElFTkSuQmCC`

let icon_switchuser = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAMAAADzapwJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAABIUExURZCQkEdHRxoaGmZmZkdHSCkpKZ2dnlZWV6qqqoSEhDg4OFdXV0hISJ6enp2dnWVlZZGRkVhYWFZWVnV1dY+Pj5+fn4ODgwAAAGx8JAwAAAAYdFJOU///////////////////////////////AM0TLuoAAAAJcEhZcwAADsMAAA7DAcdvqGQAAACySURBVChThZDhDoMgDIRLHU4tGypuff833UFhCWTJ7kd7fsFegfSnGibHPFUPVXzzs+qdF/tqeN1Km31pkGEuFT+t1fSYpJlS/+DQD6mRjyFSnX+qxnFB9I05Vg81PAh4l0NEjlzkFHsB0rTttBNdBF10pbIMfZfr1GH/QokOhXRKBUHenANHZDvuGcFyHoFDxolty8DvHEuRU8a4s0975nmqzbKDSwqMmwe8gGUZHqT6AYnvI/JsPGabAAAAAElFTkSuQmCC`


let icon_tray_wifi = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAQCAMAAAAlM38UAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAABUUExURaGkp09RUkJERScoKDU2N0JERF1fYKCkpnh6fJKWmK6ytGttbxoaGrq+wbu/wnh7fXl7fcjN0EJDRK2ytLq/wYWIimptbpKWl8jNz3h7fMjMzwAAAHFqJtgAAAAcdFJOU////////////////////////////////////wAXsuLXAAAACXBIWXMAAA7DAAAOwwHHb6hkAAAAmElEQVQoU22P3RYCIQiEFVxLJcv+i/d/zwB1dy+aC4b5DgfU8V9N7DxgWOIarR4QjylnVxA7sAqYLIgSLWqKQ9TulFJV90GKYA/iZ0QAosvgiplbuN50Mge6C2jjZChmogfZJsNOltcC8GyyzQ71aXkBxvQqNOPwitmMLG3Tb27gpYw4sX6EPqPd40r9EaYNM3+Hi/Z4FfMPamMeDfoseXEAAAAASUVORK5CYII=`

let icon_tray_bluetooth = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAUCAMAAACK2/weAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAABOUExURcHDxKWnqURFRXx9frO1tygoKc7R0qanqRobGzY3OLS1t3x9f19gYYmLjG5vcJeYmpeZmlJSUxoaG8HDxVJTVFJTU8/R087Q0sHCxAAAAHyxRGMAAAAadFJOU/////////////////////////////////8AFCIA2gAAAAlwSFlzAAAOwwAADsMBx2+oZAAAAH9JREFUKFNVzlkCAxEMAFCCoFVjuuf+F20W2mk+xCMSjv5iceaZPIDmxRAT/pgDYYmHWyKsJ6EXnnlpF2HnLlzs62bFvozc+y6P7G1LaejGGK5FOhhvEEa7PyZDjTJoS1zgCOVY5j5B50roN8AdiKDFk8gdvsy7avHV3ponLYg+cJUVIXY4MN4AAAAASUVORK5CYII=`

let icon_tray_batterysaver = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAQCAMAAAAlM38UAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAA5UExURcHDxbO1t87R0ygoKaWnqRobG1JTU0RFRpeZmnx9fomLjFJTVG5vcV9gYV9gYkRFRXx9fzY3OAAAAHtCLKwAAAATdFJOU////////////////////////wCyfdwIAAAACXBIWXMAAA7DAAAOwwHHb6hkAAAAkUlEQVQoU22O0RIDEQxFQ1hsdVfv/39sb4T2oT0zwRxxRfCXpSX4vnEdVYGQyLqeWjTnhKMQzW5YlTazfdLmgbpSkp2ebRHmmjwf55SAVi7izYr+dAt2BerT9IHr/upOHUw36CeEifZloZZYloWOtAbMF6I7oqasxp7ZkDV3LC/BGG1Muv8hEJuzb4Y995AfgDc1YxKb14c4UgAAAABJRU5ErkJggg==`

let icon_tray_mobile_hotspot = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAATCAMAAACnUt2HAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAABLUExURZGRkW5uboWFhXp6eqioqB4eHlZWVgAAAEFBQRISEgcHB4SEhKenpzU1NWJiYk1NTXl5eSkpKZycnDQ0NDk5OSQkJIqKilpaWgAAAOjiNosAAAAZdFJOU////////////////////////////////wABNAq3AAAACXBIWXMAAA7CAAAOwgEVKEqAAAAAq0lEQVQoU52P2xLDIAhETUATbdVqb/v/X9pFM5k+9Kk7mQhHWMHhhwy6ZcamVfgjVB8mMLmNhF/wCp2Ixx4NurRC0/ROF1zjQiie13lUoSSgZsKws+IGiRvfYJdEwlzprsji6NYKeiKsAbp1VH+nR5RZWSzmpI+nsqVbzodoLolJY3fFsAM8o6IDBuU9pwS6LUFOeKxnOSc74dI479zENOHQP/D1PoJveAr4AK9sG/kRv0/7AAAAAElFTkSuQmCC`

let icon_tray_project = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAASCAMAAABo+94fAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAABIUExURcTExIuLi35+fuDg4CkpKWFhYVNTUxsbG7e3t+7u7jc3N7a2ttLS0n19fUVFRT8/PxcXF5mZmaioqHBwcDg4OElJSTU1NQAAAB1XPycAAAAYdFJOU///////////////////////////////AM0TLuoAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAB9SURBVChTrY9JEsQgCEWViBnM0Ind8f43DSIYFy77LZB6VQjfpC6qjQXFDlVbhxU/TqLnJfBbAC96GGmwElzW67Yfn2PPQKMRT8Vdr164Z2LM9S/a8oGt/m4AkRaTRgzK784xVw5vvFP8LGOke5jE8SolJ+lLEhZkffeTlB61SBuRtzNJ0wAAAABJRU5ErkJggg==`

let icon_tray_nearbyshare = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAATCAMAAABFjsb+AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAABFUExURaioqFNTU2FhYcTExJmZmSkpKba2tjc3N4uLixsbG2BgYH5+fkVFRX19faenp9LS0tHR0XBwcCgoKGFhYKiop29vbwAAAK5KaQsAAAAXdFJOU/////////////////////////////8A5kDmXgAAAAlwSFlzAAAOwwAADsMBx2+oZAAAAJdJREFUKFN1kIkSQiEIRXHhCemrsOL/PzXk5TS23Bm3g8BV0G/9YRBMMalmtMnZViibbE/M28FOdaxDsRGPmDFykBrjrme2E2h0BhguHuI42RVfFRLKzG1BN9qz5r7PXGBBbqXVfvQYLHKzA3H3JxyseDVCtzd7LAK9LSzb1U8mVgVUfrB7EZGHDReOj1IzW98aZtzQItUnRSsXuD84HW4AAAAASUVORK5CYII=`

let icon_tray_flightmode = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABcAAAAVCAMAAACaPIWZAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAABFUExURTc3NxsbG2FhYcPDwykpKeDg4EVFRYuLi+7u7sTExNLS0qioqLa2tlNTU5mZmdHR0XBwcH5+frW1tX19faenpygoKAAAANc20joAAAAXdFJOU/////////////////////////////8A5kDmXgAAAAlwSFlzAAAOwwAADsMBx2+oZAAAAKxJREFUKFOFkNsSgyAMBQmlsWCo2Ev+/1N7Aih0pjPdF49LiDFOfzO8I9+TcfpLuPLSMxj1dIuhRzD5pG7tufml3mfRdfqaaiLOSPmOO7HZ6jdSLjF6jLP7CLpPhCbOud1eDULf7r+B+OMZ2FT25ICOzeci4gsmziLySCioPjOSR1UQa2PA6xOVSKIvO2+Yb7zxa2Nxw5MKjg5Oj2VO5XN9sC0dDK823snkJ1Q/YnUinb3sfEkAAAAASUVORK5CYII=`

let icon_tray_pencil = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAVCAMAAACeyVWkAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAABUUExURcvLy4aGhl1dXXl5ecjIyCcnJ2tra6CgoFBQUMnJyUJCQoWFhTU1Na2trcrKypKSkq+vryYmJpOTk66urpSUlBoaGlxcXKKioqGhoTQ0NLu7uwAAAJpv7YkAAAAcdFJOU////////////////////////////////////wAXsuLXAAAACXBIWXMAAA7DAAAOwwHHb6hkAAAAmklEQVQoU23P2xLCIAwE0NIS7QXbiuAt//+fbmjqROw+wHAmy0DDR6m0cW0n23bSeDqd+77SgUas5H/UU0cTc7hYnclh0C3B3uAFwbQa9VJmXq7Ar+pkpJtsqjoZQ0HVvR6kjhStsajeuWgdESX5Oie8fg80hpxsHYHeHzOtpo5AifmZXxah7+zG8k2ThhO106CnPfKG/xwp8wfeIid0mVI/5wAAAABJRU5ErkJggg==`

let icon_tray_charging = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAATCAMAAACjpw26AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAABgUExURXNzc1VVVRoaGkdHR76+vr29vb+/v8DAwBkZGTc3N42NjSgoKKampnJycpmZmcjIyLS0tIKCgkZGRo6OjtbW1oyMjKenp4CAgLy8vJqamrOzs5ubm4GBgVZWVsnJyQAAALoprLkAAAAgdFJOU/////////////////////////////////////////8AXFwb7QAAAAlwSFlzAAAOwwAADsMBx2+oZAAAALNJREFUKFNtkNkSgjAMRdtYQssiCuIC6v3/vzRJUZyB8xDSE+aS4rCL6e1MjfO5/0M17WpHh1AAgbkMLM2iiSIlVDGSUjdZt3q03jiSVoeOW3n55DNn9JXp4TLSFUmSDPjRNJVDQiMie3iqb6rvjwlp+SBF0TITHYA5O5LhqkObnVUNeVp2ZWdBBhKSN6Gps9VeVp/oB9Oul8fKHLXK5b2lLpv8Lg+8mQsu5D9xYFnrqzcAH+PbHgg0O3qPAAAAAElFTkSuQmCC`

let icon_settings_system = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAVCAMAAACE9bUqAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAABgUExURcLx8n/m7XbW53Pc6brh7D/g5jnY4zbR4TPL3zDF3S7A2yu62Sm11yaw1lm+3SSr0yKm0h+h0ByazhmSyxSJyA99ww9PZwxJZQlDYwU7YB1ab4CbrhJBZ4+rtoqfsQAAAGT3dWsAAAAgdFJOU/////////////////////////////////////////8AXFwb7QAAAAlwSFlzAAAOwgAADsIBFShKgAAAAKZJREFUKFN1zdsagiAQBGDKBEUJPFXagfd/S2cXLT6h8W5+hxX+X4QXp1/Oe4oLpChLKaVSVVXVtda6adrWmCuEeoaaIPTWWkhmYK1zJCoZONd1kA323nDf9SRh0MSDvieJB6EHDAPkcJkHQ5BkQDBC+AJdjgbjSJI+RMCSPIRMEyQ3mFhygyDHAfcsN86d8+DMFMjyha1+4ptfkPcSD/h/wAeSj/crjoUkVHtl8pkAAAAASUVORK5CYII=`

let icon_settings_bluetooth = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAbCAMAAACkwzTUAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAA/UExURVus+R6Q+wCC/C6Y+0Gg+t/w/4fF/v///8rm/yCS/e/4/5/Q/lCp/Tad/RCK/F+x/nm696/Y/nC5/lus+AAAAFXN9iAAAAAVdFJOU///////////////////////////ACvZfeoAAAAJcEhZcwAADsIAAA7CARUoSoAAAADASURBVChTbZHbEoMwCEQVjSjxVuv/f2sXCGPshAdhz6yEkO5uRdCuJ6JhDGXfAcijN21UfRGGldaQSLsodZUmz+R0dME8L1bADGolqHBy/KJ5Fdm0KnSf0ZMzLYmPQk/kmT8L6Jb4gjpBv/rTxInzJaJW6oLSmp7THkobszisvdLwWt9DRA8zWmbYfbKYweaF8MlW0Pfd0KG+m8XfHp6d7Vb4zoo5ZYewGi3mEvpEStvvVuPBtFN00cfvQ0Wu475/vusUhsl3Yi4AAAAASUVORK5CYII=`

let icon_settings_network = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABsAAAAUCAMAAABLXLayAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAA8UExURT/I8TzL9FLQ9WTT9jC46Sal3RWN0h+b1xOP2hST30Gz4i6c3hGEzgxZpAtTmA5oryhopyhrrX6kzAAAAOqPbFYAAAAUdFJOU/////////////////////////8AT0/nEQAAAAlwSFlzAAAOwgAADsIBFShKgAAAAJVJREFUKFONzukOhCAMRlFFxAXcpu//rnb50DLJJHP/CD0htqPf/WVdXwuYwAaMa4NO1TDxwb4fWfyUDZc4Jm6aIu5qQU4Ms5XSKHvxRvK/0EeWpcYadVndZXUizWmVsRplG5VS9LBknZoJlm2XDmajapSPfdNYQY/RacSdmLxGF+jC3RvwJW+Kjhpj9NQaffC1WvMR3awFHKJT7rWNAAAAAElFTkSuQmCC`

let icon_settings_personalisation = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABsAAAAbCAMAAAC6CgRnAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAACTUExURZ2mrpSdpYuUm4OLkomPl3uDiqCpspegqI+XoIOJkIaOlnR7gn6GjnV8hJacon6Eipqcm/2/M/yyI/qoIdqXPIiCeXF4fnR6gf69I/idH/WTHuGFKXJycWVrcfOJHfB+HKduRPuxIu50Gr5nMfSSHuxqGet8Q/e6WPF/HelfF+qDVulfGOdVF/a6V+poJ++0igAAAGGscjkAAAAxdFJOU////////////////////////////////////////////////////////////////wAfmk4hAAAACXBIWXMAAA7CAAAOwgEVKEqAAAAAwklEQVQoU53O2RaCIBAGYNRccmnRNitbLNsX3//pgpmJEOWm/wL4+Q5zYLU5/xizjMYs22ScHIMhdZqgntixqhHkwgGqGs8napvnB47bh6NunEIi3YAiKk0TFH+paUxQMqCmGrMCm9OQqmojO3RiVyFp4zSbTJNoNqcuQrZIs3y5WhcFVgwa0Ga7axDZHqg8QJFBy/Ijp+oERQbszF9dyup6gysZMBhY3R9w8wu3Jw5skTB89dIG8uBf3rDqQetKXX8AoDB228yl/o8AAAAASUVORK5CYII=`

let icon_settings_apps = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAYCAMAAAA4a6b0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAClUExURZ+osZ2lrpujrDfF8jPA8JmhqjK57Cmy65efqCOp6Jaeph+k5Rue45WdpWeyzBWV4HKswg+N3ZKbo2WvygmF2pCZoYmapHq66I2WnUWy6Hu451leY1VaX1FWWk5TV0tQVIOLkyWLzj6Bs3qBiKWqsUlNUUdLT36GjnZ9g0VJTHJ5f0JGSm51ej9DRjw/Qmtxdmdscjk8PzU5O2JnbTE1N4uPlAAAALkcdVwAAAA3dFJOU////////////////////////////////////////////////////////////////////////wAQWZ2LAAAACXBIWXMAAA7CAAAOwgEVKEqAAAABCElEQVQoU3XN2XqCMBCGYUGpSKVUBCuVJYWCbLKb+7+0zkwS7UGbEx+/Nz9Z8f8OyAqPpuk6hfWGflAE6LphGPB/vXnZPgXvQzdMAdudFE2AaZqWhNe9EhxAt98U7B0S2S37XYHjHA4oBLbtuscneB4J3LcA/NMv+ECBB6C7vn8+BQo+6R28jx0ODx4LFOoEZ84DtUC5XMIwjKI4ThLG2JfnpVn2TUI9gp4XjF2vaZqVZSkEe5zkeVEBZBlCTfLoVYOAvW5J8IG8KKqmudGgBpCi+q2Tg7bvSfBDDUEnB30/kKhBN45y0A9CZO/GaZKDYZhJoNNgmpZWwDwLuau+LHIwz3eSvw/nPwbOT41d7uNGAAAAAElFTkSuQmCC`

let icon_settings_accounts = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABcAAAAbCAMAAACgNuTpAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAABvUExURWPYzTHPviPNuTHOvWfRxiLKtyHItCDFsh/EsB7Crx2/rBu9qhq7qBm5plDLvRi2pBe0ohazoBWwnkW+sxSunF7DuROsmhKplxCnlSqtny+0pg+kkw6hkEW1qT3RwTzOvSi+rW/FvUe3qyqqnAAAABkXsmcAAAAldFJOU////////////////////////////////////////////////wA/z0JPAAAACXBIWXMAAA7CAAAOwgEVKEqAAAAA10lEQVQoU53Q2xaBUBSF4USRoqNKuxDr/Z/RXIdsDFfWVfO72I3xB/T7vAercL2x7zcPwyiK49jWy9m2290usW3OliR7XKpgnjCmaZplBwX1o9khz3P9t3kGhBVlWdUi6huzqmqak4i9b9a2badgXrN1Xdf3ZwVzGticc8Yvp5Nz4zhOtrx/3T9+Cf1FuKv6slFUoqKquJ9IKk334jJ1ox7ycVO4bp44hMqLQvzmd4lDqEGclolwXE7SsZNtCYdMTOI09HzIhkhaTp1ovp+R7THNthf/PKInbVI/Sxos4p0AAAAASUVORK5CYII=`

let icon_settings_timelanguage = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABsAAAAcCAMAAACnDzTfAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAGAUExURcHq8I/f6G3k60XW4i7F1TDG2Vvb6G3X5aHX6dju9WDW3y/K1zfS4D3b5S2/1Cm90zTQ4Ca00T241Knl7TzO2jTM2ye50yq81yKtzyKpzFG01dXo9JDg6C/N2CjB3R6jzC6gzuLt9Sq60SWwzyW21S3J4Bqcy0fO2hyZxheXyoi/36jj6yCu1BeSxk/U3ya72huq0xij0s3s8xy12h+y1xmu2GjE47Pf6la3zpPK287j6+jt8ubr78Dg6DWcwR+RvhOLxhGFxCiGx5DJ3+Ln69zg432uxg+Awujs8uTo7dre4KjAzA59wnJycuHl6N7i5dTX2BWIvxl9xGZmZtnb3sbIyT+VvBGQy0Wf0unt8svNznGyxBOp2HDF5p6tthd8tw16wAx3vwpzv9Pj8tbY2q+wsWCi1YmKis/R0ru8vYyfrIu54N3g5NLU1WyRqeDj6aampyiHx7bT6tLT1Kmrq2GLqOLu9cfLzbGytM/R1MLDxMLExujr8MTHyeDk6QAAAPWb4DYAAACAdFJOU/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8AOAVLZwAAAAlwSFlzAAAOwgAADsIBFShKgAAAAeRJREFUOE910uF3klAYBnArKAsFrVBZDZs6kiUpDSqbpTbYpm2IQ7Jo5XBaUrNcWlmr+Nd7781ZH7bn231/53nPPffcgH92/rPAufMXCPLipeDs/M8uX6FCYYJmyEj06kxP7Np1igqzDBOLReIJbuEGms3s5uIixYYJJhaN8iSXTN5amluAoigiEmJS0Wg6s8wlBWFhbrcpgqBDLLTSicRyQhCy4srM7oCkUiE6DcJxfE4QRAm2YrvLkgRNR+h4PB7LZPh8rlCQ5SC2eywLRJMpsHw+z/OriqKq97E94B4WH62VHheflLOQnCJJlUr1Kbb14hqkVNL0jXJZyhYURNVNbFtYajVNqz8DlBVM29hKCHY0zTAa5kazKauYdpEhqWkWSKPRsp9Lsiq2ofkC7CVaZhgWiK63nFfKKkTd23sNtoXEaFi6rtfrLedNRxY3t/fd7gEYAqhYSFo9p98pVBC9RW8GAMv0Hcuy3vVMG6wKtHuADOZQQZ1ezxx475uy67rdD3D/gH+IAYs5tPsfxbbbxQT2ycSAZOh4o4683z36jAjMPxyaSMzh2PEmX4T20cpXTMj8b/ZgOB4PHNubTNeD+KvgIPO/ez8gXn90jGcnweb//DWdjKbHv/Fhnr92es423/8DnuP38HCXAokAAAAASUVORK5CYII=`

let icon_settings_gaming = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABsAAAASCAMAAACdBVWvAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAACuUExURczU28TM08DIz7zDyrjAxra+xbS7wri/xsbN1NHY38jQ11FVWaGpsKSrskhMULK5wK+3vquzucPK0M7X3Zqiqa21u6mwt7S8wo+pvWaawqeutba8w5adpHyiwAB30w96y56nrqWts19kaHF2e1GKtwBuw3iSp7vCyI2grxJttJykq6Ssspegp52lrH6Ch52rtpObo8PM0ih/xJ2kq87V25CYn7O6wFmEpsTL0AAAAHNeaCkAAAA6dFJOU////////////////////////////////////////////////////////////////////////////wA3wP8KAAAACXBIWXMAAA7CAAAOwgEVKEqAAAABJklEQVQoU3XQy3rCIBAGUAMkXgKBWBKVppRcq2m0Vhtb3v/FOmDctbNgwfnmZ5iZ/b8eNgsChBDGhITRfDHduWO5WjmKKWZJGHEh0vXDnu6EKCahBMrSNN9MBoI5xxDom7LtbqvYs7dVgDImCyUmetH61VDqLQhSVVZ1nvF7XqN12xnzBrYMcF6yqlYZB8ryfH9oD7KX72ABivqqSpI4dl25UmzfDUc5DGAIheWpTuL6FAmgj93OmF4OxRnsExPO07iOCAEqL1o3nq5gXzA6iaoTxkKVjLZaXwag8QZmYfQQE4y5I9O07XdxPo+j/8OP+5UQkEepOcqu83S772Xjt+Spl+6pcRyv087swo8OTTB64Ym5a2/WrueOoGmAvCvkuZrsj7L2F68hPVTLmNMTAAAAAElFTkSuQmCC`

let icon_settings_accessibility = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABcAAAAbCAMAAACgNuTpAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAB7UExURUyu5jKl5BWV3xKS3hCP3SeU3Q6M3AuI2wiE2bfZ8SCX4AV/1zap5Rqc4jan5WG46ozE7AB51Xy66IDC6y2d4S2c4avV8EKt5p7Q75nJ7EOi4bfY8ZzN7RCN3IzD7CeT3RWJ2iGM28Xe806i4V6t5miu5BCB2Hy76AAAAON6Ig8AAAApdFJOU/////////////////////////////////////////////////////8AUvQghwAAAAlwSFlzAAAOwgAADsIBFShKgAAAAPBJREFUKFNt0Q1TgzAMBmA+Kq2LEysTgSmIzJn//wt9m4STY3uPu6QPoQcl4/vZeJZvF1aZ86J0D9ZvvXCVD9arP0p38J5IuhT40/G5RvcSKL6iNqfyLXl7THnvmHvczMqydK7VeUlRN9mhEJZ55raG4ipUh7Pun9LlULA7NQrm3Nmw8b+LuuqOJ751KLhKX5Cy+gf0s6r8jWPWI3sfRX3Y+yAawmDr1aFTP4Wwnqj5iOGex0BkG5ljMv2TL6JZQf0bWy+oCxGlU1v9gvEW9Uwx/oioT8Gev8Z4lUYd+16k+Y0xSqM+zut7L/MoVX0f5j+N8kejdOWmygAAAABJRU5ErkJggg==`

let icon_settings_privacy = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZCAMAAADzN3VRAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAACiUExURb7GzcHI0a+5wqy1v6yzu6qxt6autaOstL/GzbS9xrK5v6GpsJ2lrKWstL/Fy8DJ0rfAys/U2dTZ38vR173Eyri/xZmhqJScpJKbo6Cor6GorrrBx4+WnouSmsPJz9DW3MfM0rW8woePlq+2vYOKkZmfpXyEind+hKassrvAxnN5gK+3vo2SmG91e6Clq2txd3h/hJWbo5CWnn6Ei5SZnwAAADQZlHoAAAA2dFJOU///////////////////////////////////////////////////////////////////////AKGPTjEAAAAJcEhZcwAADsIAAA7CARUoSoAAAAFDSURBVChTddDZdoIwEAZgRRJMSBeWBBWCLCkILdot7/9qnYSoeNH/Bma+M3BmVvq/LGW1fqjcU2tv4yOMg60rb0IANhSFIXt6njsg65dXD/okipOUYyGybLc/GFkTAkCSOAbJCRJZUUh5sOKlZRQfQaqc1zX1QyEbKx45zokrA23ro0JZ2ZDoLpQCIKnejPhelEQmx9KNYNkZWWE/gRgq3QhurGyDwIgxEDOCcNefQHTI8hJSVRXHAazKRNb3gxHGEOc8T9PUN1vCNt042hu8C9HW1pDtSzWOH/Pdsp2gdV3zHO+g3zT9NM1303lRsBaMYwOqm6azE72XjWgprUMYUP10+TRNK/pLqQJRyhqlRgdO9LfqVEiZ6m5wFX3q+l4W8KWL+YfJVfTwM44TDAyuvovWZxiAPa5ZiB5+3YvNUpbR+g+1UVXQCu//jgAAAABJRU5ErkJggg==`

let icon_settings_update = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABsAAAAbCAMAAAC6CgRnAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAADMUExURaDT8We56jSl5Ceh5Bqb4heZ4UCp5Z/Q74PH7ReX4BWW4BSU3y+f4RKR3h6V4BCO3X2748Lh9O/2+v7+/2u56SiU3kam5OHv+fn8/dvq9KTO6bLS5zKb3ojH7g2L3H++6jGi4urx9l2k0hJ/w2es1w+J1AuI2hiN3CmKxw+CyRGM2AyD0pzL7mKv412q5J3I5gmF2UeZz0OSyQeC2AuF1Qh6yAV7zgWA183i8DCT3gN91pjG7COCxCCK2gJ71Xm35wV1xAVwvA+B2AAAANuKuiEAAABEdFJOU/////////////////////////////////////////////////////////////////////////////////////////8AcdKPEgAAAAlwSFlzAAAOwgAADsIBFShKgAAAAZVJREFUKFN10dtygjAQBuBqsVUqoiDSqI2NBxQQRSFA49m8/zt1N9DDdKb/Xfab3WzgQf6fH3uo1R+1xlPtuTr/WPNR07RGo9HSX9rNqlZZvQQQTLsslqaaWhUZhtFRVWVA2PRNhqkQra56tG7Psq1eH6Rlmk5pTSR94L6SYXfk2u74zTUpnSir47R3xqYzzNxye/aCeku0Z3URISt/EQRBOFtZth16nrcGq+m6/tK35n5gmJBo3ittA/aEu423volEB68QK4zj2AFTay/8AIXScLfb71dgyRINHxQAgVAv9TnnWRonSQLWwbeOBxA0z4NxKHkO1sZ7CGPMGoAgFRHSB1gNKGBsOJ3CdtjTt6I8yQXuuQZbMEZWPFXjxi7hIhfiACY7lKZsVJAIJei6xTETQpzUN5vAdkX3WLBiuB0SNjpyIc7nS/kfHC+dXfltOiKs2O5v/AwEbcrkMg7DJLveMNfsDLljWRkgvijLeKakpMqkgy+C5WAaBAdCKpOX0zfdYQ2VL5PysPmA+mlzqM6/7W+k/ASCWXrzowgnawAAAABJRU5ErkJggg==`

let icon_settings_display = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAYCAMAAACsjQ8GAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAtUExURdLS062tr5OTlGdnaBsbG4aGhzk5OikpKllZWcbGx3d3eElJSbq6vKCgogAAAGDbshoAAAAPdFJOU///////////////////ANTcmKEAAAAJcEhZcwAADsIAAA7CARUoSoAAAAB9SURBVDhP5ZFJEoAgDARBRwgu8//nSiQeQIUH2IccmE6FShwHFMH56YG3SMuMV+ZbWBCsqyJgMQFR1ScRuWTBQcpDi0BTMn0L6U/CcFFEKA8twVadjyl2nwrBagI3u2/DptklcLemCn9FRejgeEiHIwvRJr4SdUTqMPwDeQJFXR9x/1GfeQAAAABJRU5ErkJggg==`

let icon_settings_sound = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAcCAMAAAA3HE0QAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAtUExURdLS04aGh6CgohsbGykpKpOTlLq6vHd3eElJScbGx2dnaFlZWTk5Oq2trwAAAGtozb8AAAAPdFJOU///////////////////ANTcmKEAAAAJcEhZcwAADsIAAA7CARUoSoAAAADQSURBVDhPhZLRFoQgCER10cy1+P/PbQat0x5rmYca4ZJoBHX0BoQ4Mm/AR1JP/QB5GQYqg7gDq0g3FiyyXr4Leak0oae+krmgNa1SWgdgjUj84AUgryeABYszQgRqbK1tXBDYI1JBEjl+IuiOrSHkDeg7Z3sW2QEkWSrECgKjWDY8FpQFPc8GWQ8sYxcMSHsAWKYaaZmbgYoyNuECvPZHwN1iatI9pntR7lUP/flZQ97vZvgaGHY4DYwR3VhwHjls6gztXc9jf1Pgac2M94tUD9g4J0QrhNCBAAAAAElFTkSuQmCC`

let icon_settings_notifications = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAfCAMAAADDR10IAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAtUExURaCgollZWSkpKhsbG3d3eMbGx4aGh9LS062tr7q6vJOTlGdnaDk5OklJSQAAAD6ZJwIAAAAPdFJOU///////////////////ANTcmKEAAAAJcEhZcwAADsIAAA7CARUoSoAAAADQSURBVDhP1ZJbEoQgDASBQUFF7n/cnYSoUbf2f7tKE2jlmdB/4GSICUjR91jsGSfZug45JaS5SFZmppodsgKzJsoMLJqoLAlVW0a1f1VGrBIuAqIGPstIPVEHFrnZFI4FG98ikbTjRgJflOU9qozLJVFO3+X0l1JO48FmMt+vZFDlyikhJ/VCegOv5ywLTwZVb3KKbwoaJdL6Fd5L6LvV3ItdFlTHlw1ZQkbT5sotUBrrKCQLyiU5OffNArYmcZLF2xr8iTjZF65t97Xm5YPeP1ugJui59gG1AAAAAElFTkSuQmCC`

let icon_settings_focus = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAtUExURa2tr0lJSRsbG3d3eJOTlCkpKtLS06CgosbGx1lZWYaGh2dnaLq6vDk5OgAAADq4ZeEAAAAPdFJOU///////////////////ANTcmKEAAAAJcEhZcwAADsIAAA7CARUoSoAAAAFZSURBVDhPhZPBgoQgDEOhwoji8v+fu0laUHcOm4OD9ZGW0knjHz2BxJdseXsF43eMUs0+Y+BpVrcI3sDODwq3chDZFV7AhlDxJUW305cOZLOuxVKfAQFnuMP/as1XKEcS0CN7Z4Ewc+YyfvQUwuHzsxUhyn9axRNA8mzZKmkBlhmpBBGrduHt9GAA8ii0SCOZ4aXJDwrAWIdha0ILuLWrIgVdzHvAKOHJDk2DBdC22AGAPsgwGxWflYPZCWDZZPMXaDdwLQC34uLRahaA8u4UvBeJx4C+ihwfTYSKpNJo6us6pkqD6NjVB9dqFKQymMEbBZCP2WoKZTxaPXbfHJcFpTovC9UxVv0Ift2lz3Hr2kgAVakL74EBz1bIFVVpD5g1cnMMPS2IQ4ulzxzTqItjP8cUwvIIzwD4x9nxn0mtXQWnnOEbQHoeJ/RwuwFo10UdJ6ufegHfGuMXGgIn/GzVa70AAAAASUVORK5CYII=`

let icon_settings_power = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAgCAMAAAAynjhNAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAtUExURUlJSRsbG8bGx7q6vCkpKq2tr2dnaNLS0zk5OpOTlHd3eFlZWaCgooaGhwAAAOeEghgAAAAPdFJOU///////////////////ANTcmKEAAAAJcEhZcwAADsIAAA7CARUoSoAAAADySURBVDhPjZLZFoMgDEQZAVFR/v9zOwkRcTnWecCE2ywNceVVF+yuvn1NgBmmr3jQ03B1KMM+QK8qHhC8fHccgVENix6BqIbiiFC9VjuGygUzVxKbaq2lWk3wZJmohplx4kk8W13RgVl/VhyOqx4XBMEei/lUjxd4Yjmb+plLnCuuCzgLhFriWWyKOJt3U/6C35P/aW05RnpW1D/mu5meNOpY+CLmXyRvQhyfe89SVIbosNabXisbq5hPf+uOCyQrIpj2NX61ZVMsq5X3faJS3pev4pIckK1CzICzHxvm5YSmqbXSMBd2YxiTbF2ZDt9Vyg+45CxSLfZwWwAAAABJRU5ErkJggg==`

let icon_settings_storage = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAOCAMAAAB5Au6AAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAkUExURa2tr4aGh1lZWUlJSRsbG3d3eMbGx2dnaJOTlLq6vDk5OgAAAHjKkzMAAAAMdFJOU///////////////ABLfzs4AAAAJcEhZcwAADsIAAA7CARUoSoAAAABVSURBVChTjZA5FsAgCAUVP1HD/e8b0HQRyBRQMI+tSIIJpdKRuooiDS7NBAZdDgRWAVizjmjNE6hb9IUBTE1Bh1v3C4XNP4HR36s+7DPTR+WvjhB5AGbeDcEe8vm7AAAAAElFTkSuQmCC`

let icon_settings_nearby = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB8AAAAcCAMAAACu5JSlAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAGYUExURTs7PFhYWMjIydPT1MbGyBsbGxwcHE9PUNLS01lZWcbGx0lJSSgoKR4eHkFBQl9fYJeXmFBQUEdHR2BgYR0dHYKCg7e3uCIiIkVFRT09Pbq6u3h4eVFRUV5eXoiIiSYmJkNDQ8/P0KioqU5OTiAgIDExMjw8PEFBQXR0dZqam42NjioqKs7Oz3l5eh0dHjk5OmFhY7OztZKSlC4uLj8/P1NTVMDAwo6Oj4WFh1tbXJ+foEZGRiQkJENDRJiYmUxMTcfHyVlZWrS0tcLCw6qqrJKSk4SEhYyMjpGRkiMjJFJSU8rKzNDQ0iMjI0pKS8LCxJGRk25ub0ZGRzU1NYqKi87O0JOTlZycncrKy0tLTCEhImtra4SEhKSkpYyMjNHR01dXWIaGh1ZWVouLjEBAQWlpamVlZigoKC8vL4yMjczMzSEhIWtrbFpaW7m5unFxcm9vcICAgV9fX5ubnU1NTmFhYTIyMz8/QGhoaR8fH09PTyUlJT4+P2pqak5OTycnKMTExXBwcRwcHVRUVNHR0sHBws3NzgAAAHMqj7UAAACIdFJOU////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////wAYt9YPAAAACXBIWXMAAA7CAAAOwgEVKEqAAAABbklEQVQ4T32S11bCQBRFEb0qQcQCRlARFQV77xV7w4a9K/aOXbG3+W3v3AlEEN0POSdnz1rzkGjY/0TzmhilIIrXErHU4yA+gQqH+0QdKNAkYdFTQ7hPMiQbiRSaJNCnGtKokk83mZUXQQbomFnOFC/owSIqx5qVDbKcw5gt106DhuXhcYX8AkdhkdPlKsZeUuosw9DgdUFfXlFZVa10xmpq67Rh3miobxBN0MgvVn0TNFOGaIHWH97a1k5riI62zq4f3u3o5tHT29ffP4BlcGh4BCPoRz1jjI1PTE55vF4+THvcM/x80M/C3Lx5YbF1aXllFQezbFzjOuTXYWNTXvdZsUqwtb24Q1b1u7Bn2T+gSYJDOKKGBD3A8YlYcIBTpar+zD8qBuTcz5/h9//i4pLiT38FEg/+faN6neqvaYjgRvxs6G9NNqph+O7uKdEze+DhMYKnwPNLyLNXuIvg7f2DtPDIZxhfyqr66DD2DdnDZpGeX3lfAAAAAElFTkSuQmCC`

let icon_settings_multitasking = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAeCAMAAAB61OwbAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAADGUExURaSkpoaGh39/gJWVlri4uWpqaykpKjc3Ny8vLzw8PKioqaysrRsbG11dXqmpqqGhojo6OpOTlIiIiVNTVMDAwkVFRjU1NioqKiIiIkRERZmZmqKio2NjZB0dHY6Oj5CQkaamqB8fH2BgYba2t6urrTQ0NV5eXiwsLCUlJSMjIx4eHykpKTExMbe3ua+vsYCAgXR0dUhISZqam8/P0DIyMry8vaamp5aWlzU1NT4+PllZWqSkpXx8fGtra3BwcYuLjNHR0wAAAIgLsF0AAABCdFJOU///////////////////////////////////////////////////////////////////////////////////////AEQWEAAAAAAJcEhZcwAADsIAAA7CARUoSoAAAAC3SURBVDhPvdLHEoIwEIBhLKDiWrD3hhUrVuzm/V/KhAkSdyYyXvgP2czsd8ghCgnoH6BEoqhYXASqlsAlU7oP0pDJ4nKQ94EBBr8JAYQF9AKtKAWlcqVKq0lBHRpNWksK2uDeO1JAD5b8kWGCrju/EkGvPzBxQxj5gIwn05mXBRYb88VSAGS13njZYLOx3bEf9QFCwotDAXswDzgVjnxPwclxzjjtwtcMkOvtjno8X3ztgt8FAELeCLHEVyetsv4AAAAASUVORK5CYII=`

let icon_settings_activation = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAMAAAAM7l6QAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAGVUExURaCgoX19fVdXWExMTcjIyru7vVtbXTs7PC4uLiYmJh0dHRsbGzc3N2FhYS4uLx8fH1BQUJmZmsLCxFxcXcDAwjg4OVNTU7W1tsrKzF9fYCwsLLS0tr29vyMjI4yMjaWlpiIiI7Gxs9LS0yoqK6urrRwcHEdHR5aWl6+vsaSkpm9vcIuLjDU1NiIiIszMzSUlJScnKMXFxmZmZtDQ0XR0dYGBgqGho3x8fba2uMnJyj8/PyQkJJqam8fHyV1dXk1NTcPDxD09PTExMsjIyby8vTs7OygoKHZ2d7q6vDk5OSoqKn19fllZWdLS1FFRUSMjJJOTlK6ur4SEhTQ0NM3Nz6enqDU1NSAgIW1tbtDQ0jMzMzAwMJKSk0VFRp+foYqKi9PT1WNjZEBAQZiYmaamp4mJiysrKz4+PlNTVC0tLkNDQ8TExp+foEtLTMbGyIKChEVFRcPDxVlZWnBwcYmJij4+P6KipB4eHnV1dqKiozIyM56en1BQUjExMczMzn9/gCYmJz8/QHNzcykpKpubnSAgIAAAAAbpj7cAAACHdFJOU///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////ACL553wAAAAJcEhZcwAADsIAAA7CARUoSoAAAAGXSURBVDhPfZFnU8JQEEUjKBI2GkFFRFFEUSxYsBdibyhiQey99947yvvdvpZMMuN4PrB375mUFwT0L3otpJnMZnOakM53jKYzLJlW0QYAolWyZPBS01nZco7dQZLDnitnZ9FS1Xn5srOAJoqrUHYX0UR1sQdK6KZRCt4yMon2lUMFyXoqwO/Dg+hKfxWtDARs+fgX62pQX8RADdRSXRes542RhkaimyDEd5XmliYyWqEN63booKVGZ1d3D5lhULDuBVpq9PWLNSyJA1g3cD3IxtDwyChL5EIBAdNj4/SOBeORCbpjJnU6OhWbRmhGcs/SleAkeo7fPG7ylMwnrPiwKokFrBchzLYlxbu8ssoyBdawXocNvm5ube/wSNiFPazR/gHfETJ8gUNvnOhF0F+jEVgoZP/YkeRijYHj2AnTp3B2ziodCn4y0+gCLq/I1HEt35BBNbqFO915Ebq/fHikgWn09Bw5XlXP//L6JtpZ5hq9f3xGEl+hZDL0Jbm/W9R3VTX+6D9KXSoYTDUqP1Fe6fWf/KsR+gXk2Yd2LYwwfgAAAABJRU5ErkJggg==`

let icon_settings_troubleshoot = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsIAAA7CARUoSoAAAAQNSURBVFhHzVddTNNXFD8s7tWFuDcgfLelazsG4lyCsPBRGC4kLiogEIgsMZPORSibyPTBSfagMQ2LGqcmowoqyCAtlAGFEFDaYltYITzwpCgJhAcyX/TteM/JfwT8I/1c5i+5Ob333Ht+597/vb97C/83oiQbEXi9s7i+vi7VAKKjoyEjI31Hjogk0NPTiy6XE2ZmvLCwsCC1AqjVaoiPT4Ds7Gyora3ZliusBKamnGg2/wF2ux3i4uIgJiYGdu/+SPICuN1PYHl5GXbt+hCePXsa0dUWpKNYXPwVarVarKv7Fvv7bSi5GJQc+RMSEtBg+H6LLyIoLS1FlUqFJpNJFnx8fALJn5iYiI2NxsiTG40/olhuPHfuvCz4yIgdS0pKBHkSnj3bIvO3tv6Kzc3N4SWVlpaG+fn5siADAzbU6/WYlJSEFy78IvOfOdPMiVHyvb19oSVx69ZtDnDlinzp8/Ly2Gc0Nsl8p0838CehBKmPwWDgPh+wNwh4vR62Op2W7WbQuSesrKyw/Rf19QYx4z+FJmRAS8vP3OZwONgGjYqKCp7B1JRDNkuPx4tlZWUozj6fDKdzmi3VqZ381I/GU+FBweL48bp3JkDw+ebx2LFKQRqPRUXFbKlO7VKXLQkE/QnEQLbPn79g+zZ0Ok1UZ2dHVG7ulzA/PwdkqU7tUheG0A/pVxAYGxtH8R0xNVWBDofT7xJaLP2yPteuXefZm0xtfsdvwfCwHffuzUKFQilUbyC4wZtAykkxpGpgGBwcQp3uU1QqlTg8PBIyeXV1Nc/+4sXWwGOQxpPkKpUqnJiYDIl8etqN5eXlvCFramoDj9HXZ2FVU6nSxHU77Xfg3bud4ui5NgqNP3XqB0xOTkZxW2JDQ2Pg5HTHx8bGMvns7N87DvT55lCt/oT7v11oyffv/wK7u3u2jbHtHX3v3gMhpw2wZ8/H0NHRITbO1iO0GW63B6uqquD161dw8mQ9LC0twcuX/7BPo9EK9cuEgoK8wN8C7e13OPN9+z73u1yPHj3mvaFQKNBqDf1kbODmzdtMfuBAjt9go6NjTK7RaNBm+yt88qtXr/NGKSgo9BvMZhvks0yiNDQU+rHcgMVi5c2i1xf5DUb3OC05bSy7fSx8csLhw0c4AZfryY4B799/wDKck5OL9OySmsMHkVORqtuivd2MKSmpWFhYiJOTjyNHThDv9x0TuHHjdyY/ePBrcQ37v4SCBqkVJXDp0mVZ8La234SSpeChQ98gSarUHDGwQHg8Myw8JCKVlVXi30w8OxcXF+Hhw27IysqCpqafIDPzs8AFJUBsBLRa+7Grqwvm5nywtrbGbUIT+B134sR3kJ6uizg5QRbUbL6Dq6ur/JtW4ujRI/8J8XsCgDd5qASb2/kFbQAAAABJRU5ErkJggg==`

let icon_settings_recovery = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAcCAMAAAA3HE0QAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAD8UExURZWVl1paW5CQkSwsLCkpKoqKiygoKCYmJ7i4uYSEhiQkJBsbG5OTlcfHyMvLzL6+wCEhISMjIyYmJicnKFRUVLKytEdHR1dXVxwcHB4eHlxcXExMTHV1dkhISFNTUx0dHXFxclJSUoyMjVlZWisrK8PDxXt7fLS0tsXFxlhYWdHR05OTlJ2dnpiYmrCwsnp6e7q6vC4uLi8vMMDAwqqqq0JCQnBwcbu7vIGBgUBAQHJyc7m5uzY2No6Ojn5+f2dnZz09PXNzdHl5ejIyMtPT1ZeXmWhoaU9PTzk5Oa6ur3Z2d7e3ucTExWxsbYWFh1RUVYKCg8XFx6enqAAAAImLqYsAAABUdFJOU///////////////////////////////////////////////////////////////////////////////////////////////////////////////AFP3ctEAAAAJcEhZcwAADsIAAA7CARUoSoAAAAEwSURBVDhPhZHpUsJAEAbjFZVPvFAU8Fa8oiJREEEEwo0C4rz/uzjLTi7LYP9Iemc7qa3EoH8IBMacSAg/mF9YFAvhBUvm8opoCDdYjWEtvq6QgYsEG5vA1vaUxM6unmncNySBPU1yP5WWocI7QwYHYvEMDkUZL6Cj4xMxOsWZWDCg8wvvgLGESCigrNyJLnEl5gfXN7dijAVLzA8M3IkxFu7F/OABOTEmh0exwBnytghj50V08PSsKKCoR0RFFKajF3YOSq8QyhW1XSnLEm8lFVSRftfUzHrDcRp1syaDNKocNNFSzynanW6v1+20ZUktNDkAZKnI9vv6cw0G6sp7vwKXD+CTb9EBDYfqOiPQTAN7VmBzMML4K4IxRhyQkzIjSDn6U0++I5jwpv+z/oToBwHn8S+Q3n06AAAAAElFTkSuQmCC`

let icon_settings_project = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAaCAMAAADhRa4NAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAADVUExURb29v5OTk4uLi6KipJaWlzc3NywsLDIyMiAgIGRkZc/P0Ts7PJWVlp6en3FxchsbG3NzdaCgont7fCoqK5OTlLm5u6CgoWBgYaioqcDAwrW1tlVVVkZGRjMzMycnJzk5OUtLS0FBQSMjJICAgoiIia2trklJSnR0dcnJyllZWcbGx1xcXUpKSmJiYtHR0h4eHhwcHEhISCwsLSgoKZCQkWVlZkxMTFxcXK6usLKytCYmJiIiIyMjI1NTU8vLzKmpq4mJi01NTcjIyVNTVENDQ7W1twAAAKjuf3MAAABHdFJOU/////////////////////////////////////////////////////////////////////////////////////////////8Ax5xWbwAAAAlwSFlzAAAOwgAADsIBFShKgAAAANNJREFUOE/F0cUWwjAQQNHi3kGLFnd3d8n/fxJNZgqlcJAVdzXJvNMuIrEPfgkki9XExm9xqbE7nC4Tt8cQeJ0+f8BEhuA9CEGYJgOI3IMoRGkyAMDAG1OUOMQVlEiKJUdBKp1R1SxkVZTLy7i+BYViqWyUdldwrwdQxaOuAjWaMKhDg86kCS2aMGg+B/rFP4N2XeiAzIPucwA9oT/A1xyOxg8m/emMK8+1JQ8Wy9WD9YZ/h/CAben9yU5siAjekdj+8MLkSHstOJ1fudD+m1+8xdgVmey2DFzJdb8AAAAASUVORK5CYII=`

let icon_settings_remotedesktop = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAgCAYAAAAMq2gFAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsIAAA7CARUoSoAAAAJNSURBVEhL5ZZNbxJBGMe3Xup3oLwt7ygYMJy4dL0UD10MoWuCBRJqqbWlNUVrCh4KJoAJWltN6qV4qqeamtTUpESktKXEvoSi34JPwOnv7mTjrS5rMgfj/7LZJzP/X+aZeZ4Z5p/XxkYFk5NJyL90tL7+Dh6PBw6Hkx5odfUNXC4XrFYrtrc/0QGVyy/FVThEiA27u1/oQAqFIiwWC2w2O2q1b3Qgy8s5GI1GAjk6atKBZLPPoNPpYLc7cHp6RgeyuPgUGo0GTuc1dDo/6EAWFtIE4vF41QGkFDQaB31Nmp9/RCBe7031q3C7b4ibacPeXlVx8vAwh6EhLfL55+pB1epX+Hw+UgM7O58VDUZGAtBqtVhbe6seVqvV4ff7xXqwYmvro6IBzwfJiSuXX6mH7e8fgOM4Atvc/KBoMDYmEFihUFIPOzxsQkqN2WxBpfJe0WB8PAq9Xg+pcOVQ/2q1vmN0lBdhZkjdWA5fqomJ+yLMgEwmqx52cnKGcDgMk8mMlZXXigYzM7MwGAxIp5+oh52ftxGJ3APLmlAqvVA0kApZ6nup1Jx6WKfzk6yMZVnkcnlFg6WljAhjMTX14PfYK/L3j3K7rw8MDl5ler0e02635ejlKhYLA/F4nOl2u3KkT6XTj0k6eJ5Hvd7oOyXHx63+0zc7myIbHAqF0GyqmKhG0itGOrKCINC7a6LRGCnCSCSCiwtKd40g3BXbih6xWIwOQFIweIf0rkQiQQ8SCNwmrT+ZpPjC5LhbBDI9/ZAeRJL0fP2rtvGfimF+AcH5IXiRoRmhAAAAAElFTkSuQmCC`

let icon_settings_clipboard = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAgCAMAAAAynjhNAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAqUExURbq6ujk5ORsbGykpKZOTk8bGxtLS0oaGhq2trUlJSVlZWWdnZ6CgoAAAAMcl2swAAAAOdFJOU/////////////////8ARcDcyAAAAAlwSFlzAAAOwwAADsMBx2+oZAAAALNJREFUOE/tk8sSgyAMRfGSiET5/99tXrXijF130bMhyTG8Bsv4yqnLAqdSFpzQzCWkQcxeNFSv0dey4EndMhtjQRfp2NkhLCICnBrdgu5dSl01a4hVy2CIR8euXSKxM0KMHz1BiMUf9MjjPenkppl8A0az6Wd9uRxFb2LWgiNOr5SqZ5+1VU4E602/L8sR8F87P6bzITv9qi1RrW/e0a8ow0BntdeevmrYInRszfgZHhjjBYw8JcJTHs0AAAAAAElFTkSuQmCC`

let icon_settings_about = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAMAAAAM7l6QAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAtUExURdLS0oaGhllZWSkpKRsbG7q6uq2trTk5OZOTk0lJSWdnZ8bGxnd3d6CgoAAAAM0E4TwAAAAPdFJOU///////////////////ANTcmKEAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAECSURBVDhPpZPblsMgCEVViIna+v+f28MlFtuueZnz4EI2EFSS5p8KOOVCzFzy4Q5o4XoCuc7LnTdODWnV7NoRcPt1PYjLUMuEAItVfDCvcqbqXHAijw0Cl3KC22euqPKJFbhyMQ/UxGfqkgR8ahnViE0wCU4hefbuBvRAR2nm775MB3fgwr4VXdkNEZpLkyLeNo2BOXq2Der+A2vxrbU9loC3g0U89GByvKWIJU8v1fdQPBjppc4rpNenG5JsT4L0H9c65EUUp3t0gjAiMrCC1+i8NXyAFAsP7ct3Pd7wHJjyh4//yMTktmP0L39IKwUDz7RGZmF8oeuPQj30EfC35nwBeH4pICZt6ccAAAAASUVORK5CYII=`


let icon_settings_background = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAMAAABF0y+mAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAqUExURVlZWRsbG62urzk5OlhZWSkqKhobG5OTlElJSfv8/ZKTlIaGh4WGhwAAAGQI9MQAAAAOdFJOU/////////////////8ARcDcyAAAAAlwSFlzAAAOwwAADsMBx2+oZAAAAMBJREFUOE99ktsWhCAIRWEQYy7+/+/OwVtarPaDIbsMVCoPVEl8o+VLeTELUUq0IMyvKln9rSvKLgljBFamwtJnFyS7vBZ84G8gBRLlsXkQSdXDvNJQsr0P/iCIpLBp9iCSsForCuXgUWJzNvlV/fXwJg0t5tqjs0vz5m3aTVY3H7ucnwy7yHO5YU85F3PahEafm+vTtglydc3WwybGXvfkxLLkBFlw+XpqQTKOBrJdzZWU4NrV9Ko3Mkg170NMKX/0fh1bkCzYuAAAAABJRU5ErkJggg==`

let icon_settings_colors = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACEAAAAgCAMAAACrZuH4AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAkUExURa2ur2doaElJSRobG3d4eCkqKlhZWaChooWGh5KTlDk5OgAAAB2r4yoAAAAMdFJOU///////////////ABLfzs4AAAAJcEhZcwAADsMAAA7DAcdvqGQAAAEgSURBVDhPhZOBssUQDERVRFv+/3/fZpMWbe+8nSkph7BI/T/NRNqyiOSyjhp/Bb2i1Uop0Wa6iF1Fj4gPFbnim8AEp0cU+BxhEEWU9dB2t5DYX0Dv59VGYgDbNLs0r/Fl2RlD1Zv5X2SzCkSSapGL6xUf0sRKEB7MUmHyxEkQzlOs4tiEdBzwpcOypY8kpswMViQsy9tWKXPb3n8R16aMyN8EVUnsbqMdPh2aZWvEPrLoiX6tbT4eXhHPYptCv7l4jGsRK0XhXuxhyTCvErbLtrr1sDccmxULaZEsXJ/l3uA284+GPQjbPxRzVJ7YSpQY7HKjVmK5TOr4SmBt96PQuJsPAu1u/Xk/vCeBWaRVvF+abHoRPdnTvRyB3sSq3v8AvrUnU1ZqQSsAAAAASUVORK5CYII=`

let icon_settings_themes = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAkUExURTk5OhobG3d4eElJSSkqKqChoq2ur5KTlFhZWYWGh2doaAAAAHFXeXsAAAAMdFJOU///////////////ABLfzs4AAAAJcEhZcwAADsMAAA7DAcdvqGQAAADuSURBVDhPhZPREgMRDEUFxfL//9vkhmDY9jzs6twzJLJ17Q+/BEf+l+CJ8e9CoNga0avgKPCT3JsQ5Xje5XMXEnHSWqZyL5LzJG+p4iZ4BFIGnlivjPyhKq9DGLkecAqWRxxwCHnkgbIudiGN3EuHYBdGnvgKO5sQtf8pMqsQcX9YdJFZhID7Z0wUpvBgfoyJwARrYM9NcPz5oLNgDSoq8PxCcbJHGAcNVIjY3lM9chUSPfgxjlmBkHvfZa8PQKh9cqW/VyBoCdsNGyLEPlob8QoL+olzD5cKRJB/GIjLBCa8AzdP5Ooc4AaKfKe1L204JjIgudijAAAAAElFTkSuQmCC`

let icon_settings_dynamiclighting = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAgCAMAAAAynjhNAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAkUExURVhZWRobGzk5OikqKklJSWdoaHd4eJKTlIWGh6Choq2urwAAAK0RRvsAAAAMdFJOU///////////////ABLfzs4AAAAJcEhZcwAADsMAAA7DAcdvqGQAAADwSURBVDhPhVPRFoUgCBM1tfr//70boGn3VHuAcAoDLZyvWOggwLrinohkRZKHxExLpg2igWGhN9ryQFepkzOQLqYn+jGJMJtIgeO6JBPFGMBuICXuBq2+xDxy1hy5ky0E1Gq2ekeDiGCHHXuru38COB5MieJIWvTwkFoDxuBjOoRlmojzEf1AWnG+Vxkh9LGxQ/PvXWIT1o+ahPSZea4OiTo2vwAapdtFM81Fvyd/lxZ64/fGkjb2MZaPoT5eSQEBae8XSq9FH54D4w1ueUx48txN2vH0FDss+zZ1stIa6AV0zLT/RGNMwEx//IJ/OM8fX8QgsmUS+ioAAAAASUVORK5CYII=`

let icon_settings_lockscreen = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAcCAMAAAA3HE0QAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAhUExURTk5OhobG62ur0lJSVhZWSkqKmdoaKChopKTlIWGhwAAAFU6BsMAAAALdFJOU/////////////8ASk8B8gAAAAlwSFlzAAAOwwAADsMBx2+oZAAAAJ1JREFUOE/d0sESgzAIBNBsSCLl/z+4C9h2xpJ67x5wlDcjGprdJEBDmeyZdUBGEQF6AEyXVSYcLBzn/VcOLAKQ7cLeHwDZA20QXuYOPOIwuukOxO+P06pBh7IO79RA78DAUOWcZCWICTMExXGfTQ9BsTDeWcqNSnBduQCsXKgEHMTtOwHyK17gGjb8eegd4Guj/gCZGvh0GanBJ2ZPic0ax/1S4TYAAAAASUVORK5CYII=`

let icon_settings_textinput = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAXCAMAAABd273TAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAkUExURZKTlBobG6ChoikqKlhZWTk5Oq2ur3d4eGdoaElJSYWGhwAAADf8BSUAAAAMdFJOU///////////////ABLfzs4AAAAJcEhZcwAADsMAAA7DAcdvqGQAAAChSURBVChTlZLbFsIgDASzhIs0//+/LgFr8YDaedjTwjQQqNgPKAi2tFkL0LhBESgkjGILkCjgm4CXkEN77zv2DD7wFsDVrPij4sEP/PEiaAuBMiuOPtXz3z1suCmkyBBkZkw+Mgs8cR+qnr3juUJle5arV2jFyCwsuCOM+73wIZRxwyflFPyUN/Dshe0l2aDslv0eY9EFvLbxCyzpU55bzJ72QBVB486ENgAAAABJRU5ErkJggg==`

let icon_settings_start = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAYCAMAAACsjQ8GAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAhUExURTk5OhobG62ur0lJSVhZWSkqKmdoaKChond4eJKTlAAAAMte5ZMAAAALdFJOU/////////////8ASk8B8gAAAAlwSFlzAAAOwwAADsMBx2+oZAAAAKFJREFUOE+1kkkOxDAIBN3ezf8fPBiQtzjKaeqAlKbkOAFHH4jgcEV7RB4I8UIAvAhI3byR0IWMYs8PCjILYO0N7g2hVHu1UPXUReAb7YRD0GASNB1CQevBpMnVp9BEqHJMyCM4BfTatmAXov7cOIJTWPiXkPr4vAzvLnx+BS1lCjJuEyYS6LhlYe6CLoysnIOzQRscjJXjYiM+0F4v7xD9AGDWFYlNvliBAAAAAElFTkSuQmCC`

let icon_settings_taskbar = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAYCAMAAACsjQ8GAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAbUExURTk5OhobG62ur0lJSVhZWSkqKmdoaKChogAAAOteX2MAAAAJdFJOU///////////AFNPeBIAAAAJcEhZcwAADsMAAA7DAcdvqGQAAABfSURBVDhP7ZJBDsAgCARdrcr/X1xATu1afEDnQEJ2EkKgSIILBZSViVSgXYQGVBfQzWR0mDAwo38xMVSAajs0+wUlhC9ciOMQTkdERzgT0nOnD5O/nJZY+sHKrOwRuQFZthKzoE5APAAAAABJRU5ErkJggg==`

let icon_settings_fonts = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAkUExURRobG2doaJKTlDk5OlhZWa2ur3d4eCkqKqChooWGh0lJSQAAAI++r88AAAAMdFJOU///////////////ABLfzs4AAAAJcEhZcwAADsMAAA7DAcdvqGQAAAEJSURBVDhPhZPbEoQwCENT673//7+bBqrgurPnwaGYlkAV7Q+X4Jdy5AuKRw+GAPhxhKcnVEwWPnBBRUO18IELMLf5vYZlC5a2YFUs9Y0JsPGx+RFr8qt4x8Hngb0vKIx+JaBFxbK5YI5+9Qqn4lOLguS3h6sq9BrdJrcvl18TsKhDr/Iz/BJGLDoZ/Wj5Wdm2w6WVFvRiftwV4cs0Y9/rfREwZe0bXt0m00E01P24f81WQTviNXMII3CbcTu5/YwvLAt2nN7xNG4sC6oPTJj3LED1/cSrJUEY4DW/JHjr+CU12DSKKLiGYFjBmEuXQnRjt4Atbun3O9lqCYLe+riADkcFnpHLftHaB1ZIJHH003BnAAAAAElFTkSuQmCC`

let icon_home_tiny = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAVCAMAAABxCz6aAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAkUExURa+vryoqKhsbG6Kiory8vFpaWoeHh5SUlGlpaTo6OsjIyAAAALeCzWUAAAAMdFJOU///////////////ABLfzs4AAAAJcEhZcwAADsIAAA7CARUoSoAAAAB0SURBVChTlZBZDsAgCERxQazc/74FxKVL0nSiMPP8AYFfNCGEsPzoMaU4gzcFViz12uOglzAfl1V1K3djHoDzzpRmgVg8ugoqJE8u+oIVsZrZIB0k5w6Rl/sFbc4FbU4IhYhQIYop8te6KaoaczNjuz/EfAJqWQ5ZfHUghQAAAABJRU5ErkJggg==`
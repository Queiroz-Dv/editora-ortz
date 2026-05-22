// ============================================
// GSAP Setup
// ============================================
const gsap = window.gsap
const ScrollTrigger = window.gsap.ScrollTrigger
gsap.registerPlugin(ScrollTrigger)

// ============================================
// Navigation Module
// ============================================
const Navigation = {
  nav: null,
  menuToggle: null,
  navMenu: null,

  init() {
    this.nav = document.querySelector(".nav")
    this.menuToggle = document.querySelector(".menu-toggle")
    this.navMenu = document.querySelector(".nav-menu")

    if (!this.nav || !this.menuToggle || !this.navMenu) return

    this.attachScrollListener()
    this.attachMenuToggle()
    this.attachMenuLinks()
  },
  attachScrollListener() {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 100) {
        this.nav.classList.add("scrolled")
      } else {
        this.nav.classList.remove("scrolled")
      }
    })
  },
  attachMenuToggle() {
    this.menuToggle.addEventListener("click", () => {
      this.navMenu.classList.toggle("active")
      this.menuToggle.classList.toggle("active")
    })
  },
  attachMenuLinks() {
    document.querySelectorAll(".nav-menu a").forEach((link) => {
      link.addEventListener("click", () => {
        this.navMenu.classList.remove("active")
        this.menuToggle.classList.remove("active")
      })
    })
  },
}

// ============================================
// Theme Module
// ============================================
const Theme = {  
  body: document.body,
  themeToggle: null,

  init() {
    this.themeToggle = document.querySelector(".theme-toggle")
    if (!this.themeToggle) return

    this.loadSavedTheme()
    this.attachToggleListener()
  },
  loadSavedTheme() {
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme === "dark") {
      this.body.classList.add("dark-mode")
    }
  },
  attachToggleListener() {
    this.themeToggle.addEventListener("click", () => {
      this.body.classList.toggle("dark-mode")
      const isDark = this.body.classList.contains("dark-mode")
      localStorage.setItem("theme", isDark ? "dark" : "light")
    })
  },
}

// ============================================
// === SLIDESHOW ATUALIZADO (SINCRONIZADO) ===
// ============================================
const Slideshow = {
  intervalTime: 10000,

  init() {
    const slidesVolumes = document.querySelectorAll("#slideshow-volumes .hero-slide")
    const slidesMarcas = document.querySelectorAll("#slideshow-marcas .hero-slide")
    
    let currentIndex = 0; // Índice local para o closure

    // Caso 1: Estamos na index.html (com 2 slideshows)
    if (slidesVolumes.length > 0 && slidesMarcas.length > 0) {
        
        slidesVolumes[0].classList.add("active")
        slidesMarcas[0].classList.add("active")
        
        // Inicia o loop sincronizado
        setInterval(() => {
            // Remove a classe 'active' do slide atual (para ambos)
            let volIndex = currentIndex % slidesVolumes.length;
            let marIndex = currentIndex % slidesMarcas.length;
            slidesVolumes[volIndex].classList.remove("active");
            slidesMarcas[marIndex].classList.remove("active");

            currentIndex++; // Incrementa o índice mestre

            // Adiciona a classe 'active' ao próximo slide (para ambos)
            volIndex = currentIndex % slidesVolumes.length;
            marIndex = currentIndex % slidesMarcas.length;
            slidesVolumes[volIndex].classList.add("active");
            slidesMarcas[marIndex].classList.add("active");

        }, this.intervalTime);

    } else {
        // Caso 2: Fallback para um slideshow único (se houver)
        const slidesLegacy = document.querySelectorAll(".hero-slide");
        if (slidesLegacy.length > 0) {
            
            slidesLegacy[0].classList.add("active");

            // Inicia o loop legado
            setInterval(() => {
                slidesLegacy[currentIndex].classList.remove("active");
                currentIndex = (currentIndex + 1) % slidesLegacy.length;
                slidesLegacy[currentIndex].classList.add("active");
            }, this.intervalTime);
        }
    }
  }
}


// ============================================
// Animations Module
// ============================================
const Animations = {
  init() {
    this.animateHero()
    this.animateServices()
    this.animateValueCards() 
    this.animateMissionQuote() 
    this.animateTimeline() 
    this.animateQRZ() 
    this.animateContact() 
  },

  animateHero() { 
    const heroTitle = document.querySelector(".hero-title")
    const heroSubtitle = document.querySelector(".hero-subtitle")
    const heroCta = document.querySelector(".hero-cta")

    if (heroTitle) {
      gsap.from(heroTitle, {
        opacity: 0,
        y: 30,
        duration: 1,
        ease: "power3.out",
        delay: 0.3,
      })
    }
    if (heroSubtitle) {
      gsap.from(heroSubtitle, {
        opacity: 0,
        y: 30,
        duration: 1,
        ease: "power3.out",
        delay: 0.6,
      })
    }
    if (heroCta) {
      gsap.from(heroCta, {
        opacity: 0,
        y: 30,
        duration: 1,
        ease: "power3.out",
        delay: 0.9,
      })
    }
  },

  animateServices() {
    gsap.utils.toArray(".service-card").forEach((card, index) => {
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: "top 85%", 
          toggleActions: "play none none reverse",
        },
        opacity: 0,
        y: 60,
        duration: 0.4,       
        ease: "power3.out",
      })
    })
  },

  animateValueCards() {
    gsap.utils.toArray(".value-card").forEach((card, index) => {
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
        opacity: 0,
        y: 50,
        duration: 0.6,
        delay: index * 0.15,
        ease: "power3.out",
      })
    })
  },

  animateMissionQuote() {
    // ... (código da função animateMissionQuote) ...
    const missionQuote = document.querySelector(".mission-quote")
    if (missionQuote) {
      gsap.from(missionQuote, {
        scrollTrigger: {
          trigger: ".mission-statement",
          start: "top 70%",
          toggleActions: "play none none reverse",
        },
        opacity: 0,
        y: 30,
        duration: 1,
        ease: "power3.out",
      })
    }
  },

  animateTimeline() {
    // ... (código da função animateTimeline) ...
    gsap.utils.toArray(".timeline-item").forEach((item) => {
      const dot = item.querySelector(".timeline-dot")
      const content = item.querySelector(".timeline-content")

      if (dot) {
        gsap.from(dot, {
          scrollTrigger: {
            trigger: item,
            start: "top 75%",
            toggleActions: "play none none reverse",
          },
          opacity: 0,
          scale: 0,
          duration: 0.4,
          ease: "back.out(1.7)",
        })
      }

      if (content) {
        gsap.from(content, {
          scrollTrigger: {
            trigger: item,
            start: "top 75%",
            toggleActions: "play none none reverse",
          },
          opacity: 0,
          x: 50,
          duration: 0.5,
          delay: 0.15,
          ease: "power3.out",
        })
      }
    })
  },

  animateQRZ() {
    // ... (código da função animateQRZ) ...
    const qrzLogo = document.querySelector(".qrz-logo")
    const qrzText = document.querySelector(".qrz-text")

    if (qrzLogo) {
      gsap.from(qrzLogo, {
        scrollTrigger: {
          trigger: ".qrz-connection",
          start: "top 70%",
          toggleActions: "play none none reverse",
        },
        opacity: 0,
        scale: 0.8,
        duration: 1,
        ease: "power3.out",
      })
    }

    if (qrzText) {
      gsap.from(qrzText, {
        scrollTrigger: {
          trigger: ".qrz-connection",
          start: "top 70%",
          toggleActions: "play none none reverse",
        },
        opacity: 0,
        x: 50,
        duration: 1,
        delay: 0.3,
        ease: "power3.out",
      })
    }
  },

  animateContact() {
    // ... (código da função animateContact) ...
    const contactInfo = document.querySelector(".contact-info")
    const contactLogos = document.querySelector(".contact-logos")

    if (contactInfo) {
      gsap.from(contactInfo, {
        scrollTrigger: {
          trigger: ".contact",
          start: "top 70%",
          toggleActions: "play none none reverse",
        },
        opacity: 0,
        x: -50,
        duration: 0.8,
        ease: "power3.out",
      })
    }

    if (contactLogos) {
      gsap.from(contactLogos, {
        scrollTrigger: {
          trigger: ".contact",
          start: "top 70%",
          toggleActions: "play none none reverse",
        },
        opacity: 0,
        x: 50,
        duration: 0.8,
        ease: "power3.out",
      })
    }
  },
}

// ============================================
// Smooth Scroll Module
// ============================================
const SmoothScroll = {
  // ... (código do módulo SmoothScroll) ...
  init() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", (e) => {
        e.preventDefault()
        const target = document.querySelector(anchor.getAttribute("href"))
        if (target) {
          const offsetTop = target.offsetTop - 80
          window.scrollTo({
            top: offsetTop,
            behavior: "smooth",
          })
        }
      })
    })
  },
}

// ============================================
// Intersection Observer Module
// ============================================
const IntersectionObserverModule = {
  // ... (código do módulo IntersectionObserverModule) ...
  init() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -100px 0px",
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible")
        }
      })
    }, observerOptions)

    document.querySelectorAll("section").forEach((section) => {
      observer.observe(section)
    })
  },
}

// ============================================
// Modal Module
// ============================================
const Modal = {
  // ... (código do módulo Modal) ...
  modal: null,
  modalImage: null,
  modalClose: null,
  modalOverlay: null,

  init() {
    this.modal = document.getElementById("coverModal")
    if (!this.modal) return

    this.modalImage = this.modal.querySelector(".modal-image")
    this.modalClose = this.modal.querySelector(".modal-close")
    this.modalOverlay = this.modal.querySelector(".modal-overlay")

    this.attachEventListeners()
    this.attachPortfolioItems()
  },
  attachEventListeners() {
    if (this.modalClose) {
      this.modalClose.addEventListener("click", () => this.close())
    }

    if (this.modalOverlay) {
      this.modalOverlay.addEventListener("click", () => this.close())
    }

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.modal?.classList.contains("active")) {
        this.close()
      }
    })
  },
  attachPortfolioItems() {
    const portfolioItems = document.querySelectorAll(".work-item, .brand-item")
    portfolioItems.forEach((item) => {
      item.addEventListener("click", () => {
        const coverUrl = item.getAttribute("data-cover")
        const coverAlt = item.querySelector("img")?.getAttribute("alt") || "Cover"
        this.open(coverUrl, coverAlt)
      })
    })
  },
  open(coverUrl, alt = "Cover") {
    if (!this.modal || !this.modalImage) return

    this.modalImage.src = coverUrl
    this.modalImage.alt = alt
    this.modal.classList.add("active")
    document.body.style.overflow = "hidden"
  },
  close() {
    if (!this.modal) return

    this.modal.classList.remove("active")
    document.body.style.overflow = ""
  },
}

// ============================================
// Scroll Buttons Module
// ============================================
const ScrollButtons = {
  // ... (código do módulo ScrollButtons) ...
  scrollUpBtn: null,
  scrollDownBtn: null,
  themeToggle: null,
  hideTimer: null,

  init() {
    this.scrollUpBtn = document.querySelector(".scroll-up-btn")
    this.scrollDownBtn = document.querySelector(".scroll-down-btn")
    this.themeToggle = document.querySelector(".theme-toggle")

    if (!this.scrollUpBtn || !this.scrollDownBtn) return

    this.attachScrollListener()
    this.attachButtonListeners()
    this.attachMouseMovement()
    this.showControls()
  },
  attachScrollListener() {
    window.addEventListener("scroll", () => {
      const scrolled = window.pageYOffset
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight

      if (scrolled > 300) {
        this.scrollUpBtn.classList.add("visible")
      } else {
        this.scrollUpBtn.classList.remove("visible")
      }

      if (scrolled + windowHeight < documentHeight - 100) {
        this.scrollDownBtn.classList.add("visible")
      } else {
        this.scrollDownBtn.classList.remove("visible")
      }
    })
  },
  attachButtonListeners() {
    this.scrollUpBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" })
    })

    this.scrollDownBtn.addEventListener("click", () => {
      const currentScroll = window.pageYOffset
      const windowHeight = window.innerHeight
      window.scrollTo({
        top: currentScroll + windowHeight,
        behavior: "smooth",
      })
    })
  },
  attachMouseMovement() {
    document.addEventListener("mousemove", () => {
      this.showControls()
      clearTimeout(this.hideTimer)
      this.hideTimer = setTimeout(() => this.hideControls(), 3000)
    })
  },
  showControls() {
    this.themeToggle?.classList.add("visible")
    if (window.pageYOffset > 300) {
      this.scrollUpBtn?.classList.add("visible")
    }
    if (window.pageYOffset + window.innerHeight < document.documentElement.scrollHeight - 100) {
      this.scrollDownBtn?.classList.add("visible")
    }
  },
  hideControls() {
    this.themeToggle?.classList.remove("visible")
    this.scrollUpBtn?.classList.remove("visible")
    this.scrollDownBtn?.classList.remove("visible")
  },
}


// ============================================
// Initialize All Modules
// ============================================
function initApp() {
  Navigation.init()
  Theme.init()
  Slideshow.init() 
  Animations.init()
  SmoothScroll.init()
  IntersectionObserverModule.init()
  Modal.init()
  ScrollButtons.init()
}

// Run initialization when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp)
} else {
  initApp()
}

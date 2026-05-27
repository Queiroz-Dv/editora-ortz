// ============================================
// GSAP Setup
// ============================================
const gsap = window.gsap || null
const ScrollTrigger = gsap?.ScrollTrigger || null

if (gsap && ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger)
}

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
    const hero = document.querySelector(".hero")
    if (!hero) {
      this.nav.classList.add("scrolled")
      return
    }

    if (!("IntersectionObserver" in window)) {
      window.addEventListener("scroll", () => {
        this.nav.classList.toggle("scrolled", window.scrollY > 100)
      }, { passive: true })
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        this.nav.classList.toggle("scrolled", !entry.isIntersecting)
      },
      { threshold: 0.08 }
    )

    observer.observe(hero)
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
// Slideshow Module (legado — mantido para compatibilidade)
// ============================================
const Slideshow = {
  intervalTime: 10000,

  init() {
    const slidesVolumes = document.querySelectorAll("#slideshow-volumes .hero-slide")
    const slidesMarcas = document.querySelectorAll("#slideshow-marcas .hero-slide")
    let currentIndex = 0

    if (slidesVolumes.length > 0 && slidesMarcas.length > 0) {
      slidesVolumes[0].classList.add("active")
      slidesMarcas[0].classList.add("active")

      setInterval(() => {
        let volIndex = currentIndex % slidesVolumes.length
        let marIndex = currentIndex % slidesMarcas.length
        slidesVolumes[volIndex].classList.remove("active")
        slidesMarcas[marIndex].classList.remove("active")

        currentIndex++

        volIndex = currentIndex % slidesVolumes.length
        marIndex = currentIndex % slidesMarcas.length
        slidesVolumes[volIndex].classList.add("active")
        slidesMarcas[marIndex].classList.add("active")
      }, this.intervalTime)
    } else {
      const slidesLegacy = document.querySelectorAll(".hero-slide")
      if (slidesLegacy.length > 0) {
        slidesLegacy[0].classList.add("active")
        setInterval(() => {
          slidesLegacy[currentIndex].classList.remove("active")
          currentIndex = (currentIndex + 1) % slidesLegacy.length
          slidesLegacy[currentIndex].classList.add("active")
        }, this.intervalTime)
      }
    }
  },
}

// ============================================
// Animations Module
// ============================================
const Animations = {
  init() {
    if (!gsap) return

    this.animateHero()
    this.animateServices()
    this.animateProcess()
    this.animateFeatures()
    this.animateBrands()
    this.animateValueCards()
    this.animateMissionQuote()
    this.animateTimeline()
    this.animateQRZ()
    this.animateContact()
    this.animateStart()
  },

  animateHero() {
    const heroTitle = document.querySelector(".hero-title")
    const heroSubtitle = document.querySelector(".hero-subtitle")
    const heroCta = document.querySelector(".hero-cta")

    gsap.context(() => {
      if (heroTitle) {
        gsap.from(heroTitle, { opacity: 0, y: 30, duration: 0.8, ease: "power3.out", delay: 0.1 })
      }
      if (heroSubtitle) {
        gsap.from(heroSubtitle, { opacity: 0, y: 30, duration: 0.8, ease: "power3.out", delay: 0.3 })
      }
      if (heroCta) {
        gsap.from(heroCta, { opacity: 0, y: 30, duration: 0.8, ease: "power3.out", delay: 0.5 })
      }
    }, ".hero")
  },

  animateServices() {
    gsap.utils.toArray(".service-card").forEach((card) => {
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: "top 98%",
          toggleActions: "play none none reverse",
        },
        opacity: 0,
        y: 24,
        duration: 0.32,
        ease: "power3.out",
      })
    })
  },

  animateProcess() {
    const steps = gsap.utils.toArray(".process-step")
    if (!steps.length) return

    steps.forEach((step) => {
      const img = step.querySelector(".process-step__image img")
      const textBody = step.querySelector(".process-step__body")

      // Efeito Parallax na imagem
      if (img) {
        gsap.to(img, {
          yPercent: 12,
          ease: "none",
          scrollTrigger: {
            trigger: step,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        })
      }

      // Animação de fade-in e slide para os textos
      if (textBody) {
        gsap.from(textBody.children, {
          y: 30,
          opacity: 0,
          duration: 0.55,
          stagger: 0.08,
          ease: "power3.out",
          scrollTrigger: {
            trigger: step,
            start: "top 96%",
            toggleActions: "play none none reverse",
          },
        })
      }
    })
  },

  animateFeatures() {
    const section = document.querySelector(".editorial-features")
    if (!section) return

    gsap.utils.toArray(".ef-card").forEach((card, index) => {
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: "top 98%",
          toggleActions: "play none none reverse",
        },
        opacity: 0,
        y: 22,
        duration: 0.32,
        delay: index * 0.025,
        ease: "power3.out",
      })
    })
  },

  animateBrands() {
    gsap.utils.toArray(".brand-card").forEach((card) => {
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: "top 98%",
          toggleActions: "play none none reverse",
        },
        opacity: 0,
        y: 22,
        duration: 0.32,
        ease: "power3.out",
      })
    })
  },

  animateValueCards() {
    gsap.utils.toArray(".value-card").forEach((card, index) => {
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: "top 96%",
          toggleActions: "play none none reverse",
        },
        opacity: 0,
        y: 22,
        duration: 0.32,
        delay: index * 0.03,
        ease: "power3.out",
      })
    })
  },

  animateMissionQuote() {
    const missionQuote = document.querySelector(".mission-quote")
    if (missionQuote) {
      gsap.from(missionQuote, {
        scrollTrigger: {
          trigger: ".mission-statement",
          start: "top 90%",
          toggleActions: "play none none reverse",
        },
        opacity: 0,
        y: 20,
        duration: 0.7,
        ease: "power3.out",
      })
    }
  },

  animateTimeline() {
    gsap.utils.toArray(".timeline-item").forEach((item) => {
      const dot = item.querySelector(".timeline-dot")
      const content = item.querySelector(".timeline-content")

      if (dot) {
        gsap.from(dot, {
          scrollTrigger: { trigger: item, start: "top 96%", toggleActions: "play none none reverse" },
          opacity: 0,
          scale: 0,
          duration: 0.3,
          ease: "back.out(1.7)",
        })
      }

      if (content) {
        gsap.from(content, {
          scrollTrigger: { trigger: item, start: "top 96%", toggleActions: "play none none reverse" },
          opacity: 0,
          x: 30,
          duration: 0.4,
          delay: 0.05,
          ease: "power3.out",
        })
      }
    })
  },

  animateQRZ() {
    const qrzLogo = document.querySelector(".qrz-logo")
    const qrzText = document.querySelector(".qrz-text")

    if (qrzLogo) {
      gsap.from(qrzLogo, {
        scrollTrigger: { trigger: ".qrz-connection", start: "top 90%", toggleActions: "play none none reverse" },
        opacity: 0,
        scale: 0.85,
        duration: 0.7,
        ease: "power3.out",
      })
    }

    if (qrzText) {
      gsap.from(qrzText, {
        scrollTrigger: { trigger: ".qrz-connection", start: "top 90%", toggleActions: "play none none reverse" },
        opacity: 0,
        x: 30,
        duration: 0.7,
        delay: 0.1,
        ease: "power3.out",
      })
    }
  },

  animateContact() {
    const contactInfo = document.querySelector(".contact-info")
    const contactLogos = document.querySelector(".contact-logos")

    if (contactInfo) {
      gsap.from(contactInfo, {
        scrollTrigger: { trigger: ".contact-area", start: "top 96%", toggleActions: "play none none reverse" },
        opacity: 0,
        x: -30,
        duration: 0.6,
        ease: "power3.out",
      })
    }

    if (contactLogos) {
      gsap.from(contactLogos, {
        scrollTrigger: { trigger: ".contact-area", start: "top 96%", toggleActions: "play none none reverse" },
        opacity: 0,
        x: 30,
        duration: 0.6,
        ease: "power3.out",
      })
    }
  },

  animateStart() {
    const panel = document.querySelector(".start-panel")
    if (!panel) return

    gsap.context(() => {
      gsap.from(panel, {
        scrollTrigger: { trigger: panel, start: "top 96%", toggleActions: "play none none reverse" },
        opacity: 0,
        y: 30,
        scale: 0.99,
        duration: 0.55,
        ease: "power3.out",
      })
    }, ".start-section")
  },
}

// ============================================
// Smooth Scroll Module
// ============================================
const SmoothScroll = {
  init() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", (e) => {
        e.preventDefault()
        const target = document.querySelector(anchor.getAttribute("href"))
        if (target) {
          const offsetTop = target.offsetTop - 80
          window.scrollTo({ top: offsetTop, behavior: "smooth" })
        }
      })
    })
  },
}

// ============================================
// Intersection Observer Module
// ============================================
const IntersectionObserverModule = {
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
// Card Image Warmup Module
// ============================================
const CardImageWarmup = {
  init() {
    const images = document.querySelectorAll(
      ".service-card img, .work-preview-container img, .brand-card img, .work-item img, .brand-item img, .testimonial-card img"
    )

    if (!images.length) return

    if (!("IntersectionObserver" in window)) {
      images.forEach((img) => this.prepareImage(img))
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          this.prepareImage(entry.target)
          observer.unobserve(entry.target)
        })
      },
      {
        rootMargin: "1400px 0px",
        threshold: 0.01,
      }
    )

    images.forEach((img) => observer.observe(img))
  },

  prepareImage(img) {
    img.loading = "eager"
    img.decoding = "async"

    if (typeof img.decode === "function" && !img.complete) {
      img.decode().catch(() => {})
    }
  },
}

// ============================================
// Modal Module
// ============================================
const Modal = {
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
    }, { passive: true })
  },

  attachButtonListeners() {
    this.scrollUpBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" })
    })

    this.scrollDownBtn.addEventListener("click", () => {
      const documentHeight = document.documentElement.scrollHeight
      window.scrollTo({ top: documentHeight, behavior: "smooth" })
    })
  },

  attachMouseMovement() {
    document.addEventListener("mousemove", () => {
      this.showControls()
      clearTimeout(this.hideTimer)
      this.hideTimer = setTimeout(() => this.hideControls(), 3000)
    }, { passive: true })
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
  },
}

// ============================================
// Counters Module
// ============================================
const Counters = {
  init() {
    const counters = document.querySelectorAll('.counter')
    if (!counters.length) return

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const counter = entry.target
          const target = +counter.getAttribute('data-target')
          // Temporarily set to 0 to animate up
          counter.innerText = '0'
          this.animateCounter(counter, target)
          observer.unobserve(counter)
        }
      })
    }, { threshold: 0.5 })

    counters.forEach(counter => observer.observe(counter))
  },

  animateCounter(el, target) {
    let current = 0
    const duration = 2000 // 2 seconds
    const increment = target / (duration / 16) // roughly 60fps

    const updateCounter = () => {
      current += increment
      if (current < target) {
        el.innerText = Math.ceil(current)
        requestAnimationFrame(updateCounter)
      } else {
        el.innerText = target
      }
    }
    updateCounter()
  }
}

// ============================================
// FAQ Module
// ============================================
const FAQ = {
  init() {
    const faqItems = document.querySelectorAll('.faq-item')
    if (!faqItems.length) return

    faqItems.forEach(item => {
      const question = item.querySelector('.faq-question')
      question.addEventListener('click', () => {
        const isActive = item.classList.contains('active')
        
        // Close all other items
        faqItems.forEach(faq => {
          faq.classList.remove('active')
          faq.querySelector('.faq-question').setAttribute('aria-expanded', 'false')
        })

        // Toggle current item
        if (!isActive) {
          item.classList.add('active')
          question.setAttribute('aria-expanded', 'true')
        }
      })
    })
  }
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
  CardImageWarmup.init()
  Modal.init()
  ScrollButtons.init()
  Counters.init()
  FAQ.init()
}

// Run initialization when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp)
} else {
  initApp()
}

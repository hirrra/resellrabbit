(function () {
  const win = window
  const doc = document.documentElement

  doc.classList.remove('no-js')
  doc.classList.add('js')

  // Reveal animations
  if (document.body.classList.contains('has-animations')) {
    /* global ScrollReveal */
    const sr = window.sr = new ScrollReveal({ reset: true });

    // sr.reveal('.hero-title, .hero-paragraph, .newsletter-header, .newsletter-form, .hero-form, .hero-illustration', {
    //   duration: 1000,
    //   distance: '40px',
    //   easing: 'cubic-bezier(0.5, -0.01, 0, 1.005)',
    //   origin: 'bottom',
    //   interval: 150
    // })

    sr.reveal('.newsletter-header, .newsletter-form', {
      duration: 1000,
      distance: '40px',
      easing: 'cubic-bezier(0.5, -0.01, 0, 1.005)',
      origin: 'bottom',
      interval: 150
    })

    sr.reveal('.hero-browser-inner', {
      duration: 1000,
      scale: 0.95,
      easing: 'cubic-bezier(0.5, -0.01, 0, 1.005)',
      interval: 150
    })

    sr.reveal('.feature, .feature-header, .bottom-line', {
      duration: 600,
      distance: '40px',
      easing: 'cubic-bezier(0.5, -0.01, 0, 1.005)',
      interval: 100,
      origin: 'bottom',
      viewFactor: 0.5
    })
  }
}())
'use client'

import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP)
}

export default function GSAPAnimations() {
  useGSAP(() => {
    // Header animation
    gsap.from('.gsap-header', {
      y: -50,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out',
    })

    // Main content animation
    gsap.from('.gsap-main', {
      y: 30,
      opacity: 0,
      duration: 0.8,
      delay: 0.2,
      ease: 'power3.out',
    })

    // Footer animation
    gsap.from('.gsap-footer', {
      scrollTrigger: {
        trigger: '.gsap-footer',
        start: 'top 95%',
        toggleActions: 'play none none reverse',
      },
      y: 50,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out',
    })

    // Footer columns staggered animation
    gsap.from('.gsap-footer-col', {
      scrollTrigger: {
        trigger: '.gsap-footer',
        start: 'top 90%',
        toggleActions: 'play none none reverse',
      },
      y: 30,
      opacity: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: 'power2.out',
    })
  })

  return null
}

'use client'

import { usePathname } from 'next/navigation'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP)
}

export default function GSAPAnimations() {
  const pathname = usePathname()

  useGSAP(() => {
    // Header animation
    gsap.from('.gsap-header', {
      y: -50,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out',
      clearProps: 'all'
    })

    // Main content animation
    gsap.from('.gsap-main', {
      y: 30,
      opacity: 0,
      duration: 0.8,
      delay: 0.2,
      ease: 'power3.out',
      clearProps: 'all'
    })

    // Footer animation
    gsap.from('.gsap-footer', {
      scrollTrigger: {
        trigger: '.gsap-footer',
        start: 'top bottom+=100',
        toggleActions: 'play none none none',
      },
      y: 30,
      opacity: 0,
      duration: 0.6,
      ease: 'power3.out',
      clearProps: 'all'
    })

    // Footer columns staggered animation
    gsap.from('.gsap-footer-col', {
      scrollTrigger: {
        trigger: '.gsap-footer',
        start: 'top bottom+=100',
        toggleActions: 'play none none none',
      },
      y: 20,
      opacity: 0,
      duration: 0.5,
      stagger: 0.1,
      ease: 'power2.out',
      clearProps: 'all'
    })
  }, { dependencies: [pathname] })

  return null
}

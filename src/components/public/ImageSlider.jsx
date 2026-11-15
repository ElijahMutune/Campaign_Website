
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import './ImageSlider.css'

function ImageSlider({
                         items = [],
                         renderSlide,
                         ariaLabel = 'Featured stories',
                         autoPlay = true,
                         interval = 5500,
                         className = '',
                         emptyMessage = 'No published content is available yet.',
                         showControls = true,
                     }) {
    const [activeIndex, setActiveIndex] = useState(0)
    const [paused, setPaused] = useState(false)

    const pointerStart = useRef(null)

    const slides = Array.isArray(items) ? items : []
    const itemCount = slides.length

    const safeIndex = itemCount > 0
        ? activeIndex % itemCount
        : 0

    const activeItem = slides[safeIndex]

    useEffect(() => {
        if (!autoPlay || paused || itemCount < 2) {
            return undefined
        }

        const delay = Math.max(interval, 2500)

        const timer = window.setInterval(() => {
            setActiveIndex((current) => (current + 1) % itemCount)
        }, delay)

        return () => window.clearInterval(timer)
    }, [autoPlay, paused, itemCount, interval])

    function goTo(index) {
        if (itemCount < 2) return

        const nextIndex = (index + itemCount) % itemCount
        setActiveIndex(nextIndex)
    }

    function showPrevious() {
        goTo(safeIndex - 1)
    }

    function showNext() {
        goTo(safeIndex + 1)
    }

    function handlePointerDown(event) {
        if (event.pointerType === 'mouse') return

        pointerStart.current = event.clientX
    }

    function handlePointerUp(event) {
        if (pointerStart.current === null) return

        const distance = event.clientX - pointerStart.current

        pointerStart.current = null

        if (Math.abs(distance) < 55) return

        if (distance > 0) {
            showPrevious()
        } else {
            showNext()
        }
    }

    function handlePointerCancel() {
        pointerStart.current = null
    }

    function pauseOnFocus() {
        setPaused(true)
    }

    function resumeAfterBlur(event) {
        if (!event.currentTarget.contains(event.relatedTarget)) {
            setPaused(false)
        }
    }

    if (itemCount === 0) {
        return (
            <section
                className={`image-slider image-slider-empty ${className}`}
                aria-label={ariaLabel}
                role="status"
            >
                <p>{emptyMessage}</p>
            </section>
        )
    }

    return (
        <section
            className={`image-slider ${className}`}
            aria-label={ariaLabel}
            aria-roledescription="carousel"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocusCapture={pauseOnFocus}
            onBlurCapture={resumeAfterBlur}
        >
            <div
                className="image-slider-frame"
                onPointerDown={handlePointerDown}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerCancel}
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        className="image-slider-slide"
                        key={activeItem.id || safeIndex}
                        initial={{ opacity: 0, scale: 1.025 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{
                            duration: 0.55,
                            ease: 'easeInOut',
                        }}
                    >
                        {renderSlide
                            ? renderSlide(activeItem, safeIndex)
                            : null}
                    </motion.div>
                </AnimatePresence>

                {showControls && itemCount > 1 && (
                    <>
                        <button
                            type="button"
                            className="image-slider-arrow image-slider-previous"
                            onClick={showPrevious}
                            aria-label="Previous slide"
                        >
                            <ChevronLeft size={21} />
                        </button>

                        <button
                            type="button"
                            className="image-slider-arrow image-slider-next"
                            onClick={showNext}
                            aria-label="Next slide"
                        >
                            <ChevronRight size={21} />
                        </button>
                    </>
                )}
            </div>

            {showControls && itemCount > 1 && (
                <div className="image-slider-footer">
                    <div
                        className="image-slider-indicators"
                        aria-label="Choose slide"
                    >
                        {slides.map((item, index) => (
                            <button
                                type="button"
                                key={item.id || index}
                                className={
                                    index === safeIndex
                                        ? 'image-slider-dot active'
                                        : 'image-slider-dot'
                                }
                                onClick={() => goTo(index)}
                                aria-label={`Show slide ${index + 1}`}
                                aria-current={
                                    index === safeIndex ? 'true' : undefined
                                }
                            />
                        ))}
                    </div>

                    <span className="image-slider-count">
                        {String(safeIndex + 1).padStart(2, '0')}
                        {' / '}
                        {String(itemCount).padStart(2, '0')}
                    </span>
                </div>
            )}
        </section>
    )
}

export default ImageSlider

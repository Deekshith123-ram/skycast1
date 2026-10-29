import { useState, useEffect, useRef, useCallback } from 'react';

interface AutoScrollOptions {
  isBusy?: boolean; // When true (active refresh, settings modal, search open), header stays visible
  autoHideDelayMs?: number; // 1 to 2 seconds auto-hide delay (1800ms)
}

export function useAutoScrollControls({
  isBusy = false,
  autoHideDelayMs = 1800,
}: AutoScrollOptions = {}) {
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);

  const lastScrollYRef = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isBusyRef = useRef(isBusy);
  isBusyRef.current = isBusy;

  const isHeaderVisibleRef = useRef(isHeaderVisible);
  isHeaderVisibleRef.current = isHeaderVisible;

  // Clear any existing auto-hide timer
  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Start the 1 to 2 seconds auto-hide timer when header appears after the top section
  const startAutoHideTimer = useCallback(() => {
    clearTimer();

    const currentScrollY = window.scrollY || document.documentElement.scrollTop;
    // Only auto-hide after the top section (when scrolled down > 25px)
    if (currentScrollY > 25 && !isBusyRef.current && autoHideDelayMs > 0) {
      timerRef.current = setTimeout(() => {
        const scrollY = window.scrollY || document.documentElement.scrollTop;
        if (scrollY > 25 && !isBusyRef.current) {
          setIsHeaderVisible(false);
        }
      }, autoHideDelayMs);
    }
  }, [clearTimer, autoHideDelayMs]);

  // Reveal top header with 1.8s auto-hide timer if after top section
  const showHeader = useCallback(() => {
    setIsHeaderVisible(true);
    startAutoHideTimer();
  }, [startAutoHideTimer]);

  // Hide top header (only when scrolled down past top section)
  const hideHeader = useCallback(() => {
    const currentScrollY = window.scrollY || document.documentElement.scrollTop;
    if (currentScrollY <= 25) {
      setIsHeaderVisible(true);
      return;
    }
    clearTimer();
    if (!isBusyRef.current) {
      setIsHeaderVisible(false);
    }
  }, [clearTimer]);

  // Toggle header (only when scrolled down past top section)
  const toggleHeader = useCallback(() => {
    const currentScrollY = window.scrollY || document.documentElement.scrollTop;
    // At the top of the overall page (<= 25px), header always appears without hiding
    if (currentScrollY <= 25) {
      setIsHeaderVisible(true);
      clearTimer();
      return;
    }

    if (isBusyRef.current) return;

    if (isHeaderVisibleRef.current) {
      clearTimer();
      setIsHeaderVisible(false);
    } else {
      setIsHeaderVisible(true);
      startAutoHideTimer();
    }
  }, [clearTimer, startAutoHideTimer]);

  // Keep header open and clear timer when busy (searching, settings open, refreshing)
  useEffect(() => {
    if (isBusy) {
      clearTimer();
      setIsHeaderVisible(true);
    } else {
      const currentScrollY = window.scrollY || document.documentElement.scrollTop;
      if (currentScrollY > 25 && isHeaderVisibleRef.current) {
        startAutoHideTimer();
      }
    }
  }, [isBusy, clearTimer, startAutoHideTimer]);

  // Scroll detection:
  // - Top section (<= 25px): header appears and stays visible without hiding
  // - After top section (> 25px until bottom):
  //   - Scrolling down -> immediately auto-hides
  //   - Scrolling up -> appears, and auto-hides after 1.8s of inactivity
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY || document.documentElement.scrollTop;
      const lastScrollY = lastScrollYRef.current;
      const diff = currentScrollY - lastScrollY;

      // At the top section of the page, header should stay visible and not auto-hide
      if (currentScrollY <= 25) {
        clearTimer();
        setIsHeaderVisible(true);
        lastScrollYRef.current = currentScrollY;
        return;
      }

      // Scrolling down past top section -> auto-hide immediately
      if (diff > 4) {
        clearTimer();
        if (!isBusyRef.current) {
          setIsHeaderVisible(false);
        }
      } else if (diff < -5) {
        // Scrolling up in content area -> reveal and auto-hide after 1.8 seconds of inactivity
        setIsHeaderVisible(true);
        startAutoHideTimer();
      }

      lastScrollYRef.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimer();
    };
  }, [clearTimer, startAutoHideTimer]);

  // Tap anywhere on content:
  // - If at top section (<= 25px): header appears and does NOT hide
  // - If after top section (> 25px): tapping content toggles header (and if shown, auto-hides after 1.8s)
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Don't toggle on interactive elements, modals, header, or floating controls
      if (
        target.closest('button') ||
        target.closest('a') ||
        target.closest('input') ||
        target.closest('select') ||
        target.closest('textarea') ||
        target.closest('[role="button"]') ||
        target.closest('[role="dialog"]') ||
        target.closest('.leaflet-control') ||
        target.closest('.leaflet-popup') ||
        target.closest('.leaflet-marker-icon') ||
        target.closest('.karnataka-district-rain-pin') ||
        target.closest('header') ||
        target.closest('aside') ||
        target.closest('nav')
      ) {
        // If clicking inside header, reset/pause the auto-hide timer so user can interact
        if (target.closest('header')) {
          clearTimer();
        }
        return;
      }

      const currentScrollY = window.scrollY || document.documentElement.scrollTop;

      // At the top section, it should appear without hiding if tapped
      if (currentScrollY <= 25) {
        clearTimer();
        setIsHeaderVisible(true);
        return;
      }

      // Tapped on content while in content area -> toggle header
      toggleHeader();
    };

    window.addEventListener('click', handleDocumentClick);
    return () => {
      window.removeEventListener('click', handleDocumentClick);
      clearTimer();
    };
  }, [toggleHeader, clearTimer]);

  return {
    isHeaderVisible,
    showHeader,
    hideHeader,
    toggleHeader,
    startAutoHideTimer,
    clearTimer,
  };
}

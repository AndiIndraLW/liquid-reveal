'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './hero.module.css';

export default function ExperimentsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const toggleDropdown = () => setIsOpen((prev) => !prev);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('pointerdown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('pointerdown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const experiments = [
    { name: 'Liquid Reveal', href: '/' },
    { name: 'Image Trail', href: '/image-trail' },
    { name: 'Gallery Transition', href: '/gallery-transition' },
    { name: 'Project Collection', href: '/project-collection' },
    { name: '3D Cylindrical', href: '/3d-cylindrical' },
    { name: 'Scroll Transformation', href: '/scroll-transformation' },
  ];

  return (
    <div className={`${styles.corner} ${styles.cornerTopRight} ${styles.dropdownWrapper}`} ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className={styles.dropdownBtn}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="My other experiments menu"
      >
        <span>MY OTHER EXPERIMENTS</span>
        <svg
          className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}
          width="10"
          height="6"
          viewBox="0 0 10 6"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M1 1L5 5L9 1"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen && (
        <div className={styles.dropdownMenu} role="menu">
          {experiments.map((exp) => {
            const isCurrentPage = pathname === exp.href;
            return (
              <Link
                key={exp.name}
                href={exp.href}
                className={`${styles.dropdownItem} ${isCurrentPage ? styles.dropdownItemActive : ''}`}
                role="menuitem"
                onClick={() => setIsOpen(false)}
              >
                <span className={`${styles.itemDot} ${isCurrentPage ? styles.itemDotActive : ''}`} />
                <span className={styles.itemText}>{exp.name}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

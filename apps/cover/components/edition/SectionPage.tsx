import Image from 'next/image'
import type { ReactNode } from 'react'
import { type Crumb, breadcrumbs } from '@/lib/discovery'
import { StructuredData } from '../StructuredData'
import { EditionLinks } from './EditionLinks'
import './edition.css'
import './discovery.css'

export function SectionPage({ title, crumb, children, ticker, nodes = [] }: {
  title: string; crumb?: Crumb; children: ReactNode; ticker?: ReactNode; nodes?: object[]
}) {
  return <div className="edition-page section-page">
    {crumb && <StructuredData nodes={[breadcrumbs(crumb), ...nodes]} />}
    <header className="head"><div className="wrap mast">
      <div className="nameplate"><a className="brand" href="/">
        <Image src="/hub/wordmark.svg" alt="Make Your Mind Up" width={228} height={22} />
      </a><p className="motto">Creativity, AI and money, simplified.</p></div>
      <a className="sub-btn" href="https://home.makeyourmindup.ai/subscribe">Subscribe</a>
    </div>{ticker}</header>
    <main className="wrap section-body">
      <h1>{title}</h1>
      {children}
    </main>
    <footer className="wrap"><EditionLinks /></footer>
  </div>
}

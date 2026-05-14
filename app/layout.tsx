import './globals.css';
import { Nav } from '@/components/Nav';
import { BrandShell } from '@/components/brand';
export const metadata={title:'RocketRolla Catalog Intelligence Engine',description:'Infrastructure for independent artists'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang='en'><body><BrandShell><header className='py-8'><p className='text-sm uppercase tracking-[0.25em] text-primary'>RocketRolla</p><h1 className='mt-2 text-4xl font-semibold'>Catalog Intelligence Engine</h1><p className='mt-2 text-muted-foreground'>Official internal product • Infrastructure for independent artists</p></header><Nav/>{children}</BrandShell></body></html>}


import Header from '@/components/header/header';
import NoticeBar from '@/components/header/noticebar';
import React from 'react'

const layout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <div className='flex flex-col h-full'>
        <Header />
        <NoticeBar />
        <main className="flex-1">{children}</main>
    </div>
  )
}

export default layout
import React from 'react'

export const metadata = {
  description: 'Track lifts, routines, nutrition and progress in a notebook.',
  title: 'Iron Notebook',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{props.children}</body>
    </html>
  )
}

import Link from 'next/link'
 
function Home() {
  return (
    <ul>
      <li>
        <Link href="/">Home</Link>
      </li>
      <li>
        <Link href="/page_">page</Link>
      </li>
      <li>
        <Link href="/page_rgb">page_rgb</Link>
      </li>
    </ul>
  )
}
 
export default Home
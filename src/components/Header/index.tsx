import Image from 'next/image'
import Link from 'next/link'
import classes from './header.module.scss'


export default function Header() {
  return (
    <div className={classes.container}>
      <header className={classes.content}>
        <Link href='/'>
          <a>
            <Image
              src="/img/Logo.svg"
              alt="logo"
              width={240}
              height={26}
            />
          </a>
        </Link>
      </header>
    </div>
  )
}

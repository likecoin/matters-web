import { useContext, useEffect } from 'react'

import { Head } from '~/components'
import { HeaderContext } from '~/components/GlobalHeader/Context'

import { TEXT } from '~/common/enums'

import Features from './Features'
import Footer from './Footer'
import Goal from './Goal'
import Reports from './Reports'
import Slogan from './Slogan'
import styles from './styles.css'

const About = () => {
  const { updateHeaderState } = useContext(HeaderContext)

  useEffect(() => {
    updateHeaderState({ type: 'about', bgColor: 'transparent' })
    return () => updateHeaderState({ type: 'default' })
  }, [])

  return (
    <main>
      <Head
        title={{ zh_hant: TEXT.zh_hant.about, zh_hans: TEXT.zh_hans.about }}
      />

      <article>
        <Slogan />
        <Goal />
        <Features />
        <Reports />
        <Footer />
      </article>

      <style jsx>{styles}</style>
    </main>
  )
}

export default About
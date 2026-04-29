import Link from 'next/link'
import {Col} from 'web/components/layout/col'
import {PageBase} from 'web/components/page-base'
import {SEO} from 'web/components/SEO'
import {Title} from 'web/components/widgets/title'
import {useT} from 'web/lib/locale'

export const NOT_FOUND_TEXTS = {
  profileNotFound: 'Profile not found.',
} as const

export default function Custom404(props: {customText?: string}) {
  // console.log('props:', props)
  return (
    <PageBase hideSidebar={true}>
      <SEO title={'Not Found'} description={'Not Found'} url={`/404`} />
      <Custom404Content customText={props.customText} />
    </PageBase>
  )
}

export function Custom404Content(props: {customText?: string}) {
  const {customText} = props
  const t = useT()

  return (
    <div className="flex h-[50vh] flex-col items-center justify-center">
      <Col className="mx-4">
        <Title>{t('404.title', 'Page Not Found')}</Title>
        {customText && (
          <p>
            {t(
              `custom404.${customText}`,
              NOT_FOUND_TEXTS[customText as keyof typeof NOT_FOUND_TEXTS] ?? customText,
            )}
          </p>
        )}
        <p className="custom-link">
          {t('404.help_text', "If you didn't expect this, try to reload the page or go back ")}
          <Link href={'/'}>{t('', 'home').toLowerCase()}</Link>.
        </p>

        {/*<Link href="/">*/}
        {/*  <Button className="mt-6">Go home</Button>*/}
        {/*</Link>*/}
      </Col>
    </div>
  )
}

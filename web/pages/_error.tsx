import type {NextPageContext} from 'next'
import NextErrorComponent from 'next/error'

type ErrorProps = {
  statusCode: number
}

export default function CustomError({statusCode}: ErrorProps) {
  return <NextErrorComponent statusCode={statusCode} />
}

CustomError.getInitialProps = async (ctx: NextPageContext) => {
  return NextErrorComponent.getInitialProps(ctx)
}

import '@/styles/globals.css'
import '@/styles/loader.css'
import "react-toastify/dist/ReactToastify.css";

import type { AppProps } from 'next/app'
import { Saira, Rajdhani } from '@next/font/google'
import {ApolloClient, ApolloProvider, createHttpLink, InMemoryCache} from "@apollo/client";

import {API_URL} from "@/globals";
import {LoaderContext} from "@/contexts/loader";
import {ToastContainer} from "react-toastify";
import {LoginContext} from "@/contexts/login";
import {NextPage} from "next";
import {ReactElement, ReactNode} from "react";

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
    getLayout?: (page: ReactElement) => ReactNode
}
type AppPropsWithLayout = AppProps & {
    Component: NextPageWithLayout
}

const saira = Saira({subsets: ["latin"]})
const rajdhani = Rajdhani({weight: ["300", "400", "500", "600", "700"], subsets: ["latin", "latin-ext"]})

const link = createHttpLink({
    uri: API_URL,
    credentials: 'include'
});
const client = new ApolloClient({
    link,
    cache: new InMemoryCache(),
});

export default function App({ Component, pageProps }: AppPropsWithLayout) {
    const getLayout = Component.getLayout ?? ((page) => page)

    return (
        <>
            <style jsx global>
                {`
                  :root {
                      --saira: ${saira.style.fontFamily};
                      --rajdhani: ${rajdhani.style.fontFamily}
                  }
                `}
            </style>
            <ApolloProvider client={client}>
                <ToastContainer
                    position="top-right"
                    autoClose={5000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="dark"
                />
                <LoaderContext>
                    <LoginContext>
                        {getLayout(<Component {...pageProps} />)}
                    </LoginContext>
                </LoaderContext>
            </ApolloProvider>
        </>
    )
}

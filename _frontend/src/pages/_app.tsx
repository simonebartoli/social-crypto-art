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
import {Config, DAppProvider, Goerli, Hardhat, Mainnet, MetamaskConnector} from "@usedapp/core";
import {LayoutContext} from "@/contexts/layout";
import {ModalContext} from "@/contexts/modal";

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

const config: Config = {
    networks: [Hardhat, Mainnet, Goerli],
    readOnlyChainId: Hardhat.chainId,
    multicallAddresses: {
        // [Hardhat.chainId]: "0x5fc8d32690cc91d4c39d9d3abcbd16989f875707"
    },
    readOnlyUrls: {
        [Hardhat.chainId]: "http://127.0.0.1:8545/"
        // [Mainnet.chainId]: "https://mainnet.infura.io/v3/257845b2fe3e409a95d49b37958d8f74",
        // [Goerli.chainId]: "https://goerli.infura.io/v3/257845b2fe3e409a95d49b37958d8f74",
    },
    connectors: {
        metamask: new MetamaskConnector()
    },
    autoConnect: false
}

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
                <LayoutContext>
                    <LoaderContext>
                        <LoginContext>
                            <DAppProvider config={config}>
                                <ModalContext>
                                    {getLayout(<Component {...pageProps} />)}
                                </ModalContext>
                            </DAppProvider>
                        </LoginContext>
                    </LoaderContext>
                </LayoutContext>
            </ApolloProvider>
        </>
    )
}

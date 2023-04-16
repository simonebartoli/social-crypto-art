import '@/styles/globals.css'
import '@/styles/loader.css'
import "react-toastify/dist/ReactToastify.css";

import type {AppProps} from 'next/app'
import {Rajdhani, Saira} from '@next/font/google'
import {ApolloClient, ApolloProvider, createHttpLink, InMemoryCache} from "@apollo/client";

import {API_URL, CHAIN, JSON_RPC, MULTICALL_ADDRESS} from "@/globals";
import {LoaderContext} from "@/contexts/loader";
import {ToastContainer} from "react-toastify";
import {LoginContext} from "@/contexts/login";
import {NextPage} from "next";
import {ReactElement, ReactNode} from "react";
import {Config, DAppProvider, Hardhat, MetamaskConnector, Sepolia} from "@usedapp/core";
import {LayoutContext} from "@/contexts/layout";
import {ModalContext} from "@/contexts/modal";
import Web3Account from "@/components/library/web3-account";
import {SearchBarContext} from "@/contexts/search-bar";
import {Web3Info} from "@/contexts/web3-info";

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
export const apolloClient = new ApolloClient({
    link,
    cache: new InMemoryCache(),
});

const config: Config = {
    networks: CHAIN === "LOCAL" ? [Hardhat] : [Sepolia],
    readOnlyChainId: CHAIN === "LOCAL" ? Hardhat.chainId : Sepolia.chainId,
    multicallAddresses: CHAIN === "LOCAL" ?
        {
            [Hardhat.chainId]: MULTICALL_ADDRESS
        } :
        {
            [Sepolia.chainId]: MULTICALL_ADDRESS
        },
    readOnlyUrls: CHAIN === "LOCAL" ?
        {
            [Hardhat.chainId]: JSON_RPC
        } :
        {
            [Sepolia.chainId]: JSON_RPC
        },
    connectors: {
        metamask: new MetamaskConnector(),
    },
    autoConnect: true
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
            <ApolloProvider client={apolloClient}>
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
                                <Web3Info>
                                    <ModalContext>
                                        <SearchBarContext>
                                            <Web3Account>
                                                {getLayout(<Component {...pageProps} />)}
                                            </Web3Account>
                                        </SearchBarContext>
                                    </ModalContext>
                                </Web3Info>
                            </DAppProvider>
                        </LoginContext>
                    </LoaderContext>
                </LayoutContext>
            </ApolloProvider>
        </>
    )
}

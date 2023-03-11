import React from 'react';
import {NextPage} from "next";
import {useBlockchainCallbackPostsContext} from "@/contexts/blockchain-callback";
import BlockchainInteraction from "@/components/library/blockchain-interaction";

type Props = {
    interactions: JSX.Element[]
}

const BlockchainWrapper: NextPage<Props> = ({interactions}) => {
    const {operations, indexAllowed} = useBlockchainCallbackPostsContext()

    return (
        <>
            {
                interactions.map((_, index) => {
                    if(indexAllowed.includes(index)){
                        return (
                            <React.Fragment key={index}>
                                {_}
                            </React.Fragment>
                        )
                    }
                })
            }
            {
                <BlockchainInteraction
                    finished={operations.length === 0}
                    operations={operations}
                />
            }
        </>
    );
};

export default BlockchainWrapper;
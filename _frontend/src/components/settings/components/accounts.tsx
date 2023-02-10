import React from 'react';
import {NextPage} from "next";

type Props = {
    accounts: {
        address: string
        name: string
    }[]
}

const Accounts: NextPage<Props> = ({accounts}) => {
    return (
        <>
            {
                accounts.length > 0 ?
                accounts.map(_ =>
                    <div key={_.address} className="flex flex-col items-center justify-center w-full gap-6">
                        <div className="border-4 border-white w-full text-xl rounded-lg w-full flex flex-row justify-between items-center bg-black text-white p-3">
                            <div className="flex flex-col gap-2 rounded-lg">
                                <span className="font-bold">Account Address</span>
                                <span>{_.address}</span>
                            </div>
                            <span className="text-2xl font-bold">{_.name}</span>
                        </div>
                    </div>
                ) :
                <>
                    <div className="rounded-lg p-4 w-full bg-custom-light-grey text-black flex items-center justify-center">
                        <span className="text-2xl">You don&apos;t have any Web3 account associated yet</span>
                    </div>
                </>
            }
        </>
    );
};

export default Accounts;
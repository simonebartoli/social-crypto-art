import React, {useEffect, useState} from 'react';
import {useRouter} from "next/router";
import {useLoader} from "@/contexts/loader";
import {useMutation} from "@apollo/client";
import {VERIFY_TOKEN} from "@/graphql/access";

const Verify = () => {
    const [error, setError] = useState(false)

    const router = useRouter()
    const {changeLoading} = useLoader()
    const [enableToken] = useMutation(VERIFY_TOKEN, {
        fetchPolicy: "no-cache",
        onCompleted: () => {
            changeLoading(false)
        },
        onError: () => {
            changeLoading(false)
            setError(true)
        }
    })

    useEffect(() => {
        changeLoading(true)
    }, [])
    useEffect(() => {
        if(router.isReady){
            const token = router.query["token"] as string
            const isNewAccount = (/true/).test(router.query["new_account"] as string)

            enableToken({
                variables: {
                    data: {
                        token: token,
                        isNewAccount: isNewAccount
                    }
                }
            })
        }
    }, [router])

    return (
        <div className="bg-custom-grey w-screen h-screen flex flex-col items-center justify-center text-white font-main">
            <div className="flex items-center justify-center flex-col gap-4 min-w-[35%]">
                <h2 className="text-4xl p-8 border-2 border-white bg-black w-full text-center">
                    {
                        error ?
                        "There is a problem with your request":
                        "Your Session Has Been Authorized"
                    }
                </h2>
                <p className="p-4 w-full bg-custom-light-grey text-black">
                    {
                        error ?
                        "Your session has not been authorized. Please try again checking you click the correct updated link in your email. You can close this tab.":
                        "The token provided is valid and your session has been approved. Please go back to your existing session. You can close this tab now."
                    }
                </p>
            </div>
        </div>
    );
};

export default Verify;
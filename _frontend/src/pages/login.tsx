import React, {ReactElement, useState} from 'react';
import Main from "@/components/login/tabs/main";
import {LoginEnum} from "@/enums/local/login-enum";
import Register from "@/components/login/tabs/register";
import Confirmation from "@/components/login/tabs/confirmation";
import LoginWithEmail from "@/components/login/tabs/login-with-email";
import RequireNotLogin from "@/components/library/auth/require-not-login";
import LoginWithWeb3 from "@/components/login/tabs/login-with-web3";

const Login = () => {
    const [tabToShow, setTabToShow] = useState<LoginEnum>(LoginEnum.MAIN)
    const changeTab = (selected: LoginEnum) => {
        setTabToShow(selected)
    }

    return (
        <div className="flex flex-col items-center justify-center bg-custom-grey min-h-screen font-main p-4">
            <div className="border-2 border-white rounded-lg min-w-[35%] max-w-[40%]">
                <div className="flex flex-col gap-12 bg-white p-12 rounded-lg text-xl shadow-white border-4 border-black">
                    {
                        tabToShow === LoginEnum.MAIN ?
                        <Main changeTab={changeTab}/> :
                        tabToShow === LoginEnum.REGISTER ?
                        <Register changeTab={changeTab}/> :
                        tabToShow === LoginEnum.CONFIRMATION ?
                        <Confirmation changeTab={changeTab}/> :
                        tabToShow === LoginEnum.EMAIL ?
                        <LoginWithEmail changeTab={changeTab}/> :
                        tabToShow === LoginEnum.WEB3 &&
                        <LoginWithWeb3 changeTab={changeTab}/>
                    }
                </div>
            </div>
        </div>
    );
};

Login.getLayout = function getLayout(page: ReactElement) {
    return (
        <RequireNotLogin>
            {page}
        </RequireNotLogin>
    )
}

export default Login;
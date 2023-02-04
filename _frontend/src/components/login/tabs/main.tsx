import React from 'react';
import Button from "@/components/login/button";
import MailOutlineOutlinedIcon from "@mui/icons-material/MailOutlineOutlined";
import CloudOutlinedIcon from "@mui/icons-material/CloudOutlined";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import {NextPage} from "next";
import {LoginEnum} from "@/enums/local/login-enum";

type Props = {
    changeTab: (selected: LoginEnum) => void
}

const Main: NextPage<Props> = ({changeTab}) => {
    return (
        <>
            <div className="flex flex-col gap-6">
                <h2 className="text-3xl font-semibold">Already Registered?</h2>
                <Button onClick={() => changeTab(LoginEnum.EMAIL)} text={"Login with your email"} icon={<MailOutlineOutlinedIcon/>}/>
                <Button onClick={() => changeTab(LoginEnum.WEB3)} text={"Login with Web3 Account"} icon={<CloudOutlinedIcon/>}/>
            </div>
            <div className="flex flex-col gap-6">
                <h2 className="text-3xl font-semibold">Not Registered Yet?</h2>
                <Button onClick={() => changeTab(LoginEnum.REGISTER)} text={"Register Now"} icon={<AddCircleOutlineOutlinedIcon/>}/>
            </div>
        </>
    );
};

export default Main;
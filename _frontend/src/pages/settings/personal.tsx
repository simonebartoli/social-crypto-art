import React, {ChangeEvent, ReactElement, useEffect, useRef, useState} from 'react';
import RequireLogin from "@/components/library/auth/require-login";
import Navbar from "@/components/settings/navbar";
import Image from "next/image";
import TEST from "../../../public/test.webp";
import PermIdentityOutlinedIcon from "@mui/icons-material/PermIdentityOutlined";
import MailOutlineOutlinedIcon from "@mui/icons-material/MailOutlineOutlined";
import {useLogin} from "@/contexts/login";
import BorderColorIcon from '@mui/icons-material/BorderColor';

const Personal = () => {
    const {personalInfo} = useLogin()
    const imageInputRef = useRef<HTMLInputElement>(null)

    const [onImageHover, setOnImageHover] = useState(false)
    const [fileImage, setFileImage] = useState<Blob>()

    const onImageChangeClick = () => {
        if(onImageHover && imageInputRef.current !== null){
            imageInputRef.current.click()
        }
    }
    const onFileImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if(file){

        }
    }

    useEffect(() => {

    })

    return (
        <div className="flex flex-col items-center justify-start gap-32">
            <div className="flex flex-row items-center justify-center w-3/4 gap-16">
                <div onClick={onImageChangeClick} onMouseEnter={() => setOnImageHover(true)} onMouseLeave={() => setOnImageHover(false)} className={`${onImageHover && "cursor-pointer"} relative w-[200px] h-[200px] rounded-2xl overflow-hidden p-2 border-4 border-white`}>
                    <Image fill={true} style={{objectFit: "fill"}} src={TEST} alt={""}/>
                    <input onChange={onFileImageChange} ref={imageInputRef} type="file" accept="image/jpeg, image/png" className="hidden"/>
                    {
                        onImageHover &&
                        <>
                            <BorderColorIcon className="absolute !text-4xl text-white top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 z-40"/>
                            <div className="absolute opacity-50 w-[200px] h-[200px] -translate-x-[0.5rem] -translate-y-[0.5rem] bg-black z-30"/>
                        </>
                    }
                </div>
                <div className="rounded-lg bg-custom-light-grey p-6 py-16 text-lg  w-[calc(80%-200px)] flex items-center justify-center">
                    Future Bio Arriving...
                </div>
            </div>
            <div className="flex flex-col gap-16 w-3/4 w-full items-start justify-center">
                <div className="flex flex-col text-3xl items-start justify-center gap-4 text-white w-full">
                    <span className="flex flex-row gap-4 text-2xl items-center justify-center">
                        <PermIdentityOutlinedIcon className="!text-3xl"/>
                        Nickname
                    </span>
                    <span className="p-4 w-full bg-black rounded-lg">
                        {
                            personalInfo !== null && personalInfo.nickname
                        }
                    </span>
                </div>
                <div className="flex flex-col text-3xl items-start justify-center gap-4 text-white w-full">
                    <span className="flex flex-row gap-4 text-2xl items-center justify-center">
                        <MailOutlineOutlinedIcon className="!text-3xl"/>
                        Email
                    </span>
                    <span className="p-4 w-full bg-black rounded-lg">
                        {
                            personalInfo !== null && personalInfo.email
                        }
                    </span>
                </div>
            </div>
        </div>
    );
};

Personal.getLayout = function getLayout(page: ReactElement) {
    return (
        <RequireLogin>
            <div className="w-full flex flex-row min-h-screen bg-custom-grey font-main">
                <Navbar/>
                <div className="relative top-0 left-[25%] w-3/4 p-8 bg-custom-grey">
                    {page}
                </div>
            </div>
        </RequireLogin>
    )
}

export default Personal;
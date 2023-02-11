import React from 'react';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';

const NavbarTop = () => {
    return (
        <div className="shadow-lg border-b-2 border-x-2 border-custom-grey flex z-50 flex-row font-main rounded-b-lg justify-between items-center gap-16 fixed top-0 left-[7.5%] bg-custom-light-grey w-[90%] py-3 px-8 h-[10vh]">
            <div className="flex flex-row gap-8 items-center justify-center">
                <div className="text-2xl">
                    <span>Hello, Micheal</span>
                </div>
                <span className="w-[30px] bg-black h-[1px]"/>
                <button className="hover:bg-white hover:text-black transition border-[1px] shadow-lg border-black rounded-lg p-2 bg-black text-white text-center">
                    Connect Now
                </button>
            </div>
            <NotificationsNoneOutlinedIcon className="!text-3xl"/>
        </div>
    );
};

export default NavbarTop;
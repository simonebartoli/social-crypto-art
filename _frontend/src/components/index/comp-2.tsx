import React from 'react';
import Image from "next/image";
import BalloonImage from "../../../public/baloon.jpg";

const Comp2 = () => {
    return (
        <div className="comp2 w-screen bg-[#ececec] h-screen flex flex-row items-center justify-center p-4 gap-16">
            <div className="w-1/2 flex items-center justify-center">
                <Image className="w-3/4 shadow-2xl" src={BalloonImage} alt={""}/>
            </div>
            <div className="w-1/2 flex flex-col items-start justify-center font-main">
                <p className="text-lg leading-[2.75rem] w-3/4">
                    Welcome to <span className="evidence">Social Crypto Art</span>,
                    the ultimate social network that enables you to <span className="evidence">showcase your true self</span>
                    and express your creativity to the world.
                    Here, you can freely share your notes, photographs, and everything in between,
                    without any judgment or restriction.
                    With our platform, <span className="evidence">you can credit your value to your work</span> and collaborate with like-minded individuals to build a thriving community.
                </p>
                <p className="text-lg leading-[2.75rem] w-3/4">
                    <span className="evidence">Dive into the app and unleash your inner artist</span>.
                    Explore and discover your unique style, while empowering yourself by assigning value to your contributions.
                    <span className="evidence">Join us now</span> and experience the joy of self-expression like never before.
                </p>
            </div>
        </div>
    );
};

export default Comp2;
import React from 'react';
import Image from "next/image";
import TEST from "../../../../public/test.webp";

const Comment = () => {
    return (
        <div className="w-full flex flex-col gap-3 p-4 bg-custom-light-grey rounded-lg">
            <div className="flex flex-col gap-2 items-start justify-center">
                <div className="flex flex-row gap-3 items-center justify-start">
                    <div className="relative h-[35px] w-[35px] rounded-xl overflow-hidden">
                        <Image
                            src={TEST}
                            fill={true}
                            style={{objectFit: "contain"}}
                            alt={""}
                        />
                    </div>
                    <span className="text-lg bg-black py-1 px-2 text-white rounded-lg">simo2001</span>
                </div>
                <span className="text-custom-grey">20 December 2023 at 15:15</span>
            </div>
            <div>
                <p>
                    Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry&apos;s standard dummy text ever since the 1500s.
                </p>
            </div>
        </div>
    );
};

export default Comment;
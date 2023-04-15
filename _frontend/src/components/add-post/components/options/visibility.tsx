import React, {ChangeEvent, useEffect} from 'react';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import CloseIcon from '@mui/icons-material/Close';

import TEST from "/public/test.webp"
import Image from "next/image";
import {useAddPostInfo} from "@/contexts/add-post-info";
import {AddPostTypeEnum} from "@/enums/local/add-post-enum";
import {Visibility as VisibilityEnum} from "@/__generated__/graphql"

const Visibility = () => {
    const {visibility, postType} = useAddPostInfo()
    // const [searchResult, setSearchResult] = useState()

    const onValueChange = (e: ChangeEvent<HTMLSelectElement>) => {
        visibility.set(e.target.value)
    }

    useEffect(() => {
        if(postType.value !== AddPostTypeEnum.POST){
            visibility.set(VisibilityEnum.Public)
        }
    }, [postType])

    return (
        <div className="p-4 bg-black text-white rounded-lg flex flex-col items-center justify-center w-full gap-8">
            <div className="flex flex-col gap-2 items-center justify-center w-full">
                <div className="flex text-xl flex-row gap-4 items-center justify-start w-full">
                    <span>Visibility: </span>
                    <select value={visibility.value} onChange={onValueChange} className="p-2 bg-white text-black">
                        <option value={VisibilityEnum.Public}>PUBLIC</option>
                        {
                            postType.value === AddPostTypeEnum.POST &&
                            <>
                                <option value={VisibilityEnum.Restricted}>RESTRICTED</option>
                                <option value={VisibilityEnum.Private}>PRIVATE</option>
                            </>
                        }
                    </select>
                </div>
                <span className="italic text-sm w-full">
                {
                    visibility.value === VisibilityEnum.Public ?
                        "Everyone will be able to see your post" :
                        visibility.value === VisibilityEnum.Restricted ?
                            "Only the people specified below will be able to see your post" :
                            "You are the only one who can see the post"
                }
            </span>
            </div>
            {
                visibility.value === VisibilityEnum.Restricted &&
                <>
                    <div className="w-full h-[1px] border-t-[1px] border-custom-light-grey"/>
                    <div className="flex flex-col gap-2 w-full">
                        <div className="flex items-center justify-start flex flex-row gap-4 w-full">
                            <span className="w-1/4">Search for users: </span>
                            <div className="relative text-black p-1 w-2/3 rounded-lg bg-white flex flex-row justify-between items-center">
                                <input type="text" className="w-[90%] p-2 outline-none" placeholder="Insert the nickname here..."/>
                                <SearchOutlinedIcon className="absolute top-1/2 -translate-y-1/2 right-[2.5%] !text-2xl cursor-pointer"/>
                            </div>
                        </div>
                        <div className="flex items-center justify-start flex flex-row gap-4 w-full">
                            <div className="w-1/4"/>
                            <div className="flex flex-col items-start justify-center w-2/3 bg-custom-light-grey text-black w-full">
                                <div className="hover:bg-white cursor-pointer transition p-3 flex flex-row gap-4 items-center w-full">
                                    <div className="w-[40px] h-[40px] relative rounded-lg overflow-hidden">
                                        <Image src={TEST} alt={""} fill={true} style={{objectFit: "contain"}}/>
                                    </div>
                                    <span>simo2001</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-row flex-wrap gap-x-6 gap-y-2 w-full">
                        {
                            new Array(0).fill([]).map((_, index) =>
                                <div key={index} className="bg-white rounded-lg text-black cursor-pointer transition p-2 px-4 flex flex-row gap-4 items-center">
                                    <div className="w-[40px] h-[40px] relative rounded-lg overflow-hidden">
                                        <Image src={TEST} alt={""} fill={true} style={{objectFit: "contain"}}/>
                                    </div>
                                    <span>simo2001</span>
                                    <CloseIcon className="hover:text-custom-red transition"/>
                                </div>
                            )
                        }
                    </div>
                </>
            }
        </div>
    );
};

export default Visibility;
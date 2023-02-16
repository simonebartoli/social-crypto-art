import React, {useRef} from 'react';

const IsNft = () => {
    const inputRef = useRef<HTMLInputElement>(null)

    const onClick = () => {
        if(inputRef.current !== null){
            inputRef.current.click()
        }
    }

    return (
        <div className="flex flex-row items-center justify-center gap-4 bg-white p-4 rounded-lg text-lg w-full text-black">
            <input ref={inputRef} type="checkbox"/>
            <span onClick={onClick} className="cursor-pointer select-none">is an NFT</span>
        </div>
    );
};

export default IsNft;
import React, {useState} from 'react';

const FixedPriceSelling = () => {
    const [interactWithBlockchain, setInteractWithBlockchain] = useState(false)

    if(interactWithBlockchain){
        // return <BlockchainWrapper
        //     nft_id={"5"}
        // />
    }

    return (
        <div className="h-full flex flex-col items-center justify-start font-main gap-6 w-full">
            <h2 className="text-4xl font-bold">Information and Selling NFT</h2>
            <div className="flex grid grid-cols-3 gap-4 justify-center items-center gap-4 bg-custom-light-grey p-4 rounded-lg w-full">
                <span className="text-xl font-bold">PARAMETER</span>
                <span className="col-span-2 text-xl font-bold">VALUE</span>
                <span className="text-lg">NFT ID:</span>
                <span className="col-span-2 text-lg font-bold">12</span>
                <span className="text-lg">SELLER:</span>
                <span className="col-span-2 text-lg font-bold">0xB1DC64EE0133377ab6BE5b4917668d532bd8e35A</span>
                <span className="text-lg">CREATOR:</span>
                <span className="col-span-2 text-lg font-bold">0xB1DC64EE0133377ab6BE5b4917668d532bd8e35A</span>
                <span className="col-span-3 w-full border-t-[1px] border-custom-grey"/>
                <span>SELLING PRICE:</span>
                <span className="col-span-2 text-lg font-bold">5.30 DAI</span>
                <span>CURRENCY:</span>
                <span className="col-span-2 text-lg font-bold">DAI (0x6B175474E89094C44Da98b954EedeAC495271d0F)</span>
                <span className="col-span-3 w-full border-t-[1px] border-custom-grey"/>
                <span>TX CONTRACT (SocialNFT):</span>
                <span className="col-span-2 text-lg font-bold">0x6B175474E89094C44Da98b954EedeAC495271d0F</span>
            </div>
            <button onClick={() => setInteractWithBlockchain(true)} className="hover:bg-white hover:text-black transition p-4 bg-black text-white rounded-lg border-[1px] border-black w-full">
                Buy Now
            </button>
        </div>
    );
};

export default FixedPriceSelling;
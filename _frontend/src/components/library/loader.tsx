import React from 'react';

const Loader = () => {
    return (
        <div className="fixed top-0 left-0 flex items-center justify-center h-screen w-screen bg-custom-grey z-[9999]">
            <div className="lds-ellipsis">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
            </div>
        </div>
    );
};

export default Loader;
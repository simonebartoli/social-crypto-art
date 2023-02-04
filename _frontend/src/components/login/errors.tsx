import React from 'react';
import {NextPage} from "next";

type Props = {
    errors: string[]
}

const Errors: NextPage<Props> = ({errors}) => {
    return (
        <>
            {
                errors.length > 0 &&
                <div className="p-4 bg-custom-light-grey rounded-lg text-base mb-3 mt-2">
                    {
                        errors.map((_, index) =>
                            <li key={index} className="list-inside">{_}</li>
                        )
                    }
                </div>
            }
        </>
    );
};

export default Errors;
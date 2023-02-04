import {useRouter} from "next/router";

export default function Home() {
    const router = useRouter()

    return (
        <div className="text-white flex items-center justify-center flex-col gap-20 h-screen bg-custom-grey font-main">
            <h1 className="font-title text-6xl tracking-[1rem]">Social Crypto Art</h1>
            <h2 className="text-4xl tracking-[0.5rem]">“Value what you are”</h2>
            <button onClick={() => router.push("/login")} className="hover:bg-white hover:text-black transition duration-300 px-8 py-4 bg-black rounded-full text-3xl">
                Launch the App
            </button>
        </div>
    )
}

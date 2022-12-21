import { SVG } from "../SVG"

export function Box() {
    return (
        <div id="box" className=" border border-border rounded-md gap-14 items-center justify-around  p-5 mb-4 flex h-full w-5/6 max-w-3xl mt-20 ">
            <figure aria-label="Star Wars Logo">
                <SVG height={'85px'} width={'85px'} />
            </figure>
            <div id="Container text" className="flex flex-items-start text-left flex-col">
                <h1 id="title" className="font-bold text-link">SW WIKI</h1>
                <h2 id="subtitle">A global Wiki of Star Wars Universe!</h2>
            </div>

        </div>
    );
}